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
      "Ein Mitarbeiter im Helpdesk soll Passwörter für normale Nutzer zurücksetzen können, aber sonst nichts verwalten dürfen. Welche Rolle passt am besten?",
    options: [
      "Helpdesk Administrator",
      "Global Administrator",
      "User Administrator",
      "Exchange Administrator",
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
      "License Administrator",
      "Global Administrator",
      "User Administrator",
      "Billing Administrator",
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
