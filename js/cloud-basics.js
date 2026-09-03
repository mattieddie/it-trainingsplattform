/*
 * cloud-basics.js - Modul 12: Cloud-Grundlagen (Azure/M365 RBAC & Lizenzierung)
 * Konzept-Erklaerung + ein schwierigkeitsgestuftes Quiz zu Rollenwahl
 * (Least Privilege) und Lizenzierungs-Entscheidungen.
 */

const MODULE_ID = "cloudbasics";

const QUIZ = [
  {
    difficulty: "easy",
    question:
      "Ein Mitarbeiter im Helpdesk soll Passwoerter fuer normale Nutzer zuruecksetzen koennen, aber sonst nichts verwalten duerfen. Welche Rolle passt am besten?",
    options: [
      "Helpdesk Administrator",
      "Global Administrator",
      "User Administrator",
      "Exchange Administrator",
    ],
    correctIndex: 0,
    explanation:
      "Helpdesk Administrator ist genau fuer diesen Zweck gedacht: Passwoerter fuer normale Nutzer zuruecksetzen, ohne weitreichendere Rechte. Global Administrator waere massiv ueberprivilegiert.",
  },
  {
    difficulty: "easy",
    question: "Was besagt das Prinzip der minimalen Rechte (Least Privilege)?",
    options: [
      "Nutzer und Admins sollten nur genau die Rechte bekommen, die sie fuer ihre konkrete Aufgabe wirklich brauchen - nicht mehr",
      "Alle Admins sollten Global Administrator sein, damit sie flexibel bleiben",
      "Je mehr Rechte ein Konto hat, desto weniger Supportaufwand entsteht",
    ],
    correctIndex: 0,
    explanation:
      "Least Privilege reduziert den moeglichen Schaden, falls ein Konto kompromittiert wird oder ein Fehler passiert - wer nur begrenzte Rechte hat, kann auch nur begrenzten Schaden anrichten.",
  },
  {
    difficulty: "medium",
    question:
      "Eine IT-Fachkraft soll ausschliesslich Lizenzen zuweisen und entziehen koennen, sonst nichts.",
    options: [
      "License Administrator",
      "Global Administrator",
      "User Administrator",
      "Billing Administrator",
    ],
    correctIndex: 0,
    explanation:
      "License Administrator ist eine eingeschraenkte Rolle speziell fuer die Lizenzverwaltung - kein Zugriff auf andere Verwaltungsbereiche.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Nutzer braucht ausschliesslich Exchange Online (E-Mail-Postfach), sonst keine weiteren M365-Dienste.",
    options: [
      "Eine Exchange-Online-Einzellizenz (Standalone), nicht ein volles M365-E3-Paket",
      "Microsoft 365 E5 (das umfangreichste Paket)",
      "Eine reine Teams-Lizenz",
      "Gar keine Lizenz noetig, E-Mail ist immer kostenlos",
    ],
    correctIndex: 0,
    explanation:
      "Ein volles M365-E3-Paket fuer einen Nutzer zu kaufen, der nur E-Mail braucht, waere unnoetig teuer - eine passende Einzellizenz deckt den Bedarf genau ab.",
  },
  {
    difficulty: "medium",
    question:
      "Eine neue Abteilung von 50 Nutzern soll automatisch beim Hinzufuegen zu einer Sicherheitsgruppe ihre M365-Lizenz bekommen, ohne dass ein Admin jedes Mal manuell zuweisen muss.",
    options: [
      "Gruppenbasierte Lizenzierung (Group-based Licensing) einrichten",
      "Jedem der 50 Nutzer die Lizenz einzeln manuell zuweisen",
      "Taeglich ein PowerShell-Skript von Hand ausfuehren",
      "Lizenzen koennen ohnehin nicht automatisiert werden",
    ],
    correctIndex: 0,
    explanation:
      "Gruppenbasierte Lizenzierung weist eine Lizenz automatisch allen Mitgliedern einer Sicherheitsgruppe zu (und entzieht sie beim Austritt) - ideal fuer grosse, sich aendernde Gruppen.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Nutzer braucht nur einmal jaehrlich fuer eine seltene Aufgabe Global-Administrator-Rechte. Was ist die sicherheitstechnisch bessere Alternative zu einer dauerhaften Zuweisung?",
    options: [
      "Privileged Identity Management (PIM) fuer zeitlich begrenzten, bei Bedarf aktivierten (Just-in-Time) Zugriff",
      "Dauerhafte Zuweisung ist unproblematisch, solange das Passwort stark ist",
      "Eine zweite, gleichwertige Admin-Person zusaetzlich anlegen",
      "Die Rolle einfach in einer unauffälligen Sicherheitsgruppe verstecken",
    ],
    correctIndex: 0,
    explanation:
      "PIM erlaubt es, privilegierte Rollen nur bei Bedarf und zeitlich begrenzt zu aktivieren (oft mit zusaetzlicher Genehmigung/MFA) - dauerhaft zugewiesene hochprivilegierte Konten sind ein bevorzugtes Angriffsziel.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Lizenzpaket wie Microsoft 365 E3 enthaelt mehrere einzelne Dienste (Exchange, Teams, SharePoint, ...). Wie nennt man diese Bestandteile, und kann man sie einzeln deaktivieren?",
    options: [
      "Service Plans - einzelne Service Plans innerhalb einer Lizenz koennen deaktiviert werden, z.B. wenn ein Dienst durch eine andere Loesung ersetzt wird",
      "Sub-Lizenzen, die sich nur alle gemeinsam aktivieren oder deaktivieren lassen",
      "Add-ons, die zwingend separat gekauft werden muessen",
    ],
    correctIndex: 0,
    explanation:
      "Eine M365-Lizenz besteht aus mehreren Service Plans. Admins koennen z.B. den SharePoint-Service-Plan deaktivieren, wenn eine Firma eine andere Dokumentenablage nutzt, ohne die ganze Lizenz zu aendern.",
  },
  {
    difficulty: "hard",
    question:
      "Warum sollten selbst IT-Admins fuer ihre taegliche Arbeit (E-Mails lesen, normale Dokumente bearbeiten) NICHT mit ihrem Global-Administrator-Konto arbeiten?",
    options: [
      "Ein kompromittiertes (z.B. durch Phishing) taeglich genutztes Konto mit Global-Admin-Rechten gefaehrdet sofort die gesamte Umgebung - Admins sollten ein separates Konto nur fuer administrative Aufgaben nutzen",
      "Global-Administrator-Konten koennen technisch gar keine E-Mails empfangen",
      "Es ist reine Konvention ohne echten Sicherheitsvorteil",
    ],
    correctIndex: 0,
    explanation:
      "Das taeglich genutzte Konto (mit Mail, Browser, Dokumenten) ist das mit Abstand groesste Angriffsziel (Phishing, Malware). Ist es gleichzeitig Global Admin, fuehrt ein einziger erfolgreicher Angriff zur vollstaendigen Kompromittierung der Umgebung. Ein separates Admin-Konto nur fuer administrative Taetigkeiten reduziert dieses Risiko erheblich.",
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
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
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
    items.forEach((item, oIdx) => {
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
