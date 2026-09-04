/*
 * cloud-basics.js - Modul 12: Cloud-Grundlagen (Azure/M365 RBAC & Lizenzierung)
 * Konzept-Erklärung + ein schwierigkeitsgestuftes Quiz zu Rollenwahl
 * (Least Privilege) und Lizenzierungs-Entscheidungen.
 */

const MODULE_ID = "cloudbasics";

const QUIZ = [
  {
    difficulty: "easy",
    question:
      "Eine Firma nutzt Microsoft 365 (SaaS) für E-Mail und Office-Anwendungen. Wer ist dafür verantwortlich, dass die zugrundeliegenden Server und das Betriebssystem gepatcht sind?",
    options: [
      "Microsoft (der Cloud-Anbieter) - bei SaaS liegen Infrastruktur, Betriebssystem und die Anwendung selbst in der Verantwortung des Anbieters",
      "Die Firma selbst muss dafür eigene Administratoren mit Serverzugriff einstellen",
      "Niemand - bei SaaS gibt es technisch keine Server mehr, um die man sich kümmern müsste",
    ],
    correctIndex: 0,
    explanation:
      "Bei SaaS übernimmt der Anbieter fast die komplette Verantwortung bis hinauf zur Anwendung - der Kunde bleibt aber weiterhin selbst für Daten, Zugriffsrechte und Konfiguration innerhalb der Anwendung verantwortlich.",
  },
  {
    difficulty: "easy",
    question:
      "Worin unterscheidet sich IaaS (z.B. eine Azure-VM) grundlegend von PaaS (z.B. Azure App Service)?",
    options: [
      "Bei IaaS verwaltet der Kunde noch selbst Betriebssystem und Laufzeitumgebung, bei PaaS übernimmt das der Anbieter - der Kunde kümmert sich nur noch um seine Anwendung und Daten",
      "IaaS und PaaS sind technisch identisch, nur die Bezeichnung unterscheidet sich",
      "PaaS bietet grundsätzlich weniger Funktionen als IaaS",
    ],
    correctIndex: 0,
    explanation:
      "Mit steigendem Servicegrad (IaaS → PaaS → SaaS) übernimmt der Anbieter jeweils mehr Verantwortung - bei PaaS muss sich der Kunde z.B. nicht mehr um Betriebssystem-Updates kümmern, nur noch um seinen eigenen Code und seine Daten.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Unternehmen möchte eine Sicherheitsrichtlinie für ALLE seine Azure-Abonnements gleichzeitig durchsetzen, ohne sie in jedem Abonnement einzeln einzurichten. Auf welcher Ebene der Ressourcenhierarchie ist das am sinnvollsten?",
    options: [
      "Auf Ebene der Management Group, die mehrere Abonnements zusammenfasst - die Richtlinie vererbt sich automatisch an alle darunterliegenden Abonnements",
      "Auf Ebene einer einzelnen Ressourcengruppe, das reicht für die gesamte Firma aus",
      "Richtlinien müssen bei Azure zwingend für jedes Abonnement einzeln konfiguriert werden",
    ],
    correctIndex: 0,
    explanation:
      "Management Groups sitzen in der Hierarchie über den Abonnements und sind genau für konzernweite Richtlinien gedacht - eine Zuweisung dort vererbt sich automatisch nach unten.",
  },
  {
    difficulty: "medium",
    question:
      "Wie unterscheidet sich \"PIM for Groups\" vom klassischen PIM für einzelne Rollen, wenn ein neues Teammitglied Zugriff auf mehrere zusammengehörige Rollen braucht?",
    options: [
      "Bei PIM for Groups reicht die Aufnahme in EINE Gruppe, die bereits mit allen benötigten Rollen verknüpft ist - ohne PIM for Groups müsste jede Rolle einzeln pro Person eingerichtet werden",
      "PIM for Groups funktioniert nur mit genau einer einzigen Rolle, nie mit mehreren gleichzeitig",
      "PIM for Groups ersetzt MFA und Genehmigungs-Workflows vollständig",
    ],
    correctIndex: 0,
    explanation:
      "Der Vorteil von PIM for Groups liegt genau in der Bündelung: eine Gruppe kann mit mehreren Entra-ID- und Azure-Rollen gleichzeitig verknüpft werden, wodurch neue Mitglieder nur einmal (zur Gruppe) statt mehrfach (zu jeder Rolle) hinzugefügt werden müssen.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Unternehmen mit 500 Mitarbeitenden möchte eine integrierte Endpoint-Detection-and-Response(EDR)-Lösung ohne separate Zusatzlizenz. Warum reicht Microsoft 365 E3 dafür allein NICHT aus?",
    options: [
      "E3 enthält kein integriertes fortgeschrittenes EDR-Paket - das gibt es erst ab E5 oder als gezielte Zusatzlizenz (z.B. Defender for Endpoint P2)",
      "E3 hat grundsätzlich eine Obergrenze von 300 Nutzern und scheidet daher aus",
      "EDR ist ausschliesslich in Microsoft 365 Business Premium enthalten, nie in einem Enterprise-Plan",
    ],
    correctIndex: 0,
    explanation:
      "Ein verbreiteter Irrtum: E3 wirkt umfangreicher als Business Premium, bringt aber kein vergleichbares integriertes EDR mit - Business Premium enthält dafür bereits Defender for Business, während E3-Kunden für vollwertiges EDR auf E5 oder eine gezielte Zusatzlizenz upgraden müssen.",
  },
  {
    difficulty: "easy",
    question:
      "Ein Mitarbeiter im Helpdesk soll Passwörter für normale Nutzer zurücksetzen können, aber sonst nichts verwalten dürfen. Welche Rolle passt am besten?",
    options: [
      "Helpdesk Administrator - darf gezielt Passwörter für normale Nutzer (nicht für andere Admins) zurücksetzen",
      "Global Administrator - hat uneingeschränkten Zugriff auf sämtliche Dienste und Einstellungen des Tenants",
      "User Administrator - darf zusätzlich Benutzerkonten anlegen, löschen und Lizenzen zuweisen",
      "Exchange Administrator - verwaltet Postfächer und Mailflow-Regeln, nicht Passwörter allgemein",
    ],
    correctIndex: 0,
    explanation:
      "Helpdesk Administrator ist genau für diesen Zweck gedacht: Passwörter für normale Nutzer zurücksetzen, ohne weitreichendere Rechte. Global Administrator wäre massiv überprivilegiert.",
  },
  {
    difficulty: "easy",
    question: "Was besagt das Prinzip der minimalen Rechte (Least Privilege)?",
    options: [
      "Nutzer und Admins sollten nur genau die Rechte bekommen, die sie für ihre konkrete Aufgabe wirklich brauchen - nicht mehr",
      "Alle Admins sollten Global Administrator sein, damit sie flexibel bleiben",
      "Je mehr Rechte ein Konto hat, desto weniger Supportaufwand entsteht",
    ],
    correctIndex: 0,
    explanation:
      "Least Privilege reduziert den möglichen Schaden, falls ein Konto kompromittiert wird oder ein Fehler passiert - wer nur begrenzte Rechte hat, kann auch nur begrenzten Schaden anrichten.",
  },
  {
    difficulty: "medium",
    question:
      "Eine IT-Fachkraft soll ausschliesslich Lizenzen zuweisen und entziehen können, sonst nichts.",
    options: [
      "License Administrator - eingeschränkte Rolle speziell für die Lizenzverwaltung, ohne weitere Rechte",
      "Global Administrator - hat uneingeschränkten Zugriff auf sämtliche Dienste, weit mehr als nur Lizenzen",
      "User Administrator - darf zusätzlich Benutzerkonten anlegen, löschen und zurücksetzen",
      "Billing Administrator - verwaltet Abonnements und Rechnungen, nicht die Lizenzzuweisung pro Nutzer",
    ],
    correctIndex: 0,
    explanation:
      "License Administrator ist eine eingeschränkte Rolle speziell für die Lizenzverwaltung - kein Zugriff auf andere Verwaltungsbereiche.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Nutzer braucht ausschliesslich Exchange Online (E-Mail-Postfach), sonst keine weiteren M365-Dienste.",
    options: [
      "Eine Exchange-Online-Einzellizenz (Standalone), nicht ein volles M365-E3-Paket",
      "Microsoft 365 E5 (das umfangreichste Paket)",
      "Eine reine Teams-Lizenz",
      "Gar keine Lizenz nötig, E-Mail ist immer kostenlos",
    ],
    correctIndex: 0,
    explanation:
      "Ein volles M365-E3-Paket für einen Nutzer zu kaufen, der nur E-Mail braucht, wäre unnötig teuer - eine passende Einzellizenz deckt den Bedarf genau ab.",
  },
  {
    difficulty: "medium",
    question:
      "Eine neue Abteilung von 50 Nutzern soll automatisch beim Hinzufügen zu einer Sicherheitsgruppe ihre M365-Lizenz bekommen, ohne dass ein Admin jedes Mal manuell zuweisen muss.",
    options: [
      "Gruppenbasierte Lizenzierung (Group-based Licensing) einrichten",
      "Jedem der 50 Nutzer die Lizenz einzeln manuell zuweisen",
      "Täglich ein PowerShell-Skript von Hand ausführen",
      "Lizenzen können ohnehin nicht automatisiert werden",
    ],
    correctIndex: 0,
    explanation:
      "Gruppenbasierte Lizenzierung weist eine Lizenz automatisch allen Mitgliedern einer Sicherheitsgruppe zu (und entzieht sie beim Austritt) - ideal für grosse, sich ändernde Gruppen.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Nutzer braucht nur einmal jährlich für eine seltene Aufgabe Global-Administrator-Rechte. Was ist die sicherheitstechnisch bessere Alternative zu einer dauerhaften Zuweisung?",
    options: [
      "Privileged Identity Management (PIM) für zeitlich begrenzten, bei Bedarf aktivierten (Just-in-Time) Zugriff",
      "Dauerhafte Zuweisung ist unproblematisch, solange das Passwort stark ist",
      "Eine zweite, gleichwertige Admin-Person zusätzlich anlegen",
      "Die Rolle einfach in einer unauffälligen Sicherheitsgruppe verstecken",
    ],
    correctIndex: 0,
    explanation:
      "PIM erlaubt es, privilegierte Rollen nur bei Bedarf und zeitlich begrenzt zu aktivieren (oft mit zusätzlicher Genehmigung/MFA) - dauerhaft zugewiesene hochprivilegierte Konten sind ein bevorzugtes Angriffsziel.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Lizenzpaket wie Microsoft 365 E3 enthält mehrere einzelne Dienste (Exchange, Teams, SharePoint, ...). Wie nennt man diese Bestandteile, und kann man sie einzeln deaktivieren?",
    options: [
      "Service Plans - einzelne Service Plans innerhalb einer Lizenz können deaktiviert werden, z.B. wenn ein Dienst durch eine andere Lösung ersetzt wird",
      "Sub-Lizenzen, die sich nur alle gemeinsam aktivieren oder deaktivieren lassen",
      "Add-ons, die zwingend separat gekauft werden müssen",
    ],
    correctIndex: 0,
    explanation:
      "Eine M365-Lizenz besteht aus mehreren Service Plans. Admins können z.B. den SharePoint-Service-Plan deaktivieren, wenn eine Firma eine andere Dokumentenablage nutzt, ohne die ganze Lizenz zu ändern.",
  },
  {
    difficulty: "hard",
    question:
      "Warum sollten selbst IT-Admins für ihre tägliche Arbeit (E-Mails lesen, normale Dokumente bearbeiten) NICHT mit ihrem Global-Administrator-Konto arbeiten?",
    options: [
      "Ein kompromittiertes (z.B. durch Phishing) täglich genutztes Konto mit Global-Admin-Rechten gefährdet sofort die gesamte Umgebung - Admins sollten ein separates Konto nur für administrative Aufgaben nutzen",
      "Global-Administrator-Konten können technisch gar keine E-Mails empfangen",
      "Es ist reine Konvention ohne echten Sicherheitsvorteil",
    ],
    correctIndex: 0,
    explanation:
      "Das täglich genutzte Konto (mit Mail, Browser, Dokumenten) ist das mit Abstand grösste Angriffsziel (Phishing, Malware). Ist es gleichzeitig Global Admin, führt ein einziger erfolgreicher Angriff zur vollständigen Kompromittierung der Umgebung. Ein separates Admin-Konto nur für administrative Tätigkeiten reduziert dieses Risiko erheblich.",
  },
];

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  QUIZ.forEach((q, qIdx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    const diffLabel = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[q.difficulty];
    wrapper.innerHTML = `
      <span class="badge difficulty-${q.difficulty}" style="margin-bottom:8px;">${diffLabel}</span>
      <h4 style="margin-top:4px;">${qIdx + 1}. ${q.question}</h4>
      <div class="option-list" data-question="${qIdx}"></div>
      <div class="feedback-box hidden" data-explanation="${qIdx}"></div>
    `;
    const list = wrapper.querySelector(".option-list");
    const shuffledOrder = shuffleArray(q.options.map((_, i) => i));
    shuffledOrder.forEach((oIdx) => {
      const opt = q.options[oIdx];
      const item = document.createElement("div");
      item.className = "option-item";
      item.dataset.origIndex = String(oIdx);
      item.innerHTML = `<input type="radio" name="cq${qIdx}" /> <span>${opt}</span>`;
      item.addEventListener("click", () => {
        list.querySelectorAll(".option-item").forEach((el) => {
          el.classList.remove("selected");
          el.querySelector("input").checked = false;
        });
        item.classList.add("selected");
        item.querySelector("input").checked = true;
        list.dataset.chosenIndex = String(oIdx);
      });
      list.appendChild(item);
    });
    container.appendChild(wrapper);
  });
}

function checkQuiz() {
  const lists = document.querySelectorAll("#quiz-container .option-list");
  let correctCount = 0;

  lists.forEach((list, qIdx) => {
    const chosenIndex = list.dataset.chosenIndex;
    const q = QUIZ[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item) => {
      const oIdx = Number(item.dataset.origIndex);
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (chosenIndex !== undefined && Number(chosenIndex) === oIdx && oIdx !== q.correctIndex) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;

    const expBox = document.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className = "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${QUIZ.length} richtig.</strong>`;

  if (allCorrect) {
    const wasDone = getModuleStatus(MODULE_ID) === "done";
    setModuleStatus(MODULE_ID, "done", { quizScore: correctCount });
    if (!wasDone) {
      document.getElementById("completion-banner").classList.remove("hidden");
    }
  } else {
    setModuleStatus(MODULE_ID, "progress", { quizScore: correctCount });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
