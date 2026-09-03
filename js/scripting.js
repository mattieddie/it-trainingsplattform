/*
 * scripting.js - Modul 11: Skripting-Grundlagen (Batch &amp; PowerShell)
 * Kein echter Interpreter: kurze Skripte werden angezeigt, die Aufgabe ist,
 * die tatsächliche Ausgabe aus mehreren Optionen vorherzusagen - inkl.
 * gängiger Stolperfallen (Off-by-one, Batch-Verzögerungsproblem).
 */

const MODULE_ID = "scripting";

const CHALLENGES = [
  {
    id: "ps-add",
    language: "powershell",
    difficulty: "easy",
    code: `$x = 5\n$y = 3\nWrite-Host ($x + $y)`,
    options: ["8", "53", "5 + 3", "Fehler"],
    correctIndex: 0,
    explanation: "$x und $y sind Zahlen, ($x + $y) wird arithmetisch ausgewertet (5 + 3 = 8), bevor Write-Host es ausgibt.",
  },
  {
    id: "batch-var",
    language: "batch",
    difficulty: "easy",
    code: `@echo off\nset NAME=Welt\necho Hallo %NAME%`,
    options: ["Hallo Welt", "Hallo %NAME%", "Fehler: NAME nicht definiert", "(keine Ausgabe)"],
    correctIndex: 0,
    explanation: "%NAME% wird vor der Ausführung von echo durch den gesetzten Wert \"Welt\" ersetzt.",
  },
  {
    id: "ps-foreach",
    language: "powershell",
    difficulty: "easy",
    code: `foreach ($i in 1..3) { Write-Host $i }`,
    options: [
      "1\n2\n3 (jede Zahl in eigener Zeile)",
      "1 2 3 (alles in einer Zeile)",
      "0\n1\n2",
      "3\n2\n1",
    ],
    correctIndex: 0,
    explanation: "1..3 erzeugt die Sequenz 1,2,3. Jeder Write-Host-Aufruf erzeugt eine eigene Ausgabezeile.",
  },
  {
    id: "ps-ifelse",
    language: "powershell",
    difficulty: "medium",
    code: `$n = 7\nif ($n % 2 -eq 0) { Write-Host "Gerade" } else { Write-Host "Ungerade" }`,
    options: ["Ungerade", "Gerade", "7", "Fehler"],
    correctIndex: 0,
    explanation: "7 % 2 ergibt 1 (Rest), also ist die Bedingung ($n % 2 -eq 0) falsch, und der else-Zweig (\"Ungerade\") wird ausgeführt.",
  },
  {
    id: "batch-for",
    language: "batch",
    difficulty: "medium",
    code: `for %%i in (1 2 3) do echo Wert: %%i`,
    options: [
      "Wert: 1\nWert: 2\nWert: 3",
      "Wert: 1 2 3",
      "Wert: %%i (dreimal, ohne Ersetzung)",
      "Fehler",
    ],
    correctIndex: 0,
    explanation: "Die for-Schleife durchläuft die Liste (1 2 3) und führt \"echo Wert: %%i\" für jeden Wert einzeln aus.",
  },
  {
    id: "ps-array-loop",
    language: "powershell",
    difficulty: "medium",
    code: `$arr = @("a","b","c")\nfor ($i=0; $i -lt $arr.Length; $i++) { Write-Host $arr[$i] }`,
    options: [
      "a\nb\nc",
      "a\nb (das letzte Element fehlt)",
      "b\nc (das erste Element fehlt)",
      "Fehler: Index ausserhalb des Bereichs",
    ],
    correctIndex: 0,
    explanation: "$arr.Length ist 3, die Schleife läuft für $i = 0, 1, 2 - also genau über alle drei Indizes des Arrays.",
  },
  {
    id: "batch-if-gtr",
    language: "batch",
    difficulty: "medium",
    code: `set /a x=10\nif %x% GTR 5 (\n  echo Gross\n) else (\n  echo Klein\n)`,
    options: ["Gross", "Klein", "10", "Fehler"],
    correctIndex: 0,
    explanation: "%x% wird zu 10 ersetzt, 10 GTR 5 (\"greater than\") ist wahr, also wird \"Gross\" ausgegeben.",
  },
  {
    id: "ps-accumulator",
    language: "powershell",
    difficulty: "hard",
    code: `$total = 0\nforeach ($i in 1..5) {\n    if ($i % 2 -eq 0) { $total += $i }\n}\nWrite-Host $total`,
    options: ["6", "15", "9", "0"],
    correctIndex: 0,
    explanation: "Nur die geraden Zahlen zwischen 1 und 5 (2 und 4) werden aufaddiert: 2 + 4 = 6.",
  },
  {
    id: "ps-function",
    language: "powershell",
    difficulty: "hard",
    code: `function Doppelt($x) { return $x * 2 }\n$result = (Doppelt 4) + (Doppelt 3)\nWrite-Host $result`,
    options: ["14", "7", "43", "24"],
    correctIndex: 0,
    explanation: "Doppelt 4 ergibt 8, Doppelt 3 ergibt 6. 8 + 6 = 14.",
  },
  {
    id: "ps-string",
    language: "powershell",
    difficulty: "hard",
    code: `$s = "PowerShell"\nWrite-Host $s.ToUpper().Substring(0,5)`,
    options: ["POWER", "POWERSHELL", "power", "Fehler"],
    correctIndex: 0,
    explanation: ".ToUpper() macht daraus \"POWERSHELL\", .Substring(0,5) nimmt davon die ersten 5 Zeichen: \"POWER\".",
  },
  {
    id: "ps-pipeline-count",
    language: "powershell",
    difficulty: "hard",
    code: `$nums = 1..10\n$even = $nums | Where-Object { $_ % 2 -eq 0 }\nWrite-Host $even.Count`,
    options: ["5", "10", "2 4 6 8 10", "0"],
    correctIndex: 0,
    explanation: "Where-Object filtert auf gerade Zahlen: 2,4,6,8,10 - das sind 5 Stück, .Count gibt diese Anzahl aus.",
  },
  {
    id: "batch-delayed-expansion-trap",
    language: "batch",
    difficulty: "hard",
    code: `@echo off\nset /a count=0\nfor %%i in (1 2 3 4) do (\n  set /a count+=1\n)\necho %count%`,
    options: [
      "0 - klassische Batch-Falle: %count% wird beim Parsen des geklammerten Blocks einmalig durch den Wert VOR der Schleife ersetzt",
      "4 - die Schleife zählt korrekt hoch",
      "1 - nur der letzte Durchlauf zählt",
      "Fehler: count ist nicht definiert",
    ],
    correctIndex: 0,
    explanation: "In Batch werden Variablen in einem geklammerten Block (hier die for-Schleife) beim Parsen einmalig ersetzt - %count% wird also durch den Wert zu Beginn (0) ersetzt, nicht den Endwert. Um den tatsächlichen Endwert zu bekommen, braucht es \"setlocal enabledelayedexpansion\" und \"!count!\" statt \"%count%\".",
  },
];

