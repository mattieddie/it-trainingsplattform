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
      "Die CPU (Central Processing Unit) verarbeitet Daten und steuert die Ablaeufe im System - daher der Vergleich mit dem \"Gehirn\".",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "easy",
    question: "Welche Eigenschaft hat der Arbeitsspeicher (RAM)?",
    options: [
      "Er ist fluechtig - sein Inhalt geht beim Ausschalten verloren, dient dem schnellen Zwischenspeichern aktuell genutzter Daten",
      "Er speichert Daten dauerhaft, auch ohne Strom",
      "Er ist langsamer als eine Festplatte, aber dauerhaft",
    ],
    correctIndex: 0,
    explanation:
      "RAM ist fluechtiger Speicher: extrem schnell im Zugriff, aber der Inhalt ist weg, sobald der Strom fehlt. Fuer dauerhafte Speicherung braucht es HDD/SSD.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "medium",
    question: "Was ist der Hauptunterschied zwischen einer HDD und einer SSD?",
    options: [
      "HDD speichert Daten mechanisch/magnetisch auf rotierenden Scheiben; SSD speichert elektronisch (Flash-Speicher) ohne bewegliche Teile und ist dadurch deutlich schneller",
      "Beide funktionieren technisch identisch, nur die Bauform unterscheidet sich",
      "SSD ist die aeltere, HDD die neuere Technologie",
    ],
    correctIndex: 0,
    explanation:
      "SSDs (Solid State Drives) haben keine beweglichen Teile und sind dadurch deutlich schneller und robuster als klassische HDDs mit rotierenden Magnetscheiben.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "medium",
    question: "Welche Komponente verbindet CPU, RAM, Grafikkarte und weitere Teile physisch miteinander?",
    options: ["Mainboard", "Netzteil", "Kuehler", "Gehaeuse"],
    correctIndex: 0,
    explanation:
      "Das Mainboard (Hauptplatine) ist die zentrale Verbindungsplatine, auf der bzw. an der alle wichtigen Komponenten stecken oder angeschlossen sind.",
  },
  {
    topic: "🖥️ Hardware (Computeraufbau)",
    difficulty: "hard",
    question:
      "Warum profitiert Windows bei typischen Office-Arbeiten (viele Programme/Fenster gleichzeitig offen) oft staerker von mehr RAM als von einer schnelleren CPU?",
    options: [
      "Bei vielen gleichzeitig geoeffneten Programmen wird vor allem Arbeitsspeicher gebraucht, um deren Daten vorzuhalten - ist der RAM knapp, muss ausgelagert werden, was alles verlangsamt, egal wie schnell die CPU ist",
      "Die CPU wird bei Office-Programmen technisch gar nicht genutzt",
      "RAM ist immer wichtiger als die CPU, in jedem denkbaren Szenario",
    ],
    correctIndex: 0,
    explanation:
      "Reicht der RAM nicht aus, muss Windows Daten auf die (viel langsamere) Festplatte auslagern (Swapping) - das bremst spuerbar, unabhaengig davon, wie schnell die CPU eigentlich waere. Bei vielen gleichzeitig offenen Programmen ist deshalb oft der RAM der Flaschenhals.",
  },

  // ---- Benutzer vs. System ----
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "easy",
    question:
      "Was ist der Unterschied zwischen \"Computerkonfiguration\" und \"Benutzerkonfiguration\" bei Windows-Einstellungen?",
    options: [
      "Computerkonfiguration gilt fuer ALLE Benutzer an diesem einen PC; Benutzerkonfiguration gilt fuer EINEN bestimmten Benutzer, egal an welchem PC er sich anmeldet",
      "Beide bedeuten exakt dasselbe",
      "Computerkonfiguration gilt nur fuer den Administrator, Benutzerkonfiguration fuer alle anderen",
    ],
    correctIndex: 0,
    explanation:
      "Computereinstellungen sind an das Geraet gebunden (wirken fuer jeden, der sich dort anmeldet). Benutzereinstellungen sind an die Person gebunden (folgen ihr auf jedes Geraet, an dem sie sich anmeldet).",
  },
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "medium",
    question:
      "In welchem Registry-Hauptzweig (Hive) findet man systemweite Einstellungen, die fuer alle Benutzer eines PCs gelten?",
    options: [
      "HKEY_LOCAL_MACHINE (HKLM)",
      "HKEY_CURRENT_USER (HKCU)",
      "HKEY_CLASSES_ROOT",
    ],
    correctIndex: 0,
    explanation:
      "HKLM enthaelt systemweite Einstellungen (gelten fuer alle Benutzer). HKCU enthaelt dagegen nur das Profil des aktuell angemeldeten Benutzers.",
  },
  {
    topic: "👤 Benutzer- vs. Systemebene",
    difficulty: "hard",
    question:
      "Ein Programm wurde \"nur fuer mich\" (per-user) installiert, waehrend ein Administrator angemeldet war. Ein anderer Standardbenutzer auf demselben PC findet das Programm nicht. Warum?",
    options: [
      "Eine per-user-Installation legt Verknuepfungen/Konfiguration nur im individuellen Benutzerprofil des installierenden Kontos ab - andere Benutzerkonten auf demselben PC sehen das Programm daher nicht",
      "Das Programm wurde technisch gar nicht richtig installiert",
      "Standardbenutzer koennen grundsaetzlich keine Programme sehen, die je installiert wurden",
    ],
    correctIndex: 0,
    explanation:
      "Bei einer per-user-Installation landen Eintraege (Startmenue, Registry-Teile) nur im Profil des installierenden Benutzers. Eine per-machine-Installation (\"fuer alle Benutzer\") legt sie stattdessen im gemeinsamen All-Users-Bereich ab, den jeder Benutzer sieht.",
  },

  // ---- Berechtigungen ----
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "easy",
    question: "Was regeln NTFS-Dateiberechtigungen?",
    options: [
      "Ob ein Benutzer oder eine Gruppe eine Datei/einen Ordner lesen, schreiben, aendern oder ausfuehren darf",
      "Wie schnell eine Datei geoeffnet wird",
      "Auf welchem Laufwerk eine Datei physisch gespeichert wird",
    ],
    correctIndex: 0,
    explanation:
      "NTFS-Berechtigungen legen pro Benutzer/Gruppe fest, welche Aktionen (Lesen, Schreiben, Aendern, Ausfuehren, Vollzugriff) auf einer Datei oder einem Ordner erlaubt sind.",
  },
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "medium",
    question:
      "Ein Standardbenutzer soll eine Datei lesen, aber nicht loeschen oder aendern koennen. Welche NTFS-Berechtigung passt dafuer?",
    options: [
      "Nur \"Lesen\" (bzw. \"Lesen & Ausfuehren\") - kein \"Schreiben\", \"Aendern\" oder \"Vollzugriff\"",
      "Vollzugriff, da man sonst nichts oeffnen kann",
      "Keine Berechtigung vergeben, dann kann er die Datei trotzdem lesen",
    ],
    correctIndex: 0,
    explanation:
      "\"Lesen\" (bzw. \"Lesen & Ausfuehren\") erlaubt das Oeffnen/Anzeigen, verhindert aber Aendern, Ueberschreiben oder Loeschen der Datei.",
  },
  {
    topic: "🔐 Berechtigungen (NTFS)",
    difficulty: "hard",
    question: "Wozu dient die Benutzerkontensteuerung (User Account Control, UAC)?",
    options: [
      "Sie zwingt selbst Administratoren, kritische/systemveraendernde Aktionen extra zu bestaetigen (\"als Administrator ausfuehren\") - das verhindert unbemerkte, weitreichende Systemaenderungen",
      "Sie verschluesselt automatisch alle Benutzerdateien",
      "Sie ersetzt NTFS-Berechtigungen komplett",
    ],
    correctIndex: 0,
    explanation:
      "UAC ist eine zusaetzliche Sicherheitsebene: selbst mit Administratorrechten muss man kritische Aktionen aktiv bestaetigen - das schuetzt vor unbemerkter Schadsoftware-Ausfuehrung oder versehentlichen Systemaenderungen.",
  },

  // ---- Registry ----
  {
    topic: "🗄️ Windows-Registry",
    difficulty: "easy",
    question: "Was ist die Windows-Registry?",
    options: [
      "Eine zentrale, hierarchisch aufgebaute Konfigurationsdatenbank fuer System-, Treiber-, Programm- und Benutzereinstellungen",
      "Ein Ordner fuer temporaere Dateien",
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
      "Welche zwei Registry-Hives sind am wichtigsten fuer die Unterscheidung System- vs. Benutzereinstellung?",
    options: [
      "HKEY_LOCAL_MACHINE (systemweit) und HKEY_CURRENT_USER (benutzerspezifisch)",
      "HKEY_CLASSES_ROOT und HKEY_USERS",
      "HKEY_CURRENT_CONFIG und HKEY_DYN_DATA",
    ],
    correctIndex: 0,
    explanation:
      "HKLM enthaelt systemweite Einstellungen, HKCU nur die des aktuell angemeldeten Benutzers - die zentrale Unterscheidung im Alltag.",
  },
  {
    topic: "🗄️ Windows-Registry",
    difficulty: "hard",
    question:
      "Warum sollte man vor groesseren Registry-Aenderungen (z.B. per Skript auf vielen Rechnern) unbedingt eine Sicherung erstellen?",
    options: [
      "Die Registry ist sehr maechtig/zentral - fehlerhafte Aenderungen koennen das System unbrauchbar machen; eine Sicherung erlaubt schnelles Zuruecksetzen auf einen funktionierenden Zustand",
      "Eine Sicherung ist nur aus rechtlichen Gruenden vorgeschrieben, technisch unnoetig",
      "Die Registry sichert sich automatisch bei jeder Aenderung selbst ab",
    ],
    correctIndex: 0,
    explanation:
      "Ein einziger falscher Registry-Eintrag kann dazu fuehren, dass Windows nicht mehr startet oder Programme abstuerzen. Eine vorherige Sicherung (Backup) macht Fehler risikolos rueckgaengig.",
  },

  // ---- Dateitypen ----
  {
    topic: "📄 Dateitypen",
    difficulty: "easy",
    question: "Welche Dateiendung kennzeichnet eine direkt ausfuehrbare Datei?",
    options: [".exe", ".txt", ".cfg"],
    correctIndex: 0,
    explanation: "\".exe\" (executable) fuehrt beim Doppelklick direkt Programmcode aus.",
  },
  {
    topic: "📄 Dateitypen",
    difficulty: "medium",
    question: "Was ist der Unterschied zwischen einer .exe- und einer .msi-Datei?",
    options: [
      ".exe fuehrt Code direkt aus; .msi ist ein Installationspaket, das kontrolliert ueber den Windows-Installer-Dienst verarbeitet wird (inkl. Protokollierung/Rollback)",
      "Beide sind technisch komplett identisch, nur unterschiedliche Dateiendung",
      ".msi kann nur Textdateien enthalten, .exe nur Programme",
    ],
    correctIndex: 0,
    explanation:
      "Der Windows-Installer-Dienst, der .msi-Pakete verarbeitet, protokolliert Installationsschritte und kann sie bei einem Fehler zurueckrollen - das macht Installationen zuverlaessiger als ein einfaches .exe.",
  },
  {
    topic: "📄 Dateitypen",
    difficulty: "hard",
    question:
      "Wozu dient eine .dll-Datei, und warum benoetigen viele Programme mehrere davon?",
    options: [
      "Eine DLL (Dynamic Link Library) enthaelt wiederverwendbaren Programmcode/Funktionen, den mehrere Programme gemeinsam nutzen koennen, statt ihn jeweils selbst mitzubringen",
      "DLL-Dateien sind nur fuer Bilder und Grafiken gedacht",
      "Jedes Programm braucht genau eine einzige DLL, mehr ist ein Fehler",
    ],
    correctIndex: 0,
    explanation:
      "DLLs buendeln Funktionen (z.B. fuer Netzwerk, Grafik, Textverarbeitung), die mehrere Programme gemeinsam nutzen - das spart Speicher und erleichtert Updates (eine DLL aktualisieren reicht fuer alle nutzenden Programme).",
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
