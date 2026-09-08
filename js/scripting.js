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
  {
    id: "ps-trycatch-basic",
    language: "powershell",
    difficulty: "medium",
    code: `try {\n    1/0\n} catch {\n    Write-Host "Fehler abgefangen: $($_.Exception.Message)"\n}`,
    options: [
      "Fehler abgefangen: Attempted to divide by zero.",
      "Das Skript bricht mit einer unbehandelten Ausnahme ab, der catch-Block wird nie erreicht",
      "(keine Ausgabe) - Division durch 0 ergibt in PowerShell stillschweigend 0",
      "Fehler abgefangen: (die Exception-Message ist in PowerShell grundsätzlich leer)",
    ],
    correctIndex: 0,
    explanation: "Division durch 0 ist in PowerShell ein terminierender Fehler - der catch-Block greift also, und $_.Exception.Message enthält die eigentliche .NET-Fehlermeldung (\"Attempted to divide by zero.\").",
  },
  {
    id: "ps-nonterminating-trap",
    language: "powershell",
    difficulty: "hard",
    code: `try {\n    Get-Item "C:\\nicht-vorhanden.txt"\n    Write-Host "Weiter gehts"\n} catch {\n    Write-Host "Fehler abgefangen"\n}`,
    options: [
      "Eine rote Fehlermeldung wird angezeigt, ABER danach trotzdem \"Weiter gehts\" ausgegeben - der catch-Block greift hier NICHT, weil Get-Item standardmässig einen non-terminating Fehler erzeugt",
      "Fehler abgefangen - der catch-Block wird wie erwartet ausgelöst",
      "Das Skript bricht sofort beim fehlgeschlagenen Get-Item ab, \"Weiter gehts\" wird nie erreicht",
      "(keine Ausgabe) - Get-Item unterdrückt Fehler bei nicht vorhandenen Dateien standardmässig",
    ],
    correctIndex: 0,
    explanation: "Die klassische PowerShell-Falle: Get-Item erzeugt bei einer fehlenden Datei standardmässig einen NON-terminating Fehler - das Skript zeigt zwar eine rote Fehlermeldung an, läuft aber sofort mit der nächsten Zeile weiter. Der catch-Block greift nur bei terminierenden Fehlern - ohne \"-ErrorAction Stop\" bleibt er hier wirkungslos, obwohl er im Code vorhanden ist.",
  },
  {
    id: "ps-erroraction-stop-fix",
    language: "powershell",
    difficulty: "hard",
    code: `try {\n    Get-Item "C:\\nicht-vorhanden.txt" -ErrorAction Stop\n    Write-Host "Weiter gehts"\n} catch {\n    Write-Host "Fehler abgefangen: Datei fehlt"\n}`,
    options: [
      "Fehler abgefangen: Datei fehlt",
      "Weiter gehts - ErrorAction Stop unterdrückt den Fehler nur, ändert aber nichts am Ablauf",
      "Eine rote Fehlermeldung, danach trotzdem \"Weiter gehts\" (wie ohne -ErrorAction Stop)",
      "Das Skript bricht ab, ohne dass \"Fehler abgefangen: Datei fehlt\" ausgegeben wird",
    ],
    correctIndex: 0,
    explanation: "-ErrorAction Stop erzwingt, dass dieser sonst non-terminating Fehler als TERMINATING behandelt wird - dadurch greift der catch-Block jetzt tatsächlich, \"Weiter gehts\" wird nicht mehr erreicht, und die eigene Fehlermeldung wird ausgegeben.",
  },
  {
    id: "ps-finally-always",
    language: "powershell",
    difficulty: "medium",
    code: `try {\n    Write-Host "Versuch"\n    throw "Etwas ging schief"\n} catch {\n    Write-Host "Abgefangen"\n} finally {\n    Write-Host "Aufraeumen"\n}`,
    options: [
      "Versuch\nAbgefangen\nAufraeumen",
      "Versuch\nAufraeumen (der catch-Block wird übersprungen, sobald finally vorhanden ist)",
      "Versuch\nAbgefangen (finally läuft nur, wenn KEIN Fehler auftrat)",
      "Aufraeumen\nVersuch\nAbgefangen (finally läuft immer zuerst)",
    ],
    correctIndex: 0,
    explanation: "throw löst einen terminierenden Fehler aus, der catch-Block fängt ihn ab (\"Abgefangen\") - und der finally-Block läuft danach IMMER, egal ob ein Fehler auftrat oder abgefangen wurde. Alle drei Zeilen erscheinen daher in dieser Reihenfolge.",
  },
  {
    id: "ps-no-error-handling",
    language: "powershell",
    difficulty: "easy",
    code: `Write-Host "Start"\nRemove-Item "C:\\datei-existiert-nicht.txt"\nWrite-Host "Ende"`,
    options: [
      "Start, dann eine rote Fehlermeldung, danach trotzdem Ende - das Skript läuft ohne jede Fehlerbehandlung stur weiter",
      "Nur Start - das Skript bricht beim fehlgeschlagenen Remove-Item sofort ab",
      "Start, Ende - der Fehler wird komplett unterdrückt und ist nirgends sichtbar",
      "Eine Fehlermeldung ersetzt sowohl Start als auch Ende komplett",
    ],
    correctIndex: 0,
    explanation: "Ohne jede Fehlerbehandlung (kein try/catch, kein -ErrorAction) zeigt PowerShell bei einem non-terminating Fehler wie diesem einfach eine rote Fehlermeldung an und macht danach ganz normal mit der nächsten Zeile weiter - das Skript wirkt am Ende scheinbar erfolgreich durchgelaufen, obwohl mittendrin etwas fehlgeschlagen ist.",
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
  const shuffledOrder = shuffleArray(currentChallenge.options.map((_, i) => i));
  shuffledOrder.forEach((idx) => {
    const opt = currentChallenge.options[idx];
    const item = document.createElement("div");
    item.className = "option-item";
    item.dataset.origIndex = String(idx);
    item.innerHTML = `<input type="radio" name="script-option" /> <span class="mono">${escapeHtml(opt)}</span>`;
    item.addEventListener("click", () => selectOption(idx));
    optionsEl.appendChild(item);
  });

  updateScorePill();
}

function selectOption(idx) {
  selectedOptionIndex = idx;
  document.querySelectorAll("#options-list .option-item").forEach((el) => {
    const match = Number(el.dataset.origIndex) === idx;
    el.classList.toggle("selected", match);
    el.querySelector("input").checked = match;
  });
}

function checkAnswer() {
  if (selectedOptionIndex === null || !currentChallenge) return;

  const correct = selectedOptionIndex === currentChallenge.correctIndex;
  document.querySelectorAll("#options-list .option-item").forEach((el) => {
    const origIdx = Number(el.dataset.origIndex);
    if (origIdx === currentChallenge.correctIndex) el.classList.add("correct-answer");
    if (origIdx === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
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
