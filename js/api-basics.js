/*
 * api-basics.js - Modul: API-Grundlagen
 * Simulierte REST-API (rein clientseitig, in-memory) rund um eine
 * "Aufgaben"-Ressource. Es gibt keinen echten Server - jede Anfrage wird
 * von einem selbstgebauten, stark vereinfachten Interpreter beantwortet,
 * der Statuscodes/JSON-Antworten wie eine echte REST-API zurückgibt.
 */

const MODULE_ID = "apibasics";
const TASK_GOAL = 9;

/* ---------- Simulierter Backend-Zustand ---------- */

const INITIAL_TASKS = [
  { id: 1, title: "Angebot für Kunde Muster AG erstellen", done: false },
  { id: 2, title: "Server-Backup prüfen", done: true },
  { id: 3, title: "Wöchentliches Team-Meeting vorbereiten", done: false },
];

let TASKS = [];
let nextId = 1;
let lastResult = null;

function resetBackend() {
  TASKS = INITIAL_TASKS.map((t) => ({ ...t }));
  nextId = TASKS.length + 1;
}

/* ---------- Sehr einfacher REST-Interpreter ----------
 * Unterstützte Routen: GET/POST /tasks, GET/PUT/PATCH/DELETE /tasks/:id
 * Query-Parameter: ?done=true|false filtert GET /tasks
 * Antwort: { status, body }
 */

function parsePath(rawPath) {
  const [pathPart, queryPart] = rawPath.trim().split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const query = {};
  if (queryPart) {
    queryPart.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) query[decodeURIComponent(k)] = v === undefined ? "" : decodeURIComponent(v);
    });
  }
  return { segments, query };
}

function parseBody(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { ok: true, value: undefined };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (e) {
    return { ok: false, error: "Ungültiges JSON im Request-Body: " + e.message };
  }
}

function handleRequest(method, rawPath, rawBody) {
  const m = (method || "").toUpperCase();
  const { segments, query } = parsePath(rawPath || "");

  if (segments[0] !== "tasks") {
    return { status: 404, body: { error: `Endpunkt "${rawPath}" nicht gefunden` } };
  }

  const bodyResult = parseBody(rawBody);

  // /tasks
  if (segments.length === 1) {
    if (m === "GET") {
      let result = TASKS;
      if (query.done !== undefined) {
        const wantDone = query.done === "true";
        result = TASKS.filter((t) => t.done === wantDone);
      }
      return { status: 200, body: result };
    }
    if (m === "POST") {
      if (!bodyResult.ok) return { status: 400, body: { error: bodyResult.error } };
      const data = bodyResult.value;
      if (!data || typeof data.title !== "string" || !data.title.trim()) {
        return { status: 400, body: { error: 'Feld "title" (nicht-leerer Text) ist erforderlich' } };
      }
      const task = { id: nextId++, title: data.title, done: Boolean(data.done) };
      TASKS.push(task);
      return { status: 201, body: task };
    }
    return { status: 405, body: { error: `Methode ${m} wird für /tasks nicht unterstützt (erlaubt: GET, POST)` } };
  }

  // /tasks/:id
  if (segments.length === 2) {
    const id = Number(segments[1]);
    const idx = TASKS.findIndex((t) => t.id === id);

    if (m === "GET") {
      if (idx === -1) return { status: 404, body: { error: `Aufgabe mit ID ${id} nicht gefunden` } };
      return { status: 200, body: TASKS[idx] };
    }
    if (m === "PUT") {
      if (idx === -1) return { status: 404, body: { error: `Aufgabe mit ID ${id} nicht gefunden` } };
      if (!bodyResult.ok) return { status: 400, body: { error: bodyResult.error } };
      const data = bodyResult.value;
      if (!data || typeof data.title !== "string" || !data.title.trim()) {
        return { status: 400, body: { error: 'PUT ersetzt die gesamte Ressource - Feld "title" ist erforderlich' } };
      }
      TASKS[idx] = { id, title: data.title, done: Boolean(data.done) };
      return { status: 200, body: TASKS[idx] };
    }
    if (m === "PATCH") {
      if (idx === -1) return { status: 404, body: { error: `Aufgabe mit ID ${id} nicht gefunden` } };
      if (!bodyResult.ok) return { status: 400, body: { error: bodyResult.error } };
      const data = bodyResult.value || {};
      if (typeof data.title === "string") TASKS[idx].title = data.title;
      if (typeof data.done === "boolean") TASKS[idx].done = data.done;
      return { status: 200, body: TASKS[idx] };
    }
    if (m === "DELETE") {
      if (idx === -1) return { status: 404, body: { error: `Aufgabe mit ID ${id} nicht gefunden` } };
      TASKS.splice(idx, 1);
      return { status: 204, body: undefined };
    }
    return { status: 405, body: { error: `Methode ${m} wird für /tasks/:id nicht unterstützt` } };
  }

  return { status: 404, body: { error: `Endpunkt "${rawPath}" nicht gefunden` } };
}

