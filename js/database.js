/*
 * database.js - Modul "Datenbanken": Testdatenbank, SQL-Sandbox (eigener,
 * stark vereinfachter SELECT-Interpreter, rein clientseitig) und
 * Abfrage-Aufgaben.
 */

const MODULE_ID = "databases";
const TASK_GOAL = 9;

/* ---------- Testdatenbank (offen einsehbar) ---------- */

const SCHEMAS = {
  kunden: {
    columns: ["kunden_id", "vorname", "nachname", "ort"],
    rows: [
      { kunden_id: 1, vorname: "Max", nachname: "Maler", ort: "Zürich" },
      { kunden_id: 2, vorname: "Heidi", nachname: "Huber", ort: "Bern" },
      { kunden_id: 3, vorname: "Willi", nachname: "Weber", ort: "Zürich" },
      { kunden_id: 4, vorname: "Sandra", nachname: "Steiner", ort: "Basel" },
      { kunden_id: 5, vorname: "Petra", nachname: "Peters", ort: "Bern" },
      { kunden_id: 6, vorname: "Thomas", nachname: "Meier", ort: "Luzern" },
    ],
  },
  bestellungen: {
    columns: ["bestellnummer", "kunden_id", "bestelldatum", "status"],
    rows: [
      { bestellnummer: 1, kunden_id: 3, bestelldatum: "2026-02-01", status: "geliefert" },
      { bestellnummer: 2, kunden_id: 2, bestelldatum: "2026-01-12", status: "geliefert" },
      { bestellnummer: 3, kunden_id: 2, bestelldatum: "2026-01-12", status: "storniert" },
      { bestellnummer: 4, kunden_id: 1, bestelldatum: "2026-01-28", status: "geliefert" },
      { bestellnummer: 5, kunden_id: 4, bestelldatum: "2026-02-15", status: "offen" },
      { bestellnummer: 6, kunden_id: 6, bestelldatum: "2026-02-20", status: "offen" },
      { bestellnummer: 7, kunden_id: 1, bestelldatum: "2026-03-01", status: "geliefert" },
    ],
  },
  artikel: {
    columns: ["artikel_id", "name", "preis"],
    rows: [
      { artikel_id: 101, name: "USB-Stick 64GB", preis: 12.9 },
      { artikel_id: 102, name: "Netzwerkkabel 5m", preis: 8.5 },
      { artikel_id: 103, name: "Ersatzmaus", preis: 19.9 },
      { artikel_id: 104, name: "Tastatur", preis: 34.9 },
      { artikel_id: 105, name: "Monitorhalterung", preis: 45.0 },
    ],
  },
  bestellposten: {
    columns: ["bestellnummer", "artikel_id", "anzahl"],
    rows: [
      { bestellnummer: 1, artikel_id: 101, anzahl: 2 },
      { bestellnummer: 1, artikel_id: 103, anzahl: 1 },
      { bestellnummer: 2, artikel_id: 102, anzahl: 3 },
      { bestellnummer: 3, artikel_id: 104, anzahl: 1 },
      { bestellnummer: 4, artikel_id: 101, anzahl: 1 },
      { bestellnummer: 4, artikel_id: 105, anzahl: 1 },
      { bestellnummer: 5, artikel_id: 103, anzahl: 2 },
      { bestellnummer: 6, artikel_id: 102, anzahl: 1 },
      { bestellnummer: 7, artikel_id: 104, anzahl: 1 },
      { bestellnummer: 7, artikel_id: 105, anzahl: 2 },
    ],
  },
};

/* ---------- Sehr einfacher SELECT-Interpreter ----------
 * Unterstützt: SELECT * | col1, col2 FROM tabelle
 *              [JOIN tabelle2 ON t1.col = t2.col]*
 *              [WHERE bedingung [AND|OR bedingung]*]
 *              [ORDER BY spalte [ASC|DESC]]
 * Bedingungen: =, !=, <>, >, <, >=, <=, LIKE ('%...%')
 * Bewusst NICHT unterstützt: Klammern in WHERE, Aggregatfunktionen
 * (COUNT/SUM/...), INSERT/UPDATE/DELETE (reine Lese-Sandbox).
 */

function likeToRegex(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withWildcards = escaped.replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp("^" + withWildcards + "$", "i");
}

function parseValue(raw) {
  const trimmed = raw.trim();
  const quoted = /^'(.*)'$/.exec(trimmed) || /^"(.*)"$/.exec(trimmed);
  if (quoted) return quoted[1];
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
}

