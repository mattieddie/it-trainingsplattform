/*
 * computer-basics.js - Basismodul: Computer- & Windows-Grundlagen
 * Quiz zu Hardware, Benutzer- vs. Systemebene, NTFS-Berechtigungen,
 * Registry und Dateitypen - gruppiert nach Thema, schwierigkeitsgestuft.
 */

const MODULE_ID = "computerbasics";

const QUIZ = [
  // ---- Hardware ----
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "easy",
    question: "Welche Komponente wird oft als das \"Gehirn\" des Computers bezeichnet?",
    options: ["Prozessor (CPU)", "Arbeitsspeicher (RAM)", "Mainboard", "Netzteil"],
    correctIndex: 0,
    explanation:
      "Die CPU (Central Processing Unit) verarbeitet Daten und steuert die Abläufe im System - daher der Vergleich mit dem \"Gehirn\".",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "easy",
    question: "Welche Eigenschaft hat der Arbeitsspeicher (RAM)?",
    options: [
      "Er ist flüchtig - sein Inhalt geht beim Ausschalten verloren, dient dem schnellen Zwischenspeichern aktuell genutzter Daten",
      "Er speichert Daten dauerhaft, auch ohne Strom",
      "Er ist langsamer als eine Festplatte, aber dauerhaft",
    ],
    correctIndex: 0,
    explanation:
      "RAM ist flüchtiger Speicher: extrem schnell im Zugriff, aber der Inhalt ist weg, sobald der Strom fehlt. Für dauerhafte Speicherung braucht es HDD/SSD.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "medium",
    question: "Was ist der Hauptunterschied zwischen einer HDD und einer SSD?",
    options: [
      "HDD speichert Daten mechanisch/magnetisch auf rotierenden Scheiben; SSD speichert elektronisch (Flash-Speicher) ohne bewegliche Teile und ist dadurch deutlich schneller",
      "Beide funktionieren technisch identisch, nur die Bauform unterscheidet sich",
      "SSD ist die ältere, HDD die neuere Technologie",
    ],
    correctIndex: 0,
    explanation:
      "SSDs (Solid State Drives) haben keine beweglichen Teile und sind dadurch deutlich schneller und robuster als klassische HDDs mit rotierenden Magnetscheiben.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "medium",
    question: "Welche Komponente verbindet CPU, RAM, Grafikkarte und weitere Teile physisch miteinander?",
    options: ["Mainboard", "Netzteil", "Kühler", "Gehäuse"],
    correctIndex: 0,
    explanation:
      "Das Mainboard (Hauptplatine) ist die zentrale Verbindungsplatine, auf der bzw. an der alle wichtigen Komponenten stecken oder angeschlossen sind.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "hard",
    question:
      "Warum profitiert Windows bei typischen Office-Arbeiten (viele Programme/Fenster gleichzeitig offen) oft stärker von mehr RAM als von einer schnelleren CPU?",
    options: [
      "Bei vielen gleichzeitig geöffneten Programmen wird vor allem Arbeitsspeicher gebraucht, um deren Daten vorzuhalten - ist der RAM knapp, muss ausgelagert werden, was alles verlangsamt, egal wie schnell die CPU ist",
      "Die CPU wird bei Office-Programmen technisch gar nicht genutzt",
      "RAM ist immer wichtiger als die CPU, in jedem denkbaren Szenario",
    ],
    correctIndex: 0,
    explanation:
      "Reicht der RAM nicht aus, muss Windows Daten auf die (viel langsamere) Festplatte auslagern (Swapping) - das bremst spürbar, unabhängig davon, wie schnell die CPU eigentlich wäre. Bei vielen gleichzeitig offenen Programmen ist deshalb oft der RAM der Flaschenhals.",
  },

  // ---- Benutzer vs. System ----
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "easy",
    question:
      "Was ist der Unterschied zwischen \"Computerkonfiguration\" und \"Benutzerkonfiguration\" bei Windows-Einstellungen?",
    options: [
      "Computerkonfiguration gilt für ALLE Benutzer an diesem einen PC; Benutzerkonfiguration gilt für EINEN bestimmten Benutzer, egal an welchem PC er sich anmeldet",
      "Beide bedeuten exakt dasselbe",
      "Computerkonfiguration gilt nur für den Administrator, Benutzerkonfiguration für alle anderen",
    ],
    correctIndex: 0,
    explanation:
      "Computereinstellungen sind an das Gerät gebunden (wirken für jeden, der sich dort anmeldet). Benutzereinstellungen sind an die Person gebunden (folgen ihr auf jedes Gerät, an dem sie sich anmeldet).",
  },
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "medium",
    question:
      "In welchem Registry-Hauptzweig (Hive) findet man systemweite Einstellungen, die für alle Benutzer eines PCs gelten?",
    options: [
      "HKEY_LOCAL_MACHINE (HKLM)",
      "HKEY_CURRENT_USER (HKCU)",
      "HKEY_CLASSES_ROOT",
    ],
    correctIndex: 0,
    explanation:
      "HKLM enthält systemweite Einstellungen (gelten für alle Benutzer). HKCU enthält dagegen nur das Profil des aktuell angemeldeten Benutzers.",
  },
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "hard",
    question:
      "Ein Programm wurde \"nur für mich\" (per-user) installiert, während ein Administrator angemeldet war. Ein anderer Standardbenutzer auf demselben PC findet das Programm nicht. Warum?",
    options: [
      "Eine per-user-Installation legt Verknüpfungen/Konfiguration nur im individuellen Benutzerprofil des installierenden Kontos ab - andere Benutzerkonten auf demselben PC sehen das Programm daher nicht",
      "Das Programm wurde technisch gar nicht richtig installiert",
      "Standardbenutzer können grundsätzlich keine Programme sehen, die je installiert wurden",
    ],
    correctIndex: 0,
    explanation:
      "Bei einer per-user-Installation landen Einträge (Startmenü, Registry-Teile) nur im Profil des installierenden Benutzers. Eine per-machine-Installation (\"für alle Benutzer\") legt sie stattdessen im gemeinsamen All-Users-Bereich ab, den jeder Benutzer sieht.",
  },

  // ---- Berechtigungen ----
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "easy",
    question: "Was regeln NTFS-Dateiberechtigungen?",
    options: [
      "Ob ein Benutzer oder eine Gruppe eine Datei/einen Ordner lesen, schreiben, ändern oder ausführen darf",
      "Wie schnell eine Datei geöffnet wird",
      "Auf welchem Laufwerk eine Datei physisch gespeichert wird",
    ],
    correctIndex: 0,
    explanation:
      "NTFS-Berechtigungen legen pro Benutzer/Gruppe fest, welche Aktionen (Lesen, Schreiben, Ändern, Ausführen, Vollzugriff) auf einer Datei oder einem Ordner erlaubt sind.",
  },
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "medium",
    question:
      "Ein Standardbenutzer soll eine Datei lesen, aber nicht löschen oder ändern können. Welche NTFS-Berechtigung passt dafür?",
    options: [
      "Nur \"Lesen\" (bzw. \"Lesen & Ausführen\") - kein \"Schreiben\", \"Ändern\" oder \"Vollzugriff\"",
      "Vollzugriff, da man sonst nichts öffnen kann",
      "Keine Berechtigung vergeben, dann kann er die Datei trotzdem lesen",
    ],
    correctIndex: 0,
    explanation:
      "\"Lesen\" (bzw. \"Lesen & Ausführen\") erlaubt das Öffnen/Anzeigen, verhindert aber Ändern, Überschreiben oder Löschen der Datei.",
  },
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "hard",
    question: "Wozu dient die Benutzerkontensteuerung (User Account Control, UAC)?",
    options: [
      "Sie zwingt selbst Administratoren, kritische/systemverändernde Aktionen extra zu bestätigen (\"als Administrator ausführen\") - das verhindert unbemerkte, weitreichende Systemänderungen",
      "Sie verschlüsselt automatisch alle Benutzerdateien",
      "Sie ersetzt NTFS-Berechtigungen komplett",
    ],
    correctIndex: 0,
    explanation:
      "UAC ist eine zusätzliche Sicherheitsebene: selbst mit Administratorrechten muss man kritische Aktionen aktiv bestätigen - das schützt vor unbemerkter Schadsoftware-Ausführung oder versehentlichen Systemänderungen.",
  },

  // ---- Registry ----
  {
    topic: "🗄️ Windows-Registry",
    difficulty: "easy",
    question: "Was ist die Windows-Registry?",
    options: [
      "Eine zentrale, hierarchisch aufgebaute Konfigurationsdatenbank für System-, Treiber-, Programm- und Benutzereinstellungen",
      "Ein Ordner für temporäre Dateien",
      "Ein Antivirenprogramm von Microsoft",
    ],
    correctIndex: 0,
    explanation:
      "Die Registry speichert praktisch alle Konfigurationsdaten von Windows selbst, von Treibern, installierten Programmen und Benutzerprofilen in einer Baumstruktur.",
  },
  {
    topic: "🗄️ Windows-Registry",
    difficulty: "medium",
    question:
      "Welche zwei Registry-Hives sind am wichtigsten für die Unterscheidung System- vs. Benutzereinstellung?",
    options: [
      "HKEY_LOCAL_MACHINE (systemweit) und HKEY_CURRENT_USER (benutzerspezifisch)",
      "HKEY_CLASSES_ROOT und HKEY_USERS",
      "HKEY_CURRENT_CONFIG und HKEY_DYN_DATA",
    ],
    correctIndex: 0,
    explanation:
      "HKLM enthält systemweite Einstellungen, HKCU nur die des aktuell angemeldeten Benutzers - die zentrale Unterscheidung im Alltag.",
  },
  {
    topic: "🗄️ Windows-Registry",
    difficulty: "hard",
    question:
      "Warum sollte man vor grösseren Registry-Änderungen (z.B. per Skript auf vielen Rechnern) unbedingt eine Sicherung erstellen?",
    options: [
      "Die Registry ist sehr mächtig/zentral - fehlerhafte Änderungen können das System unbrauchbar machen; eine Sicherung erlaubt schnelles Zurücksetzen auf einen funktionierenden Zustand",
      "Eine Sicherung ist nur aus rechtlichen Gründen vorgeschrieben, technisch unnötig",
      "Die Registry sichert sich automatisch bei jeder Änderung selbst ab",
    ],
    correctIndex: 0,
    explanation:
      "Ein einziger falscher Registry-Eintrag kann dazu führen, dass Windows nicht mehr startet oder Programme abstürzen. Eine vorherige Sicherung (Backup) macht Fehler risikolos rückgängig.",
  },

  // ---- Dateitypen ----
  {
    topic: "📄 Dateitypen",
    difficulty: "easy",
    question: "Welche Dateiendung kennzeichnet eine direkt ausführbare Datei?",
    options: [".exe", ".txt", ".cfg"],
    correctIndex: 0,
    explanation: "\".exe\" (executable) führt beim Doppelklick direkt Programmcode aus.",
  },
  {
    topic: "📄 Dateitypen",
    difficulty: "medium",
    question: "Was ist der Unterschied zwischen einer .exe- und einer .msi-Datei?",
    options: [
      ".exe führt Code direkt aus; .msi ist ein Installationspaket, das kontrolliert über den Windows-Installer-Dienst verarbeitet wird (inkl. Protokollierung/Rollback)",
      "Beide sind technisch komplett identisch, nur unterschiedliche Dateiendung",
      ".msi kann nur Textdateien enthalten, .exe nur Programme",
    ],
    correctIndex: 0,
    explanation:
      "Der Windows-Installer-Dienst, der .msi-Pakete verarbeitet, protokolliert Installationsschritte und kann sie bei einem Fehler zurückrollen - das macht Installationen zuverlässiger als ein einfaches .exe.",
  },
  {
    topic: "📄 Dateitypen",
    difficulty: "hard",
    question:
      "Wozu dient eine .dll-Datei, und warum benötigen viele Programme mehrere davon?",
    options: [
      "Eine DLL (Dynamic Link Library) enthält wiederverwendbaren Programmcode/Funktionen, den mehrere Programme gemeinsam nutzen können, statt ihn jeweils selbst mitzubringen",
      "DLL-Dateien sind nur für Bilder und Grafiken gedacht",
      "Jedes Programm braucht genau eine einzige DLL, mehr ist ein Fehler",
    ],
    correctIndex: 0,
    explanation:
      "DLLs bündeln Funktionen (z.B. für Netzwerk, Grafik, Textverarbeitung), die mehrere Programme gemeinsam nutzen - das spart Speicher und erleichtert Updates (eine DLL aktualisieren reicht für alle nutzenden Programme).",
  },
];

function groupsInOrder() {
  const seen = [];
  QUIZ.forEach((q) => {
    if (!seen.includes(q.topic)) seen.push(q.topic);
  });
  return seen;
}

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";
  let lastTopic = null;

  QUIZ.forEach((q, qIdx) => {
    if (q.topic !== lastTopic) {
      const heading = document.createElement("h3");
      heading.textContent = q.topic;
      heading.style.marginTop = "24px";
      container.appendChild(heading);
      lastTopic = q.topic;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    const diffLabel = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[q.difficulty];
    wrapper.innerHTML = `
      <span class="badge difficulty-${q.difficulty}" style="margin-bottom:8px;">${diffLabel}</span>
      <h4 style="margin-top:4px;">${q.question}</h4>
      <div class="option-list" data-question="${qIdx}"></div>
      <div class="feedback-box hidden" data-explanation="${qIdx}"></div>
    `;
    const list = wrapper.querySelector(".option-list");
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.innerHTML = `<input type="radio" name="cbq${qIdx}" /> <span>${opt}</span>`;
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

    const expBox = list.parentElement.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className =
      "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
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

  fb.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