/* ---------- Rendering ---------- */

function renderBackendState() {
  const container = document.getElementById("backend-state");
  if (!container) return;
  const rows = TASKS.map(
    (t) => `<tr><td class="mono">${t.id}</td><td>${escapeHtml(t.title)}</td><td class="mono">${t.done}</td></tr>`
  ).join("");
  container.innerHTML = `
    <table class="db-table">
      <thead><tr><th>id</th><th>title</th><th>done</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3" class="text-muted">(keine Aufgaben vorhanden)</td></tr>'}</tbody>
    </table>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResponse(container, result) {
  const statusClass = result.status < 300 ? "correct" : result.status < 500 ? "incorrect" : "incorrect";
  const bodyText = result.body === undefined ? "(kein Inhalt)" : JSON.stringify(result.body, null, 2);
  container.innerHTML = `
    <div class="feedback-box ${statusClass}" style="margin-top:10px;">
      <strong>Status: ${result.status} ${statusText(result.status)}</strong>
    </div>
    <pre class="mono">${escapeHtml(bodyText)}</pre>
  `;
}

function statusText(status) {
  return (
    {
      200: "OK",
      201: "Created",
      204: "No Content",
      400: "Bad Request",
      404: "Not Found",
      405: "Method Not Allowed",
    }[status] || ""
  );
}

/* ---------- Sandbox ---------- */

function wireSandbox() {
  const methodSel = document.getElementById("api-method");
  const pathInput = document.getElementById("api-path");
  const bodyInput = document.getElementById("api-body");
  const sendBtn = document.getElementById("send-request-btn");
  const responseBox = document.getElementById("api-response");
  const resetBtn = document.getElementById("reset-backend-btn");
  if (!sendBtn) return;

  sendBtn.addEventListener("click", () => {
    lastResult = handleRequest(methodSel.value, pathInput.value, bodyInput.value);
    renderResponse(responseBox, lastResult);
    renderBackendState();
  });

  document.querySelectorAll(".api-example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      methodSel.value = btn.dataset.method;
      pathInput.value = btn.dataset.path;
      bodyInput.value = btn.dataset.body || "";
      sendBtn.click();
    });
  });

  resetBtn.addEventListener("click", () => {
    resetBackend();
    renderBackendState();
    responseBox.innerHTML = `<p class="text-muted">Backend zurückgesetzt.</p>`;
  });
}

/* ---------- Schritt-für-Schritt-Aufgaben ---------- */

const TASKS_LIST = [
  {
    difficulty: "easy",
    prompt: "Rufe ALLE Aufgaben ab (GET /tasks).",
    method: "GET",
    path: "/tasks",
    body: "",
    validate: (r) => r.status === 200 && Array.isArray(r.body) && r.body.length >= 1,
  },
  {
    difficulty: "easy",
    prompt: "Rufe genau EINE Aufgabe per ID ab: die Aufgabe mit der ID 1 (GET /tasks/1).",
    method: "GET",
    path: "/tasks/1",
    body: "",
    validate: (r) => r.status === 200 && r.body && r.body.id === 1,
  },
  {
    difficulty: "easy",
    prompt: "Rufe eine NICHT existierende Aufgabe ab (GET /tasks/999) und beobachte den Statuscode.",
    method: "GET",
    path: "/tasks/999",
    body: "",
    validate: (r) => r.status === 404,
  },
  {
    difficulty: "medium",
    prompt:
      'Erstelle per POST /tasks eine neue Aufgabe mit dem Titel "Neue Aufgabe" (Body: {"title": "Neue Aufgabe"}).',
    method: "POST",
    path: "/tasks",
    body: '{"title": "Neue Aufgabe"}',
    validate: (r) => r.status === 201 && r.body && r.body.title === "Neue Aufgabe" && typeof r.body.id === "number",
  },
  {
    difficulty: "medium",
    prompt: "Sende ein POST /tasks OHNE Titel im Body ({}) und beobachte, wie die API auf fehlende Pflichtfelder reagiert.",
    method: "POST",
    path: "/tasks",
    body: "{}",
    validate: (r) => r.status === 400,
  },
  {
    difficulty: "medium",
    prompt:
      'Aktualisiere Aufgabe 1 vollständig per PUT /tasks/1 (Body: {"title": "Angebot verschickt", "done": true}).',
    method: "PUT",
    path: "/tasks/1",
    body: '{"title": "Angebot verschickt", "done": true}',
    validate: (r) => r.status === 200 && r.body && r.body.id === 1 && r.body.title === "Angebot verschickt" && r.body.done === true,
  },
  {
    difficulty: "medium",
    prompt:
      'Ändere per PATCH /tasks/3 NUR das Feld "done" auf true (Body: {"done": true}) - der Titel soll dabei unverändert bleiben.',
    method: "PATCH",
    path: "/tasks/3",
    body: '{"done": true}',
    validate: (r) => r.status === 200 && r.body && r.body.id === 3 && r.body.done === true && typeof r.body.title === "string" && r.body.title.length > 0,
  },
  {
    difficulty: "hard",
    prompt: "Lösche Aufgabe 2 per DELETE /tasks/2 und beachte den zurückgegebenen Statuscode.",
    method: "DELETE",
    path: "/tasks/2",
    body: "",
    validate: (r) => r.status === 204,
  },
  {
    difficulty: "hard",
    prompt: "Rufe per Query-Parameter NUR die erledigten Aufgaben ab (GET /tasks?done=true).",
    method: "GET",
    path: "/tasks?done=true",
    body: "",
    validate: (r) => r.status === 200 && Array.isArray(r.body) && r.body.every((t) => t.done === true),
  },
];

const solvedTasks = new Set();

function updateTaskChecklist() {
  const item = document.getElementById("check-tasks");
  if (!item) return;
  const done = solvedTasks.size >= TASK_GOAL;
  item.classList.toggle("status-done", done);
  item.textContent = done
    ? "✅ API-Aufgaben: alle gelöst"
    : `⬜ API-Aufgaben: ${solvedTasks.size} / ${TASK_GOAL} gelöst`;
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

function renderTasksPanel() {
  const container = document.getElementById("tasks-container");
  if (!container) return;
  container.innerHTML = TASKS_LIST.map(
    (task, i) => `
      <div class="card task-card" data-index="${i}" style="margin-bottom:14px;">
        <span class="badge difficulty-${task.difficulty}">${{ easy: "Leicht", medium: "Mittel", hard: "Schwer" }[task.difficulty]}</span>
        <p class="task-prompt">${i + 1}. ${task.prompt}</p>
        <div class="field-row">
          <div class="field" style="max-width:110px;">
            <label>Methode</label>
            <select class="task-method mono">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </div>
          <div class="field" style="flex:1;">
            <label>Pfad</label>
            <input type="text" class="task-path mono" placeholder="/tasks" />
          </div>
        </div>
        <div class="field">
          <label>Body (JSON, falls nötig)</label>
          <textarea class="task-body mono" rows="2" placeholder="{ }"></textarea>
        </div>
        <div class="btn-row">
          <button type="button" class="btn primary task-check-btn">Senden &amp; Prüfen</button>
        </div>
        <div class="task-result-box hidden"></div>
        <div class="feedback-box hidden task-feedback"></div>
      </div>
    `
  ).join("");

  container.querySelectorAll(".task-card").forEach((card) => {
    const idx = Number(card.dataset.index);
    const task = TASKS_LIST[idx];
    const methodSel = card.querySelector(".task-method");
    const pathInput = card.querySelector(".task-path");
    const bodyInput = card.querySelector(".task-body");
    methodSel.value = task.method;

    const checkBtn = card.querySelector(".task-check-btn");
    const resultBox = card.querySelector(".task-result-box");
    const feedback = card.querySelector(".task-feedback");

    checkBtn.addEventListener("click", () => {
      resultBox.classList.remove("hidden");
      const result = handleRequest(methodSel.value, pathInput.value, bodyInput.value);
      renderResponse(resultBox, result);
      renderBackendState();

      const correct = Boolean(task.validate(result));
      feedback.classList.remove("hidden");
      feedback.className = "feedback-box task-feedback " + (correct ? "correct" : "incorrect");
      if (correct) {
        feedback.textContent = "✓ Richtig! Genau dieses Verhalten wird für diese Aufgabe erwartet.";
        solvedTasks.add(idx);
        updateTaskChecklist();
        maybeMarkModuleDone();
      } else {
        feedback.textContent = "✗ Noch nicht ganz - prüfe Methode, Pfad und Body gegen die Aufgabenstellung.";
      }
    });
  });
}

/* ---------- Quiz ---------- */

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist eine API im Grunde?",
    options: [
      "Eine definierte Schnittstelle, über die zwei Programme strukturiert Daten austauschen können, ohne die interne Funktionsweise des jeweils anderen kennen zu müssen",
      "Ein spezielles Programm, das ausschliesslich Webseiten grafisch darstellt",
      "Eine Bezeichnung für besonders schnelle Internetverbindungen",
    ],
    correctIndex: 0,
    explanation:
      "API steht für Application Programming Interface - eine klar definierte Schnittstelle, über die Software strukturiert kommunizieren kann, ähnlich einer Speisekarte: man bestellt (Anfrage) und bekommt ein Ergebnis (Antwort), ohne die Küche (interne Umsetzung) zu kennen.",
  },
  {
    difficulty: "easy",
    question: "Welche HTTP-Methode wird typischerweise verwendet, um NUR Daten abzurufen, ohne etwas zu verändern?",
    options: [
      "GET - fragt Daten ab, ohne Nebenwirkungen auf dem Server",
      "POST - legt üblicherweise eine neue Ressource an",
      "DELETE - entfernt üblicherweise eine bestehende Ressource",
    ],
    correctIndex: 0,
    explanation:
      "GET gilt als \"sicher\" (safe) - ein GET-Aufruf sollte niemals Daten auf dem Server verändern. Für Änderungen gibt es POST (anlegen), PUT/PATCH (ändern) und DELETE (löschen).",
  },
  {
    difficulty: "easy",
    question: "Welche Statuscode-Gruppe zeigt an, dass eine Anfrage erfolgreich war?",
    options: [
      "2xx (z.B. 200 OK, 201 Created)",
      "4xx (z.B. 404 Not Found)",
      "5xx (z.B. 500 Internal Server Error)",
    ],
    correctIndex: 0,
    explanation:
      "2xx-Codes bedeuten Erfolg. 4xx zeigt einen Fehler auf Seiten des Clients an (z.B. falsche Anfrage, fehlende Rechte), 5xx einen Fehler auf Seiten des Servers.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet einen Pfad-Parameter (z.B. /tasks/42) von einem Query-Parameter (z.B. ?done=true)?",
    options: [
      "Der Pfad-Parameter identifiziert eine konkrete Ressource innerhalb der URL-Struktur, der Query-Parameter filtert/steuert die Anfrage zusätzlich, angehängt nach einem Fragezeichen",
      "Beide bedeuten technisch exakt dasselbe, nur unterschiedliche Schreibweise",
      "Query-Parameter dürfen nur bei POST-Anfragen verwendet werden, Pfad-Parameter nur bei GET",
    ],
    correctIndex: 0,
    explanation:
      "/tasks/42 identifiziert direkt EINE bestimmte Aufgabe (ID 42) als Teil des Pfads. ?done=true steht dagegen für eine Zusatzoption (hier: Filter) und wird nach einem \"?\" an die URL angehängt, oft mit mehreren durch \"&\" getrennten Parametern.",
  },
  {
    difficulty: "medium",
    question: "Was ist der Unterschied zwischen PUT und PATCH?",
    options: [
      "PUT ersetzt die GESAMTE Ressource (alle Felder müssen mitgeschickt werden), PATCH ändert NUR die im Body übergebenen einzelnen Felder",
      "PUT und PATCH sind zwei Namen für exakt denselben Vorgang",
      "PATCH kann nur neue Ressourcen anlegen, PUT nur bestehende löschen",
    ],
    correctIndex: 0,
    explanation:
      "PUT beschreibt semantisch ein vollständiges Ersetzen - fehlt ein Feld im Body, gilt es oft als zurückgesetzt/gelöscht. PATCH ist für punktuelle Änderungen gedacht: nur die übergebenen Felder werden aktualisiert, der Rest bleibt unangetastet.",
  },
  {
    difficulty: "medium",
    question: "Ein Client sendet GET /tasks/999, aber keine Aufgabe mit dieser ID existiert. Welcher Statuscode ist dafür korrekt?",
    options: [
      "404 Not Found - die angefragte Ressource existiert nicht",
      "200 OK, mit einem leeren Textfeld statt Daten",
      "500 Internal Server Error - das ist immer ein Serverproblem",
    ],
    correctIndex: 0,
    explanation:
      "404 ist der Standard-Statuscode für \"diese konkrete Ressource existiert nicht\". Ein 200 würde fälschlich Erfolg signalisieren, ein 500 würde einen Serverfehler suggerieren, obwohl der Server korrekt funktioniert - die Anfrage bezieht sich schlicht auf eine nicht vorhandene ID.",
  },
  {
    difficulty: "hard",
    question: "Ein POST /tasks ohne Pflichtfeld \"title\" im Body wird gesendet. Welcher Statuscode ist dafür am passendsten - und warum nicht 500?",
    options: [
      "400 Bad Request - der Fehler liegt in der fehlerhaften/unvollständigen Anfrage des Clients, nicht in einem Problem auf Serverseite",
      "500 Internal Server Error, weil jeder Fehler unabhängig von der Ursache als Serverfehler gilt",
      "200 OK mit einer Fehlermeldung im Body, der Statuscode selbst bleibt immer Erfolg",
    ],
    correctIndex: 0,
    explanation:
      "400 (\"Bad Request\") gehört zur 4xx-Gruppe - Fehler, die durch eine fehlerhafte Anfrage des CLIENTS verursacht wurden (hier: fehlendes Pflichtfeld). 500 wäre nur angemessen, wenn der Server selbst unerwartet versagt, obwohl die Anfrage korrekt war.",
  },
  {
    difficulty: "hard",
    question: "Warum liefert eine gut gebaute DELETE-Route oft den Statuscode 204 (No Content) statt 200 (OK)?",
    options: [
      "204 sagt aus: \"Erfolgreich, aber es gibt bewusst keinen Antwortinhalt\" - nach dem Löschen einer Ressource gibt es schlicht nichts mehr zurückzugeben",
      "204 bedeutet, dass die Löschung fehlgeschlagen ist und wiederholt werden muss",
      "200 ist für DELETE-Anfragen technisch nicht zulässig",
    ],
    correctIndex: 0,
    explanation:
      "204 signalisiert Erfolg OHNE Antwortkörper - passend für DELETE, da nach dem Löschen keine sinnvollen Daten der (nicht mehr existierenden) Ressource mehr zurückgegeben werden können. 200 wäre nicht falsch, aber 204 drückt die Absicht klarer aus.",
  },
  {
    difficulty: "hard",
    question:
      "Eine API läuft öffentlich im Internet. Warum reicht es NICHT aus, sich beim Schutz sensibler Endpunkte allein auf \"schwer zu erratende\" URLs zu verlassen (\"Security by Obscurity\")?",
    options: [
      "URLs können leicht mitgelesen (z.B. in Logs, Browserverlauf, Referrer-Headern) oder erraten werden - echter Schutz erfordert Authentifizierung (z.B. per Token) und serverseitige Autorisierungsprüfung bei jeder Anfrage",
      "Security by Obscurity ist technisch unmöglich umzusetzen und wird daher automatisch von jedem Webserver verhindert",
      "URLs werden bei jeder Anfrage automatisch neu und zufällig generiert, wodurch das Problem sich von selbst löst",
    ],
    correctIndex: 0,
    explanation:
      "Eine geheime URL ist kein echter Schutz - sie kann in Server-Logs, Browserverläufen, geteilten Links oder Referrer-Headern auftauchen. Echte API-Sicherheit basiert auf Authentifizierung (wer bist du? z.B. per Bearer-Token) und Autorisierung (was darfst du?), die der Server bei JEDER Anfrage aktiv prüft - unabhängig davon, wie unauffindbar die URL scheint.",
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
      item.innerHTML = `<input type="radio" name="apiq${qIdx}" /> <span>${opt}</span>`;
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
    ? "✅ API-Quiz vollständig richtig gelöst"
    : "⬜ API-Quiz vollständig richtig lösen";

  maybeMarkModuleDone();
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  resetBackend();
  renderBackendState();
  wireSandbox();
  renderTasksPanel();
  updateTaskChecklist();
  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
