/*
 * packaging.js - Modul: Software-Paketierung (MSI/MST/EXE, Repackaging)
 * Konzept-Erklärung + ein schwierigkeitsgestuftes Quiz zu MSI-Aufbau,
 * Transforms, stiller Installation per CMD und Repackaging (RayPack).
 */

const MODULE_ID = "packaging";

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist eine .mst-Datei (Transform)?",
    options: [
      "Eine Datei mit Anpassungen, die beim Installieren auf eine Basis-MSI angewendet werden, ohne die Original-MSI selbst zu verändern",
      "Eine komprimierte Kopie der gesamten MSI-Datei",
      "Eine Log-Datei, die nach der Installation erzeugt wird",
    ],
    correctIndex: 0,
    explanation:
      "Ein Transform ist wie eine Schablone, die über die Basis-MSI gelegt wird: er beschreibt nur die Unterschiede (z.B. anderer Installationspfad, deaktiviertes Feature, zusätzlicher Registry-Eintrag). Die ursprüngliche MSI-Datei bleibt dabei unverändert - das Transform wird erst beim Installieren dazugeladen.",
  },
  {
    difficulty: "easy",
    question:
      "Welcher msiexec-Parameter installiert eine MSI komplett unbeaufsichtigt, ganz ohne jede Anzeige?",
    options: [
      "/qn - unterdrückt jegliche Benutzeroberfläche (\"quiet, no UI\")",
      "/i - löst die Installation überhaupt erst aus, zeigt aber ohne Zusatzparameter weiterhin die normale Oberfläche",
      "/x - deinstalliert das Paket, statt es zu installieren",
      "/l*v - aktiviert ein ausführliches Installationsprotokoll, blendet die Oberfläche aber nicht aus",
    ],
    correctIndex: 0,
    explanation:
      "/qn (\"quiet, no UI\") unterdrückt jegliche Benutzeroberfläche. /i installiert (mit UI, falls kein /qn dabei ist), /x deinstalliert, /l*v aktiviert eine ausführliche Log-Datei.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Deployment-Skript prüft nach der Installation nur, ob der Exitcode exakt 0 ist - bei allem anderen meldet es einen Fehler. Die Installation liefert Exitcode 3010. Was ist das Problem?",
    options: [
      "3010 bedeutet ebenfalls Erfolg, nur mit noch ausstehendem Neustart (ERROR_SUCCESS_REBOOT_REQUIRED) - das Skript meldet hier fälschlicherweise einen Fehler, obwohl die Installation geklappt hat",
      "3010 ist ein schwerer Fehler, das Skript verhält sich korrekt",
      "Exitcodes ungleich 0 kommen bei MSI-Installationen praktisch nie vor",
    ],
    correctIndex: 0,
    explanation:
      "3010 ist einer der häufigsten Stolpersteine bei automatisierten Deployments: es signalisiert Erfolg, aber einen noch ausstehenden Neustart. Skripte sollten deshalb sowohl 0 als auch 3010 als Erfolg werten.",
  },
  {
    difficulty: "medium",
    question:
      "Welche MSI-Tabelle legt fest, welche Datei zu welcher Komponente (Component) gehört?",
    options: [
      "Die File-Tabelle (in Verbindung mit der Component-Tabelle)",
      "Die Property-Tabelle",
      "Die InstallExecuteSequence-Tabelle",
    ],
    correctIndex: 0,
    explanation:
      "Die File-Tabelle listet jede einzelne Datei mit einer Referenz auf ihre Component. Die Component-Tabelle wiederum definiert, welche Dateien, Registry-Einträge und Verknüpfungen zusammen als EINE atomare Einheit installiert/entfernt werden.",
  },
  {
    difficulty: "medium",
    question:
      "Warum werden Dateien, Registry-Einträge und Verknüpfungen in \"Components\" gruppiert, statt sie einzeln zu verwalten?",
    options: [
      "Eine Component ist die atomare Installations-/Deinstallationseinheit - alles darin wird gemeinsam installiert oder entfernt, das verhindert inkonsistente Zwischenzustände",
      "Das ist nur eine optische Gruppierung im MSI-Editor ohne technische Bedeutung",
      "Components dienen ausschliesslich der Lizenzverwaltung",
    ],
    correctIndex: 0,
    explanation:
      "Der Windows Installer garantiert Konsistenz auf Component-Ebene: entweder ist eine komplette Component installiert oder nicht - nie nur die Hälfte ihrer Dateien. Das ist zentral für zuverlässige Reparatur- und Deinstallationslogik.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Installer liegt nur als .exe ohne dokumentierte Parameter vor. Was probiert man typischerweise zuerst, um eine stille Installation zu ermöglichen?",
    options: [
      "setup.exe /? oder /help ausprobieren, bekannte Engine-typische Parameter testen (z.B. InstallShield, NSIS, InnoSetup) und/oder Verbose-Logging aktivieren",
      "Die .exe direkt in eine .msi umbenennen",
      "Es gibt keine Möglichkeit, eine .exe jemals still zu installieren",
    ],
    correctIndex: 0,
    explanation:
      "Viele EXE-Installer basieren auf bekannten Erstellungswerkzeugen (InstallShield, NSIS, InnoSetup, WiX-Bundles), die jeweils typische Silent-Parameter unterstützen (z.B. /S bei NSIS, /VERYSILENT bei InnoSetup). Oft hilft schon `/?`/`/help`, oder man identifiziert die Engine über Datei-Eigenschaften/Strings.",
  },
  {
    difficulty: "hard",
    question:
      "Was ist der Kernunterschied zwischen einer nativ erstellten MSI und einer per Repackaging (Snapshot-Vergleich) erzeugten MSI?",
    options: [
      "Repackaging bildet nur die AUSWIRKUNGEN einer Installation nach (Datei-/Registry-Unterschiede), nicht zwingend die Logik/Custom Actions des Originalinstallers",
      "Beide sind technisch in jeder Hinsicht identisch",
      "Eine repackagete MSI enthält automatisch den kompletten Quellcode der Anwendung",
    ],
    correctIndex: 0,
    explanation:
      "Repackaging erfasst, WAS sich auf dem System verändert hat (neue Dateien, Registry-Einträge) - nicht WARUM oder WIE (z.B. Treiberinstallationen, Dienste-Konfiguration über Custom Actions). Das macht es universell einsetzbar, aber bei komplexer Installationslogik manchmal unvollständig.",
  },
  {
    difficulty: "hard",
    question:
      "Bei der Installation werden zwei Transforms angewendet: TRANSFORMS=a.mst;b.mst. Beide ändern dieselbe Property. Was passiert?",
    options: [
      "Es gilt die Reihenfolge - das später aufgeführte Transform (b.mst) überschreibt die Änderung des vorherigen an dieser Stelle",
      "Windows Installer bricht die Installation mit einem Fehler ab",
      "Beide Werte werden automatisch zu einem kombiniert",
    ],
    correctIndex: 0,
    explanation:
      "Transforms werden nacheinander in der angegebenen Reihenfolge angewendet - wie Schablonen, die nacheinander übereinandergelegt werden. Bei einem Konflikt gewinnt schlicht das zuletzt angewendete Transform.",
  },
  {
    difficulty: "hard",
    question: "Wofür stehen bei RayPack die Projektdateien .rcp und .rpp?",
    options: [
      "RCP: das rohe Erfassungsprojekt mit dem unbearbeiteten Vorher-/Nachher-Snapshot-Vergleich; RPP: das daraus abgeleitete, editierbare Repackaging-Projekt, aus dem am Ende die fertige MSI kompiliert wird",
      "RCP und RPP sind zwei alternative Namen für dieselbe Datei ohne inhaltlichen Unterschied",
      "RCP ist die fertige MSI, RPP ist eine Sicherungskopie davon",
    ],
    correctIndex: 0,
    explanation:
      "RayPack trennt bewusst zwischen dem rohen Erfassungsergebnis (.rcp - was der Snapshot-Vergleich technisch gefunden hat) und dem daraus aufbereiteten, von Hand bereinigbaren Projekt (.rpp), aus dem am Ende die auslieferbare MSI erzeugt wird. So kann man die Rohdaten unverändert aufbewahren und trotzdem frei am eigentlichen Paket feilen.",
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
      item.innerHTML = `<input type="radio" name="pkq${qIdx}" /> <span>${opt}</span>`;
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
});