function findKeyCaseInsensitive(row, col) {
  return Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase());
}

function evalCondition(row, condStr) {
  const m = /^(?:\w+\.)?(\w+)\s*(!=|<>|>=|<=|=|>|<|like)\s*(.+)$/i.exec(condStr.trim());
  if (!m) throw new Error(`Bedingung nicht verstanden: "${condStr}"`);
  const [, colRaw, opRaw, valRaw] = m;
  const key = findKeyCaseInsensitive(row, colRaw);
  const rowVal = key ? row[key] : undefined;
  const op = opRaw.toLowerCase();
  const val = parseValue(valRaw);

  if (op === "like") return likeToRegex(String(val)).test(String(rowVal));

  const bothStrings = typeof rowVal === "string" && typeof val === "string";
  const a = bothStrings ? rowVal.toLowerCase() : rowVal;
  const b = bothStrings ? val.toLowerCase() : val;

  switch (op) {
    case "=":
      return a == b;
    case "!=":
    case "<>":
      return a != b;
    case ">":
      return a > b;
    case "<":
      return a < b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    default:
      throw new Error(`Unbekannter Operator: "${opRaw}"`);
  }
}

function evalWhere(row, whereClause) {
  const parts = whereClause.split(/\s+(and|or)\s+/i);
  let result = evalCondition(row, parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const conj = parts[i].toLowerCase();
    const next = evalCondition(row, parts[i + 1]);
    result = conj === "and" ? result && next : result || next;
  }
  return result;
}

function parseOn(onStr) {
  const m = /^(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)$/.exec(onStr.trim());
  if (!m) {
    throw new Error(
      `JOIN-Bedingung muss die Form "tabelle1.spalte = tabelle2.spalte" haben, war aber: "${onStr}"`
    );
  }
  return { c1: m[2], c2: m[4] };
}

function runSQL(rawSQL) {
  let sql = rawSQL.trim().replace(/;\s*$/, "").replace(/\s+/g, " ");
  if (!sql) throw new Error("Leere Abfrage.");
  sql = sql.replace(/\b(inner|left|right|outer)\s+join\b/gi, "JOIN");

  const selectMatch = /^select\s+(.+?)\s+from\s+(.+)$/i.exec(sql);
  if (!selectMatch) throw new Error("Erwarte eine Abfrage der Form: SELECT ... FROM ...");
  const selectList = selectMatch[1].trim();
  let rest = selectMatch[2].trim();

  let orderByClause = null;
  const orderMatch = /\border\s+by\s+(.+)$/i.exec(rest);
  if (orderMatch) {
    orderByClause = orderMatch[1].trim();
    rest = rest.slice(0, orderMatch.index).trim();
  }

  let whereClause = null;
  const whereMatch = /\bwhere\s+(.+)$/i.exec(rest);
  if (whereMatch) {
    whereClause = whereMatch[1].trim();
    rest = rest.slice(0, whereMatch.index).trim();
  }

  const joinParts = rest.split(/\bjoin\b/i).map((s) => s.trim());
  const baseTableName = joinParts[0].toLowerCase();
  const baseSchema = SCHEMAS[baseTableName];
  if (!baseSchema) throw new Error(`Unbekannte Tabelle: "${joinParts[0]}"`);

  let rows = baseSchema.rows.map((r) => ({ ...r }));

  for (let i = 1; i < joinParts.length; i++) {
    const onMatch = /^(\w+)\s+on\s+(.+)$/i.exec(joinParts[i]);
    if (!onMatch) throw new Error("JOIN benötigt die Form: JOIN tabelle ON t1.spalte = t2.spalte");
    const joinTableName = onMatch[1].toLowerCase();
    const joinSchema = SCHEMAS[joinTableName];
    if (!joinSchema) throw new Error(`Unbekannte Tabelle: "${onMatch[1]}"`);

    const { c1, c2 } = parseOn(onMatch[2]);
    let newCol, accCol;
    if (joinSchema.columns.includes(c1)) {
      newCol = c1;
      accCol = c2;
    } else if (joinSchema.columns.includes(c2)) {
      newCol = c2;
      accCol = c1;
    } else {
      throw new Error(`Keine der Spalten "${c1}"/"${c2}" gehört zu Tabelle "${onMatch[1]}"`);
    }

    const newRows = joinSchema.rows;
    const merged = [];
    for (const accRow of rows) {
      const accKey = findKeyCaseInsensitive(accRow, accCol);
      if (!accKey) continue;
      for (const newRow of newRows) {
        if (accRow[accKey] == newRow[newCol]) {
          merged.push({ ...accRow, ...newRow });
        }
      }
    }
    rows = merged;
  }

  if (whereClause) {
    rows = rows.filter((r) => evalWhere(r, whereClause));
  }

  if (orderByClause) {
    const m = /^(?:\w+\.)?(\w+)\s*(asc|desc)?$/i.exec(orderByClause.trim());
    if (!m) throw new Error(`ORDER BY nicht verstanden: "${orderByClause}" (nur eine Spalte unterstützt)`);
    const col = m[1];
    const desc = (m[2] || "asc").toLowerCase() === "desc";
    rows = [...rows].sort((a, b) => {
      const ka = findKeyCaseInsensitive(a, col);
      const kb = findKeyCaseInsensitive(b, col);
      const va = ka ? a[ka] : undefined;
      const vb = kb ? b[kb] : undefined;
      if (va < vb) return desc ? 1 : -1;
      if (va > vb) return desc ? -1 : 1;
      return 0;
    });
  }

  let columns;
  let outRows;
  if (selectList === "*") {
    outRows = rows.map((r) => ({ ...r }));
    columns = outRows.length ? Object.keys(outRows[0]) : [];
  } else {
    const fields = selectList.split(",").map((f) => f.trim().split(".").pop());
    columns = fields;
    outRows = rows.map((r) => {
      const o = {};
      fields.forEach((col) => {
        const key = findKeyCaseInsensitive(r, col);
        o[col] = key ? r[key] : undefined;
      });
      return o;
    });
  }

  return { columns, rows: outRows };
}