let currentChallenge = null;

function loadSolvedSet() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solved) ? stored.solved : [];
}

function candidatePool() {
  const language = document.getElementById("language-select").value;
  const difficulty = document.getElementById("difficulty-select").value;
  return CHALLENGES.filter(
    (c) =>
      (language === "all" || c.language === language) &&
      (difficulty === "all" || c.difficulty === difficulty)
  );
}

function pickChallenge() {
  const candidates = candidatePool();
  const solved = loadSolvedSet();
  const unsolved = candidates.filter((c) => !solved.includes(c.id));
  const pool = unsolved.length > 0 ? unsolved : candidates;
  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let selectedOptionIndex = null;

function renderChallenge() {
  currentChallenge = pickChallenge();
  selectedOptionIndex = null;

  const fb = document.getElementById("challenge-feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";

  if (!currentChallenge) {
    document.getElementById("code-block").textContent =
      "Keine Aufgaben für diese Filterkombination gefunden.";
    document.getElementById("options-list").innerHTML = "";
    document.getElementById("check-btn").disabled = true;
    return;
  }
  document.getElementById("check-btn").disabled = false;

  const langBadge = document.getElementById("language-badge");
  langBadge.textContent = currentChallenge.language === "powershell" ? "PowerShell" : "Batch";
  langBadge.className =
    "badge " + (currentChallenge.language === "powershell" ? "status-progress" : "status-none");

  const diffBadge = document.getElementById("challenge-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentChallenge.difficulty];
  diffBadge.className = "badge difficulty-" + currentChallenge.difficulty;

  document.getElementById("code-block").textContent = currentChallenge.code;

  const optionsEl = document.getElementById("options-list");
  optionsEl.innerHTML = "";
  currentChallenge.options.forEach((opt, idx) => {
    const item = document.createElement("div");
    item.className = "option-item";
    item.innerHTML = `<input type="radio" name="script-option" /> <span class="mono">${escapeHtml(opt)}</span>`;
    item.addEventListener("click", () => selectOption(idx));
    optionsEl.appendChild(item);
  });

  updateScorePill();
}

function selectOption(idx) {
  selectedOptionIndex = idx;
  document.querySelectorAll("#options-list .option-item").forEach((el, i) => {
    el.classList.toggle("selected", i === idx);
    el.querySelector("input").checked = i === idx;
  });
}

function checkAnswer() {
  if (selectedOptionIndex === null || !currentChallenge) return;

  const correct = selectedOptionIndex === currentChallenge.correctIndex;
  document.querySelectorAll("#options-list .option-item").forEach((el, i) => {
    if (i === currentChallenge.correctIndex) el.classList.add("correct-answer");
    if (i === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
  });

  const fb = document.getElementById("challenge-feedback");
  fb.classList.remove("hidden");
  fb.className = "feedback-box " + (correct ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correct ? "Richtig!" : "Nicht ganz."}</strong> ${currentChallenge.explanation}`;

  document.getElementById("check-btn").disabled = true;

  if (correct) markSolved(currentChallenge.id);
}

function markSolved(id) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solved || []);
  solved.add(id);
  const solvedArr = Array.from(solved);
  const status = solvedArr.length >= CHALLENGES.length ? "done" : "progress";
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, status, { solved: solvedArr });
  updateScorePill();
  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateScorePill() {
  const solved = loadSolvedSet();
  document.getElementById(
    "score-pill"
  ).textContent = `Gelöst: ${solved.length} / ${CHALLENGES.length} Skripte`;
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderChallenge();

  document.getElementById("check-btn").addEventListener("click", checkAnswer);
  document.getElementById("next-btn").addEventListener("click", renderChallenge);
  document.getElementById("language-select").addEventListener("change", renderChallenge);
  document.getElementById("difficulty-select").addEventListener("change", renderChallenge);
});
