/*
 * backup.js - Modul 9: Backup & Recovery / 3-2-1-Regel
 * Teil 1: generierte RPO/RTO-Rechenaufgaben (drei Schwierigkeitsstufen).
 * Teil 2: 3-2-1- und Ransomware-Szenario-Quiz (schwierigkeitsgestuft).
 */

const MODULE_ID = "backup";
const GOAL_CORRECT = 8;

/* ================= Teil 1: RPO/RTO-Rechenaufgaben ================= */

let currentTask = null;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatClock(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateEasyTask() {
  const interval = choice([1, 2, 3, 4, 6, 8, 12, 24]);
  return {
    difficulty: "easy",
    prompt: `Ein System wird alle ${interval} Stunden gesichert.`,
    question: "Wie hoch ist der maximale RPO (in Stunden) bei diesem Intervall?",
    fields: [{ id: "rpo", label: "Maximaler RPO (Stunden)", answer: interval }],
  };
}

function generateMediumTask() {
  const interval = choice([4, 6, 8, 12, 24]);
  let requirement = choice([2, 4, 6, 8, 12, 24]);
  // Bewusst manchmal gleich, manchmal unterschiedlich lassen (auch "gerade noch erfüllt" ist lehrreich).
  const compliant = interval <= requirement;
  return {
    difficulty: "medium",
    prompt: `Aktuell wird alle ${interval} Stunden gesichert. Die Geschäftsanforderung verlangt einen RPO von höchstens ${requirement} Stunden.`,
    question:
      "Erfüllt das aktuelle Intervall die Anforderung, und wie viele Stunden darf das Intervall maximal betragen, um sie einzuhalten?",
    fields: [
      { id: "compliant", label: "Anforderung erfüllt?", type: "select", answer: compliant ? "ja" : "nein" },
      { id: "maxInterval", label: "Maximal zulässiges Intervall (Stunden)", answer: requirement },
    ],
  };
}

function generateHardTask() {
  const lastBackupHour = randInt(0, 10);
  const lastBackupMinute = choice([0, 30]);
  const gapHours = choice([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 7.5, 8]);
  const lastBackupTotal = lastBackupHour * 60 + lastBackupMinute;
  const failureTotal = lastBackupTotal + gapHours * 60;
  const restoreDurationHours = randInt(1, 6);
  const recoveryTotal = failureTotal + restoreDurationHours * 60;

  const rpoTarget = choice([2, 4, 6, 8, 12, 24]);
  const rtoTarget = choice([1, 2, 3, 4, 6, 8]);
  const compliant = gapHours <= rpoTarget && restoreDurationHours <= rtoTarget;

  return {
    difficulty: "hard",
    prompt:
      `Letztes Backup: ${formatClock(lastBackupTotal)} Uhr. Ausfall: ${formatClock(
        failureTotal
      )} Uhr. Die Wiederherstellung dauert ab Ausfallzeitpunkt ${restoreDurationHours} Stunden. ` +
      `Vorgabe: RPO &le; ${rpoTarget}h, RTO &le; ${rtoTarget}h.`,
    question:
      "Wie viele Stunden Daten gehen im schlimmsten Fall verloren, um wie viel Uhr sind die Daten spätestens wiederhergestellt, und werden beide Vorgaben (RPO und RTO) eingehalten?",
    fields: [
      { id: "dataloss", label: "Datenverlust (Stunden)", answer: gapHours },
      { id: "recoveryTime", label: "Daten wieder verfügbar um (HH:MM)", answer: formatClock(recoveryTotal) },
      { id: "compliant", label: "Beide Vorgaben eingehalten?", type: "select", answer: compliant ? "ja" : "nein" },
    ],
  };
}

function generateTask(difficulty) {
  if (difficulty === "easy") return generateEasyTask();
  if (difficulty === "medium") return generateMediumTask();
  return generateHardTask();
}

function renderTaskFields(task) {
  const container = document.getElementById("task-fields");
  container.innerHTML = "";
  task.fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    if (field.type === "select") {
      wrapper.innerHTML = `
        <label for="field-${field.id}">${field.label}</label>
        <select id="field-${field.id}">
          <option value="">-- wählen --</option>
          <option value="ja">Ja</option>
          <option value="nein">Nein</option>
        </select>
      `;
    } else {
      wrapper.innerHTML = `
        <label for="field-${field.id}">${field.label}</label>
        <input type="text" id="field-${field.id}" placeholder="Antwort" />
      `;
    }
    container.appendChild(wrapper);
  });
}