/* ---------- Rendering: Testdatenbank ---------- */

function renderTable(schema) {
  const header = schema.columns.map((c) => `<th>${c}</th>`).join("");
  const body = schema.rows
    .map((r) => `<tr>${schema.columns.map((c) => `<td>${r[c]}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="db-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderSchemaTables() {
  const container = document.getElementById("schema-tables");
  if (!container) return;
  container.innerHTML = Object.entries(SCHEMAS)
    .map(
      ([name, schema]) => `
        <div class="db-table-block">
          <h4 class="mono">${name}</h4>
          ${renderTable(schema)}
        </div>
      `
    )
    .join("");
}

function renderResultTable(container, result) {
  if (!result.rows.length) {
    container.innerHTML = `<p class="text-muted">Abfrage erfolgreich - aber 0 Zeilen als Ergebnis.</p>`;
    return;
  }
  const header = result.columns.map((c) => `<th>${c}</th>`).join("");
  const body = result.rows
    .map(
      (r) => `<tr>${result.columns.map((c) => `<td>${r[c] === undefined ? "" : r[c]}</td>`).join("")}</tr>`
    )
    .join("");
  container.innerHTML = `<table class="db-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

/* ---------- SQL-Sandbox ---------- */

function wireSandbox() {
  const input = document.getElementById("sql-input");
  const runBtn = document.getElementById("run-sql-btn");
  const resultBox = document.getElementById("sql-result");
  const errorBox = document.getElementById("sql-error");
  if (!input || !runBtn) return;

  runBtn.addEventListener("click", () => {
    errorBox.classList.add("hidden");
    resultBox.innerHTML = "";
    try {
      const result = runSQL(input.value);
      renderResultTable(resultBox, result);
    } catch (e) {
      errorBox.textContent = "⚠ " + e.message;
      errorBox.classList.remove("hidden");
    }
  });

  document.querySelectorAll(".sql-example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.sql;
      runBtn.click();
    });
  });
}

/* ---------- Abfrage-Aufgaben ---------- */

const TASKS = [
  {
    difficulty: "easy",
    prompt: "Gib alle Kunden (alle Spalten) aus Zürich aus.",
    solution: "SELECT * FROM kunden WHERE ort = 'Zürich'",
  },
  {
    difficulty: "easy",
    prompt: "Gib Vorname und Nachname aller Kunden aus, sortiert nach Nachname.",
    solution: "SELECT vorname, nachname FROM kunden ORDER BY nachname",
  },
  {
    difficulty: "easy",
    prompt: "Gib alle Artikel aus, die mehr als 20 Franken kosten.",
    solution: "SELECT * FROM artikel WHERE preis > 20",
  },
  {
    difficulty: "medium",
    prompt: "Gib alle Bestellungen mit Status 'offen' aus.",
    solution: "SELECT * FROM bestellungen WHERE status = 'offen'",
  },
  {
    difficulty: "medium",
    prompt: 'Gib die Namen aller Artikel aus, die das Wort "kabel" enthalten (Gross-/Kleinschreibung egal).',
    solution: "SELECT name FROM artikel WHERE name LIKE '%kabel%'",
  },
  {
    difficulty: "medium",
    prompt:
      "Verknüpfe kunden und bestellungen: gib für jede Bestellung Vorname, Nachname und Bestelldatum des Kunden aus.",
    solution:
      "SELECT vorname, nachname, bestelldatum FROM kunden JOIN bestellungen ON kunden.kunden_id = bestellungen.kunden_id",
  },
  {
    difficulty: "hard",
    prompt: "Finde die Bestellnummern aller Bestellungen von Kunden aus Bern.",
    solution:
      "SELECT bestellnummer FROM kunden JOIN bestellungen ON kunden.kunden_id = bestellungen.kunden_id WHERE ort = 'Bern'",
  },
  {
    difficulty: "hard",
    prompt: "Verknüpfe bestellposten und artikel: gib Artikelname und Anzahl für Bestellnummer 4 aus.",
    solution:
      "SELECT name, anzahl FROM bestellposten JOIN artikel ON bestellposten.artikel_id = artikel.artikel_id WHERE bestellnummer = 4",
  },
  {
    difficulty: "hard",
    prompt:
      "Verknüpfe alle vier Tabellen: gib für Bestellnummer 1 den Vornamen des Kunden UND den jeweiligen Artikelnamen aus.",
    solution:
      "SELECT vorname, name FROM kunden JOIN bestellungen ON kunden.kunden_id = bestellungen.kunden_id JOIN bestellposten ON bestellungen.bestellnummer = bestellposten.bestellnummer JOIN artikel ON bestellposten.artikel_id = artikel.artikel_id WHERE bestellungen.bestellnummer = 1",
  },
];

function canonicalRow(row) {
  return Object.values(row)
    .map((v) => String(v))
    .sort()
    .join("|");
}

function canonicalSet(rows) {
  return rows.map(canonicalRow).sort();
}

const solvedTasks = new Set();

function updateTaskChecklist() {
  const item = document.getElementById("check-tasks");
  if (!item) return;
  const done = solvedTasks.size >= TASK_GOAL;
  item.classList.toggle("status-done", done);
  item.textContent = done
    ? "✅ Abfrage-Aufgaben: alle gelöst"
    : `⬜ Abfrage-Aufgaben: ${solvedTasks.size} / ${TASK_GOAL} gelöst`;
}

function maybeMarkModuleDone() {
  const quizDone = document.getElementById("check-quiz")?.classList.contains("status-done");
  const tasksDone = solvedTasks.size >= TASK_GOAL;
  const wasDone = getModuleStatus(MODULE_ID) === "done";
  if (quizDone && tasksDone) {
    setModuleStatus(MODULE_ID, "done");
    if (!wasDone) document.getElementById("completion-banner").classList.remove("hidden");
  } else {
    setModuleStatus(MODULE_ID, "progress");
  }
}

function renderTasks() {
  const container = document.getElementById("tasks-container");
  if (!container) return;
  container.innerHTML = TASKS.map(
    (task, i) => `
      <div class="card task-card" data-index="${i}" style="margin-bottom:14px;">
        <span class="badge difficulty-${task.difficulty}">${{ easy: "Leicht", medium: "Mittel", hard: "Schwer" }[task.difficulty]}</span>
        <p class="task-prompt">${i + 1}. ${task.prompt}</p>
        <textarea class="task-sql-input mono" rows="2" placeholder="SELECT ..."></textarea>
        <div class="btn-row">
          <button type="button" class="btn primary task-check-btn">Prüfen</button>
        </div>
        <div class="task-result-box hidden"></div>
        <div class="feedback-box hidden task-feedback"></div>
      </div>
    `
  ).join("");

  container.querySelectorAll(".task-card").forEach((card) => {
    const idx = Number(card.dataset.index);
    const task = TASKS[idx];
    const textarea = card.querySelector(".task-sql-input");
    const checkBtn = card.querySelector(".task-check-btn");
    const resultBox = card.querySelector(".task-result-box");
    const feedback = card.querySelector(".task-feedback");

    checkBtn.addEventListener("click", () => {
      resultBox.classList.remove("hidden");
      try {
        const userResult = runSQL(textarea.value);
        renderResultTable(resultBox, userResult);

        const solutionResult = runSQL(task.solution);
        const correct =
          JSON.stringify(canonicalSet(userResult.rows)) === JSON.stringify(canonicalSet(solutionResult.rows));

        feedback.classList.remove("hidden");
        feedback.className = "feedback-box task-feedback " + (correct ? "correct" : "incorrect");
        if (correct) {
          feedback.textContent = "✓ Richtig! Genau dieses Ergebnis wird erwartet.";
          solvedTasks.add(idx);
          updateTaskChecklist();
          maybeMarkModuleDone();
        } else {
          feedback.textContent =
            "✗ Noch nicht ganz - das Ergebnis passt noch nicht zur Aufgabe. Prüfe Spalten/Bedingung.";
        }
      } catch (e) {
        resultBox.innerHTML = "";
        feedback.classList.remove("hidden");
        feedback.className = "feedback-box task-feedback incorrect";
        feedback.textContent = "⚠ " + e.message;
      }
    });
  });
}

/* ---------- Quiz ---------- */

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist ein Primärschlüssel (Primary Key)?",
    options: [
      "Eine Spalte, die jede Zeile einer Tabelle eindeutig identifiziert",
      "Das erste Passwort, mit dem man sich an der Datenbank anmeldet",
      "Die am häufigsten abgefragte Spalte einer Tabelle",
    ],
    correctIndex: 0,
    explanation:
      "Der Primärschlüssel (z.B. kunden_id) ist pro Zeile eindeutig und darf nie doppelt vorkommen - andere Tabellen verweisen darüber per Fremdschlüssel auf genau diese eine Zeile.",
  },
  {
    difficulty: "easy",
    question: "Was ist der Hauptunterschied zwischen relationalen und nicht-relationalen (NoSQL) Datenbanken?",
    options: [
      "Relationale Datenbanken speichern Daten in festen Tabellen mit Zeilen/Spalten; NoSQL-Datenbanken nutzen andere Modelle wie Dokumente, Key-Value-Paare oder Graphen",
      "NoSQL-Datenbanken können grundsätzlich keine Daten löschen",
      "Relationale Datenbanken laufen nur auf einem einzigen Server, NoSQL nie",
    ],
    correctIndex: 0,
    explanation:
      "Relationale Datenbanken (MySQL, PostgreSQL, SQL Server) zwingen Daten in ein festes Tabellenschema. NoSQL-Datenbanken (MongoDB, Redis, Neo4j, Cassandra) wählen je nach Anwendungsfall ein anderes, oft flexibleres Modell.",
  },
  {
    difficulty: "easy",
    question: "Wozu dient ein Fremdschlüssel (Foreign Key)?",
    options: [
      "Er verschlüsselt eine Spalte automatisch",
      "Er verweist auf den Primärschlüssel einer anderen Tabelle und stellt so eine Beziehung zwischen beiden Tabellen her",
      "Er legt fest, wer Schreibrechte auf die Tabelle hat",
    ],
    correctIndex: 1,
    explanation:
      "Ein Fremdschlüssel wie kunden_id in der Tabelle bestellungen zeigt auf den Primärschlüssel kunden_id in der Tabelle kunden - so weiss die Datenbank, zu welchem Kunden eine Bestellung gehört.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Kunde kann mehrere Bestellungen haben, eine Bestellung gehört aber immer zu genau einem Kunden. Welche Kardinalität beschreibt das?",
    options: ["1:1", "1:N", "M:N"],
    correctIndex: 1,
    explanation:
      "1:N (eins zu viele): auf der Kunde-Seite steht die \"1\", auf der Bestellung-Seite die \"N\" - genau wie im ER-Diagramm oben zwischen Kunde und Bestellung.",
  },
  {
    difficulty: "medium",
    question:
      "Warum braucht man für eine M:N-Beziehung (z.B. Bestellungen ↔ Artikel) eine zusätzliche Verbindungstabelle (Junction Table)?",
    options: [
      "Weil relationale Datenbanken keine direkten M:N-Beziehungen zwischen zwei Tabellen abbilden können - die Verbindungstabelle löst die Beziehung in zwei 1:N-Beziehungen auf",
      "Nur aus Performance-Gründen, technisch notwendig ist es nicht",
      "Weil sonst der Primärschlüssel doppelt vergeben würde",
    ],
    correctIndex: 0,
    explanation:
      "bestellposten ist genau diese Verbindungstabelle: sie hat ihre eigenen Fremdschlüssel zu bestellungen UND zu artikel, wodurch aus einer M:N-Beziehung zwei saubere 1:N-Beziehungen werden.",
  },
  {
    difficulty: "medium",
    question: "Was macht ein SQL JOIN?",
    options: [
      "Er löscht doppelte Zeilen aus einer einzelnen Tabelle",
      "Er kombiniert Zeilen aus zwei (oder mehr) Tabellen anhand einer gemeinsamen Spalte (meist Primär-/Fremdschlüssel)",
      "Er sortiert eine Tabelle nach einer bestimmten Spalte",
    ],
    correctIndex: 1,
    explanation:
      "JOIN kombiniert z.B. kunden und bestellungen über kunden_id, damit man in einer einzigen Ergebnistabelle sowohl Kundendaten als auch Bestelldaten gleichzeitig sieht.",
  },
  {
    difficulty: "hard",
    question:
      "Warum sollten Kundendaten (z.B. Name, Ort) nur EINMAL in der kunden-Tabelle stehen, statt bei jeder Bestellung erneut?",
    options: [
      "Aus reiner Gewohnheit, technisch wäre beides identisch gut",
      "Weil doppelte Daten (Redundanz) inkonsistent werden können - ändert sich z.B. der Ort, müsste man ihn sonst an vielen Stellen gleichzeitig aktualisieren; das ist einer der Kerngedanken der Normalisierung",
      "Weil eine Tabelle maximal 4 Spalten haben darf",
    ],
    correctIndex: 1,
    explanation:
      "Normalisierung reduziert genau diese Redundanz: der Ort eines Kunden steht nur einmal in kunden, jede Bestellung verweist nur per kunden_id darauf - ein Umzug muss nur an EINER Stelle geändert werden.",
  },
  {
    difficulty: "hard",
    question:
      'Ein ER-Diagramm zeigt bei der Beziehung Kunde–Bestellung die Kardinalität "1..1" auf der Kunde-Seite und "0..N" auf der Bestellung-Seite. Wie liest man das?',
    options: [
      "Jede Bestellung gehört zu genau einem Kunden; ein Kunde kann null oder beliebig viele Bestellungen haben",
      "Jeder Kunde muss mindestens eine Bestellung UND jede Bestellung mindestens einen Kunden haben",
      "Ein Kunde darf höchstens eine einzige Bestellung aufgeben",
    ],
    correctIndex: 0,
    explanation:
      "Die (min,max)-Notation steht auf der GEGENÜBERLIEGENDEN Seite der jeweiligen Entität: \"1..1\" bei Kunde beschreibt, wie viele Kunden zu EINER Bestellung gehören (immer genau 1); \"0..N\" bei Bestellung beschreibt, wie viele Bestellungen zu EINEM Kunden gehören (0 bis beliebig viele).",
  },
  {
    difficulty: "hard",
    question:
      "Wann ist eine dokumentenbasierte NoSQL-Datenbank (z.B. MongoDB) oft die bessere Wahl als eine relationale Datenbank?",
    options: [
      "Immer - NoSQL ist grundsätzlich moderner und ersetzt relationale Datenbanken vollständig",
      "Wenn Daten pro Datensatz stark unterschiedlich strukturiert sind oder sich häufig ändern (flexibles Schema), z.B. verschachtelte JSON-ähnliche Objekte ohne festes Format",
      "Nur wenn keine Beziehungen zwischen Daten existieren dürfen",
    ],
    correctIndex: 1,
    explanation:
      "Relationale Datenbanken verlangen ein festes Schema für alle Zeilen einer Tabelle. Dokumente (JSON-ähnlich) erlauben pro Datensatz unterschiedliche Felder - praktisch, wenn sich die Datenstruktur häufig ändert oder von Anfang an uneinheitlich ist.",
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
      item.innerHTML = `<input type="radio" name="dbq${qIdx}" /> <span>${opt}</span>`;
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

  const quizItem = document.getElementById("check-quiz");
  quizItem.classList.toggle("status-done", allCorrect);
  quizItem.textContent = allCorrect
    ? "✅ Datenbank-Quiz vollständig richtig gelöst"
    : "⬜ Datenbank-Quiz vollständig richtig lösen";

  maybeMarkModuleDone();
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderSchemaTables();
  wireSandbox();
  renderTasks();
  updateTaskChecklist();
  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
