/*
 * sccm.js - Modul: Configuration Manager (SCCM)
 * Collections, Applications/Deployment Types, Deployments (Erforderlich vs.
 * Verfügbar) und Windows-Update-Management über den Software Update Point.
 */

const MODULE_ID = "sccm";

const QUIZ = [
  {
    difficulty: "easy",
    question: "Welche Rolle stellt Clients die eigentlichen Installationsdateien (Content) einer Application bereit?",
    options: [
      "Der Distribution Point",
      "Der Management Point",
      "Der Software Update Point",
    ],
    correctIndex: 0,
    explanation:
      "Der Distribution Point hostet die Installationsdateien selbst. Der Management Point vermittelt nur Richtlinien/Status zwischen Client und Site-Server, der Software Update Point ist speziell für Windows-Updates zuständig.",
  },
  {
    difficulty: "easy",
    question: "Was ist der Zweck einer Erkennungsregel (Detection Rule) bei einer Application?",
    options: [
      "Sie prüft VOR der Installation, ob die Anwendung bereits vorhanden ist - verhindert unnötige Neuinstallationen",
      "Sie erkennt, welcher Nutzer gerade am Gerät angemeldet ist",
      "Sie misst, wie lange die Installation dauert",
    ],
    correctIndex: 0,
    explanation:
      "Ohne Erkennungsregel wüsste Configuration Manager bei jedem Evaluierungszyklus nicht, ob die Software schon installiert ist, und würde sie ggf. wiederholt zu installieren versuchen.",
  },
  {
    difficulty: "easy",
    question: "Was unterscheidet eine abfragebasierte (dynamische) Collection von einer mit direkter Mitgliedschaft?",
    options: [
      "Ihre Mitgliedschaft aktualisiert sich automatisch anhand einer Abfrage (z.B. \"alle Geräte mit Windows 11\"), statt Geräte einzeln manuell hinzuzufügen",
      "Sie kann nur Benutzer, nie Geräte enthalten",
      "Sie lässt sich nicht als Ziel eines Deployments verwenden",
    ],
    correctIndex: 0,
    explanation:
      "Direkte Mitgliedschaft muss manuell gepflegt werden, abfragebasierte (WQL-)Mitgliedschaft aktualisiert sich automatisch, sobald sich der Gerätebestand ändert - ideal für grosse, sich verändernde Zielgruppen.",
  },
  {
    difficulty: "medium",
    question: "Ein Deployment ist als \"Erforderlich\" (Required) markiert. Was bedeutet das für die Zielgeräte?",
    options: [
      "Die Application wird bis zur festgelegten Deadline automatisch installiert, notfalls mit erzwungenem Neustart - ohne dass der Nutzer aktiv zustimmen muss",
      "Die Application erscheint nur als Vorschlag im Software Center, der Nutzer kann sie ignorieren",
      "Die Application wird nur auf Geräten installiert, auf denen bereits eine ältere Version existiert",
    ],
    correctIndex: 0,
    explanation:
      "\"Erforderlich\" entspricht konzeptionell einer GPO mit \"Zugewiesen\" (Assigned) - die Installation erfolgt automatisch bis zur Deadline. \"Verfügbar\" (Available) wäre das Gegenstück zu \"Veröffentlicht\" (Published): der Nutzer installiert freiwillig über das Software Center.",
  },
  {
    difficulty: "medium",
    question: "Worin liegt der praktische Hauptvorteil von Configuration-Manager-Deployments gegenüber reiner GPO-Softwareinstallation?",
    options: [
      "Detailliertes Compliance-Reporting sowie zeitversetztes, wellenweises Ausrollen (Ringe) und Wartungsfenster - GPO liefert dagegen keine Rückmeldung, ob eine Installation tatsächlich geklappt hat",
      "GPO-Softwareinstallation kann grundsätzlich keine .msi-Dateien verarbeiten",
      "Configuration Manager benötigt keine Active-Directory-Domäne",
    ],
    correctIndex: 0,
    explanation:
      "GPO installiert zuverlässig, meldet aber nicht zurück, ob es geklappt hat, und kennt kein gestaffeltes Ausrollen. Configuration Manager bietet dagegen Reporting, Ring-basiertes Deployment und Wartungsfenster - beide können aber genau dieselbe .msi verteilen.",
  },
  {
    difficulty: "medium",
    question: "Was macht eine Automatic Deployment Rule (ADR) im Kontext von Windows-Updates?",
    options: [
      "Sie erfasst und stellt neue Updates automatisch nach festgelegten Kriterien bereit (z.B. \"Kritisch/Sicherheit, monatlich\"), ohne dass jeder Patchday manuell nachgepflegt werden muss",
      "Sie deinstalliert automatisch alle fehlerhaften Updates nach 30 Tagen",
      "Sie ersetzt die Notwendigkeit einer Collection bei Update-Deployments komplett",
    ],
    correctIndex: 0,
    explanation:
      "ADRs automatisieren genau den wiederkehrenden Teil der Patch-Verwaltung: neue passende Updates werden automatisch erfasst und gemäss den Regeln bereitgestellt - eine Ziel-Collection ist trotzdem weiterhin nötig.",
  },
  {
    difficulty: "hard",
    question: "Warum wird ein Windows-Update-Rollout typischerweise zuerst an einen kleinen \"Pilot-Ring\" und erst danach an breitere Collections deployt?",
    options: [
      "Um ein fehlerhaftes Update früh in einer kleinen, überschaubaren Gruppe zu erkennen, BEVOR es alle Geräte gleichzeitig betrifft",
      "Weil der Software Update Point nur eine begrenzte Anzahl Geräte gleichzeitig bedienen kann",
      "Weil Pilot-Ringe technisch andere Update-Dateien benötigen als die restlichen Ringe",
    ],
    correctIndex: 0,
    explanation:
      "Ring-basiertes Ausrollen ist reines Risikomanagement: taucht in der kleinen Pilotgruppe ein Problem auf, lässt sich der Rollout stoppen, bevor die grosse Mehrheit der Geräte betroffen ist.",
  },
  {
    difficulty: "hard",
    question: "Eine Application hat zwei Deployment Types: eine MSI-Variante und eine Skript-Variante. Wie entscheidet Configuration Manager, welche auf einem bestimmten Client verwendet wird?",
    options: [
      "Anhand der Anforderungen (Requirements) jedes Deployment Types - z.B. Betriebssystemversion oder Architektur - der Client bekommt automatisch den passenden Typ",
      "Immer die zuerst angelegte Variante, unabhängig vom Gerät",
      "Der Nutzer wählt bei jeder Installation manuell zwischen beiden Varianten",
    ],
    correctIndex: 0,
    explanation:
      "Mehrere Deployment Types innerhalb einer Application existieren genau für solche Fälle: jede hat eigene Requirements, und Configuration Manager wählt automatisch die zum jeweiligen Client passende Variante aus.",
  },
  {
    difficulty: "hard",
    question: "Der Software Update Point liefert plötzlich keine neuen Updates mehr aus, obwohl die ADR unverändert ist. Was ist eine wahrscheinliche technische Ursache?",
    options: [
      "Ein Problem mit der zugrundeliegenden WSUS-Komponente (auf der der Software Update Point technisch aufbaut) oder der SQL-Server-Standortdatenbank, in der die Update-Metadaten verwaltet werden",
      "ADRs können sich nach der Erstellung grundsätzlich nicht mehr selbst aktualisieren",
      "Windows-Updates werden von Configuration Manager komplett unabhängig von WSUS verteilt",
    ],
    correctIndex: 0,
    explanation:
      "Der Software Update Point ist keine komplett eigenständige Komponente - er baut auf WSUS auf und die Update-Metadaten liegen in derselben SQL-Standortdatenbank wie der Rest der Konfiguration. Probleme an einer dieser Stellen wirken sich direkt auf die Update-Verteilung aus.",
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
      item.innerHTML = `<input type="radio" name="sccmq${qIdx}" /> <span>${opt}</span>`;
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

    const expBox = list.parentElement.querySelector(`[data-explanation="${qIdx}"]`);
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

  initLabChecklist(document.getElementById("sccm-lab-checklist"), "lab_sccm_checklist", [
    "Weg gewählt: Evaluation Lab Kit ODER manuell auf SRV01",
    "(Weg B) SQL Server auf SRV01 installiert",
    "(Weg B) Configuration Manager als eigenständiger Primärstandort installiert",
    "(Weg B) CL01 als Client registriert",
    "Collection für die OU Support angelegt",
    "Application für 7-Zip inkl. Erkennungsregel angelegt",
    "Deployment (Erforderlich) auf die Collection erstellt",
    "Auf CL01 verifiziert: 7-Zip über das Software Center installiert",
  ]);
});