function renderTask() {
  const difficulty = document.getElementById("task-difficulty-select").value;
  currentTask = generateTask(difficulty);

  const diffBadge = document.getElementById("task-difficulty-badge");
  diffBadge.textContent = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[difficulty];
  diffBadge.className = "badge difficulty-" + difficulty;

  document.getElementById("task-prompt").innerHTML = currentTask.prompt;
  document.getElementById("task-question").textContent = currentTask.question;
  renderTaskFields(currentTask);

  const fb = document.getElementById("task-feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";
}

function normalizeNumericAnswer(value) {
  return parseFloat(String(value).replace(",", "."));
}

function checkTask() {
  if (!currentTask) return;

  let allCorrect = true;
  const details = [];

  currentTask.fields.forEach((field) => {
    const inputEl = document.getElementById("field-" + field.id);
    const given = inputEl.value.trim();
    let correct;
    if (field.type === "select") {
      correct = given.toLowerCase() === String(field.answer).toLowerCase();
    } else if (typeof field.answer === "number") {
      const num = normalizeNumericAnswer(given);
      correct = !Number.isNaN(num) && Math.abs(num - field.answer) < 0.01;
    } else {
      correct = given.toLowerCase() === String(field.answer).toLowerCase();
    }
    inputEl.closest(".field").classList.toggle("field-correct", correct);
    inputEl.closest(".field").classList.toggle("field-incorrect", !correct);
    if (!correct) allCorrect = false;
    details.push(`${field.label}: <span class="mono">${field.answer}</span>`);
  });

  updateTaskScore(allCorrect);

  const fb = document.getElementById("task-feedback");
  fb.classList.remove("hidden");
  if (allCorrect) {
    fb.className = "feedback-box correct";
    fb.innerHTML = "<strong>Richtig!</strong> Alle Werte stimmen.";
  } else {
    fb.className = "feedback-box incorrect";
    fb.innerHTML = `<strong>Nicht ganz richtig.</strong> Korrekte Werte:<br>${details.join("<br>")}`;
  }
}

function updateTaskScore(wasCorrect) {
  const progress = loadProgress();
  const prev = progress[MODULE_ID] || {};
  const totalCount = (prev.totalCount || 0) + 1;
  const correctCount = (prev.correctCount || 0) + (wasCorrect ? 1 : 0);

  const quizDone = Boolean(prev.quizDone);
  const tasksDone = correctCount >= GOAL_CORRECT;
  const status = quizDone && tasksDone ? "done" : "progress";
  const wasDone = prev.status === "done";
  setModuleStatus(MODULE_ID, status, { totalCount, correctCount });

  renderScorePill(correctCount, totalCount);
  updateChecklist({ correctCount, quizDone });

  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function renderScorePill(correctCount, totalCount) {
  document.getElementById(
    "task-score-pill"
  ).textContent = `${correctCount || 0} / ${GOAL_CORRECT} richtig (insgesamt ${totalCount || 0} Versuche)`;
}

/* ================= Teil 2: 3-2-1- & Ransomware-Quiz ================= */

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was verlangt die 3-2-1-Backup-Regel?",
    options: [
      "3 Kopien der Daten, auf 2 verschiedenen Medientypen, davon 1 Kopie ausserhalb des Standorts (offsite)",
      "3 verschiedene Administratoren müssen jedes Backup freigeben",
      "Backups müssen 3-mal täglich auf 2 Servern in 1 Rechenzentrum laufen",
    ],
    correctIndex: 0,
    explanation:
      "Die 3-2-1-Regel ist eine einfache Faustregel: 3 Kopien der Daten (Original + 2 Backups), auf 2 unterschiedlichen Medientypen/Systemen, davon mindestens 1 Kopie an einem anderen Standort (offsite) - damit ein einzelnes Ereignis (Feuer, Diebstahl, Ransomware) nicht alle Kopien gleichzeitig vernichtet.",
  },
  {
    difficulty: "easy",
    question: "Was ist der Unterschied zwischen RPO und RTO?",
    options: [
      "RPO = maximal tolerierbarer Datenverlust (Zeitspanne); RTO = maximal tolerierbare Ausfallzeit bis zur Wiederherstellung",
      "RPO = wie schnell wiederhergestellt wird; RTO = wie viele Daten verloren gehen dürfen",
      "Beide beschreiben exakt dasselbe, nur unterschiedliche Abkürzungen",
    ],
    correctIndex: 0,
    explanation:
      "RPO (Recovery Point Objective) beantwortet 'wie viel Datenverlust ist akzeptabel?' - bestimmt durch die Backup-Frequenz. RTO (Recovery Time Objective) beantwortet 'wie lange darf der Ausfall dauern, bis alles wieder läuft?' - bestimmt durch die Restore-Geschwindigkeit.",
  },
  {
    difficulty: "medium",
    question:
      "Original auf dem Fileserver + täglich ein Backup auf einer ständig angeschlossenen externen Festplatte im selben Serverraum. Sonst nichts. Erfüllt das die 3-2-1-Regel?",
    options: ["Ja", "Nein"],
    correctIndex: 1,
    explanation:
      "Nein - es gibt nur 2 Kopien (Original + 1 Backup) und keine davon liegt offsite. Ausserdem ist die Festplatte ständig angeschlossen, was sie zusätzlich anfällig für Ransomware macht, die sich im Netzwerk ausbreitet.",
  },
  {
    difficulty: "medium",
    question:
      "Original auf dem Fileserver, Kopie auf einem NAS im selben Raum, Kopie auf einem Band, das wöchentlich in einen externen Tresor gebracht wird. Erfüllt das die 3-2-1-Regel?",
    options: ["Ja", "Nein"],
    correctIndex: 0,
    explanation:
      "Ja - 3 Kopien (Original, NAS, Band), 2 verschiedene Medientypen (Festplatte/NAS und Magnetband), und 1 Kopie ist offsite (Tresor).",
  },
  {
    difficulty: "hard",
    question:
      "Ransomware verschlüsselt am Montag um 14 Uhr sowohl den Fileserver als auch das direkt im Netzwerk erreichbare NAS-Backup. Es existiert zusätzlich ein wöchentliches Band-Backup vom letzten Sonntag, das nach der Sicherung physisch getrennt und im Tresor eingelagert wurde (offline/air-gapped). Welche Kopie ist zur Wiederherstellung sicher nutzbar?",
    options: [
      "Das Band-Backup, weil es physisch/logisch getrennt (air-gapped) und daher für die Ransomware nicht erreichbar war",
      "Das NAS-Backup, weil es die aktuelleren Daten enthält",
      "Beide Kopien sind gleich sicher nutzbar",
    ],
    correctIndex: 0,
    explanation:
      "Vernetzt erreichbare Backups (wie das NAS hier) können von derselben Ransomware-Welle mitverschlüsselt werden. Eine offline/air-gapped Kopie (oder unveränderlicher/immutabler Speicher) ist der entscheidende Schutz, weil die Schadsoftware sie schlicht nicht erreichen kann - auch wenn die Daten dadurch etwas älter sind.",
  },
  {
    difficulty: "hard",
    question:
      "Nach einer Vollsicherung laufen tägliche Zusatzsicherungen. Ein Restore soll möglichst wenige einzelne Sicherungen benötigen (schneller Restore), auch wenn dafür mehr Speicherplatz pro Sicherung nötig ist. Welcher Sicherungstyp passt dazu am besten?",
    options: [
      "Differenzielle Sicherung (jede Sicherung enthält alle Änderungen seit der letzten Vollsicherung - Restore braucht nur Vollsicherung + die letzte differenzielle Sicherung)",
      "Inkrementelle Sicherung (jede Sicherung enthält nur Änderungen seit der letzten Sicherung - Restore braucht Vollsicherung + ALLE inkrementellen Sicherungen in Reihenfolge)",
      "Beide Typen benötigen beim Restore immer gleich viele Sicherungen",
    ],
    correctIndex: 0,
    explanation:
      "Differenzielle Sicherungen wachsen zwar täglich (jede enthält alle Änderungen seit der Vollsicherung), machen den Restore aber einfach und schnell: nur Vollsicherung + letzte differenzielle Sicherung. Inkrementelle Sicherungen sind platzsparender, brauchen beim Restore aber die Vollsicherung plus JEDE einzelne inkrementelle Sicherung in der richtigen Reihenfolge.",
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
      item.innerHTML = `<input type="radio" name="bkq${qIdx}" /> <span>${opt}</span>`;
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

  const progress = loadProgress();
  const prev = progress[MODULE_ID] || {};
  const tasksDone = (prev.correctCount || 0) >= GOAL_CORRECT;
  const status = allCorrect && tasksDone ? "done" : "progress";
  const wasDone = prev.status === "done";
  setModuleStatus(MODULE_ID, status, { quizDone: allCorrect });
  updateChecklist({ correctCount: prev.correctCount || 0, quizDone: allCorrect });
  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

/* ================= Gemeinsam ================= */

function updateChecklist(state) {
  const taskItem = document.getElementById("check-tasks");
  const tasksDone = (state.correctCount || 0) >= GOAL_CORRECT;
  taskItem.classList.toggle("status-done", tasksDone);
  taskItem.textContent = tasksDone
    ? "✅ RPO/RTO-Rechenaufgaben: Ziel erreicht"
    : `⬜ RPO/RTO-Rechenaufgaben: ${state.correctCount || 0} / ${GOAL_CORRECT} richtig`;

  const quizItem = document.getElementById("check-quiz");
  quizItem.classList.toggle("status-done", Boolean(state.quizDone));
  quizItem.textContent = state.quizDone
    ? "✅ 3-2-1/Ransomware-Quiz vollständig richtig gelöst"
    : "⬜ 3-2-1/Ransomware-Quiz vollständig richtig lösen";
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);

  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  updateChecklist(stored);
  renderScorePill(stored.correctCount || 0, stored.totalCount || 0);
  if (stored.status === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderTask();
  document.getElementById("check-task-btn").addEventListener("click", checkTask);
  document.getElementById("new-task-btn").addEventListener("click", renderTask);
  document
    .getElementById("task-difficulty-select")
    .addEventListener("change", renderTask);

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
