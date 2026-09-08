/*
 * api-basics.js - Modul: API-Grundlagen
 * Simulierte REST-API (rein clientseitig, in-memory) rund um eine
 * realistischere "Mitarbeiterverwaltung": zwei verknüpfte Ressourcen
 * (departments/employees), verschachtelte Routen, Filter/Sortierung/
 * Pagination/Suche per Query-Parameter, und ein simulierter
 * Bearer-Token-Schutz auf schreibenden Endpunkten. Es gibt keinen echten
 * Server - jede Anfrage wird von einem selbstgebauten, stark
 * vereinfachten Interpreter beantwortet.
 */

const MODULE_ID = "apibasics";
const TASK_GOAL = 12;
const DEMO_TOKEN = "demo-token-123";

/* ---------- Simulierter Backend-Zustand ---------- */

const INITIAL_DEPARTMENTS = [
  { id: 1, name: "IT" },
  { id: 2, name: "Verkauf" },
  { id: 3, name: "Finanzen" },
];

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Anna Meier", departmentId: 1, salary: 8200, active: true },
  { id: 2, name: "Bruno Keller", departmentId: 1, salary: 7600, active: true },
  { id: 3, name: "Claudia Suter", departmentId: 2, salary: 6900, active: true },
  { id: 4, name: "Daniel Meier", departmentId: 2, salary: 7100, active: false },
  { id: 5, name: "Eva Fischer", departmentId: 3, salary: 8800, active: true },
  { id: 6, name: "Frank Huber", departmentId: 1, salary: 9100, active: true },
];

let DEPARTMENTS = [];
let EMPLOYEES = [];
let nextEmployeeId = 1;

function resetBackend() {
  DEPARTMENTS = INITIAL_DEPARTMENTS.map((d) => ({ ...d }));
  EMPLOYEES = INITIAL_EMPLOYEES.map((e) => ({ ...e }));
  nextEmployeeId = EMPLOYEES.length + 1;
}

/* ---------- Sehr einfacher REST-Interpreter ----------
 * Routen:
 *   GET    /departments
 *   GET    /departments/:id
 *   GET    /departments/:id/employees        (verschachtelte Ressource)
 *   GET    /employees                        (?department=, ?active=,
 *                                              ?search=, ?sort=, ?page=&limit=)
 *   GET    /employees/:id
 *   POST   /employees        [Auth nötig]
 *   PUT    /employees/:id    [Auth nötig]
 *   PATCH  /employees/:id    [Auth nötig]
 *   DELETE /employees/:id    [Auth nötig]
 * Auth: Header "Authorization: Bearer demo-token-123"
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

function isAuthorized(authHeader) {
  return (authHeader || "").trim() === `Bearer ${DEMO_TOKEN}`;
}

function employeeView(e) {
  return { ...e };
}

function applyEmployeeQuery(list, query) {
  let result = list;

  if (query.department !== undefined) {
    const depId = Number(query.department);
    result = result.filter((e) => e.departmentId === depId);
  }
  if (query.active !== undefined) {
    const wantActive = query.active === "true";
    result = result.filter((e) => e.active === wantActive);
  }
  if (query.search) {
    const needle = query.search.toLowerCase();
    result = result.filter((e) => e.name.toLowerCase().includes(needle));
  }

  if (query.sort) {
    const desc = query.sort.startsWith("-");
    const field = desc ? query.sort.slice(1) : query.sort;
    if (field === "name" || field === "salary") {
      result = [...result].sort((a, b) => {
        if (a[field] < b[field]) return desc ? 1 : -1;
        if (a[field] > b[field]) return desc ? -1 : 1;
        return 0;
      });
    }
  }

  const total = result.length;
  let page = 1;
  let limit = total || 1;
  if (query.page !== undefined || query.limit !== undefined) {
    page = Math.max(1, Number(query.page) || 1);
    limit = Math.max(1, Number(query.limit) || total || 1);
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);
  }

  return { data: result.map(employeeView), meta: { total, page, limit } };
}

function handleRequest(method, rawPath, rawBody, authHeader) {
  const m = (method || "").toUpperCase();
  const { segments, query } = parsePath(rawPath || "");
  const bodyResult = parseBody(rawBody);

  // /departments
  if (segments[0] === "departments") {
    if (segments.length === 1) {
      if (m !== "GET") return { status: 405, body: { error: `Methode ${m} wird für /departments nicht unterstützt (erlaubt: GET)` } };
      return { status: 200, body: DEPARTMENTS };
    }
    if (segments.length === 2) {
      const dep = DEPARTMENTS.find((d) => d.id === Number(segments[1]));
      if (!dep) return { status: 404, body: { error: `Abteilung mit ID ${segments[1]} nicht gefunden` } };
      if (m !== "GET") return { status: 405, body: { error: `Methode ${m} wird für /departments/:id nicht unterstützt (erlaubt: GET)` } };
      return { status: 200, body: dep };
    }
    if (segments.length === 3 && segments[2] === "employees") {
      const dep = DEPARTMENTS.find((d) => d.id === Number(segments[1]));
      if (!dep) return { status: 404, body: { error: `Abteilung mit ID ${segments[1]} nicht gefunden` } };
      if (m !== "GET") return { status: 405, body: { error: `Methode ${m} wird für /departments/:id/employees nicht unterstützt (erlaubt: GET)` } };
      const list = EMPLOYEES.filter((e) => e.departmentId === dep.id).map(employeeView);
      return { status: 200, body: { department: dep, employees: list } };
    }
    return { status: 404, body: { error: `Endpunkt "${rawPath}" nicht gefunden` } };
  }

  // /employees
  if (segments[0] === "employees") {
    if (segments.length === 1) {
      if (m === "GET") {
        return { status: 200, body: applyEmployeeQuery(EMPLOYEES, query) };
      }
      if (m === "POST") {
        if (!isAuthorized(authHeader)) {
          return { status: 401, body: { error: "Nicht authentifiziert - gültigen Authorization-Header (Bearer-Token) mitschicken" } };
        }
        if (!bodyResult.ok) return { status: 400, body: { error: bodyResult.error } };
        const data = bodyResult.value;
        if (!data || typeof data.name !== "string" || !data.name.trim()) {
          return { status: 400, body: { error: 'Feld "name" (nicht-leerer Text) ist erforderlich' } };
        }
        const depId = Number(data.departmentId);
        if (!DEPARTMENTS.some((d) => d.id === depId)) {
          return { status: 400, body: { error: `Feld "departmentId" muss auf eine existierende Abteilung verweisen (${depId} unbekannt)` } };
        }
        const employee = {
          id: nextEmployeeId++,
          name: data.name,
          departmentId: depId,
          salary: Number(data.salary) || 0,
          active: data.active === undefined ? true : Boolean(data.active),
        };
        EMPLOYEES.push(employee);
        return { status: 201, body: employee };
      }
      return { status: 405, body: { error: `Methode ${m} wird für /employees nicht unterstützt (erlaubt: GET, POST)` } };
    }

    if (segments.length === 2) {
      const id = Number(segments[1]);
      const idx = EMPLOYEES.findIndex((e) => e.id === id);

      if (m === "GET") {
        if (idx === -1) return { status: 404, body: { error: `Mitarbeiter mit ID ${id} nicht gefunden` } };
        return { status: 200, body: EMPLOYEES[idx] };
      }

      if (m === "PUT" || m === "PATCH" || m === "DELETE") {
        if (!isAuthorized(authHeader)) {
          return { status: 401, body: { error: "Nicht authentifiziert - gültigen Authorization-Header (Bearer-Token) mitschicken" } };
        }
        if (idx === -1) return { status: 404, body: { error: `Mitarbeiter mit ID ${id} nicht gefunden` } };

        if (m === "DELETE") {
          EMPLOYEES.splice(idx, 1);
          return { status: 204, body: undefined };
        }

        if (!bodyResult.ok) return { status: 400, body: { error: bodyResult.error } };
        const data = bodyResult.value || {};

        if (m === "PUT") {
          if (typeof data.name !== "string" || !data.name.trim()) {
            return { status: 400, body: { error: 'PUT ersetzt die gesamte Ressource - Feld "name" ist erforderlich' } };
          }
          const depId = Number(data.departmentId);
          if (!DEPARTMENTS.some((d) => d.id === depId)) {
            return { status: 400, body: { error: `Feld "departmentId" muss auf eine existierende Abteilung verweisen (${depId} unbekannt)` } };
          }
          EMPLOYEES[idx] = {
            id,
            name: data.name,
            departmentId: depId,
            salary: Number(data.salary) || 0,
            active: Boolean(data.active),
          };
          return { status: 200, body: EMPLOYEES[idx] };
        }

        // PATCH
        if (typeof data.name === "string") EMPLOYEES[idx].name = data.name;
        if (data.departmentId !== undefined) {
          const depId = Number(data.departmentId);
          if (!DEPARTMENTS.some((d) => d.id === depId)) {
            return { status: 400, body: { error: `Feld "departmentId" muss auf eine existierende Abteilung verweisen (${depId} unbekannt)` } };
          }
          EMPLOYEES[idx].departmentId = depId;
        }
        if (typeof data.salary === "number") EMPLOYEES[idx].salary = data.salary;
        if (typeof data.active === "boolean") EMPLOYEES[idx].active = data.active;
        return { status: 200, body: EMPLOYEES[idx] };
      }

      return { status: 405, body: { error: `Methode ${m} wird für /employees/:id nicht unterstützt` } };
    }

    return { status: 404, body: { error: `Endpunkt "${rawPath}" nicht gefunden` } };
  }

  return { status: 404, body: { error: `Endpunkt "${rawPath}" nicht gefunden` } };
}

/* ---------- Rendering ---------- */

function renderBackendState() {
  const depContainer = document.getElementById("backend-departments");
  const empContainer = document.getElementById("backend-employees");
  if (!depContainer || !empContainer) return;

  depContainer.innerHTML = `
    <table class="db-table">
      <thead><tr><th>id</th><th>name</th></tr></thead>
      <tbody>${DEPARTMENTS.map((d) => `<tr><td class="mono">${d.id}</td><td>${escapeHtml(d.name)}</td></tr>`).join("")}</tbody>
    </table>
  `;

  const empRows = EMPLOYEES.map(
    (e) =>
      `<tr><td class="mono">${e.id}</td><td>${escapeHtml(e.name)}</td><td class="mono">${e.departmentId}</td><td class="mono">${e.salary}</td><td class="mono">${e.active}</td></tr>`
  ).join("");
  empContainer.innerHTML = `
    <table class="db-table">
      <thead><tr><th>id</th><th>name</th><th>departmentId</th><th>salary</th><th>active</th></tr></thead>
      <tbody>${empRows || '<tr><td colspan="5" class="text-muted">(keine Mitarbeiter vorhanden)</td></tr>'}</tbody>
    </table>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResponse(container, result) {
  const statusClass = result.status < 300 ? "correct" : "incorrect";
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
      401: "Unauthorized",
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
  const authInput = document.getElementById("api-auth");
  const sendBtn = document.getElementById("send-request-btn");
  const responseBox = document.getElementById("api-response");
  const resetBtn = document.getElementById("reset-backend-btn");
  if (!sendBtn) return;

  sendBtn.addEventListener("click", () => {
    const result = handleRequest(methodSel.value, pathInput.value, bodyInput.value, authInput.value);
    renderResponse(responseBox, result);
    renderBackendState();
  });

  document.querySelectorAll(".api-example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      methodSel.value = btn.dataset.method;
      pathInput.value = btn.dataset.path;
      bodyInput.value = btn.dataset.body || "";
      authInput.value = btn.dataset.auth || "";
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

const AUTH_HEADER_OK = `Bearer ${DEMO_TOKEN}`;

const TASKS_LIST = [
  {
    difficulty: "easy",
    prompt: "Rufe alle Abteilungen ab (GET /departments).",
    method: "GET",
    path: "/departments",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && Array.isArray(r.body) && r.body.length >= 1,
  },
  {
    difficulty: "easy",
    prompt: "Rufe über die verschachtelte Route alle Mitarbeiter der Abteilung IT (ID 1) ab (GET /departments/1/employees).",
    method: "GET",
    path: "/departments/1/employees",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && r.body && Array.isArray(r.body.employees) && r.body.employees.every((e) => e.departmentId === 1),
  },
  {
    difficulty: "medium",
    prompt: "Filtere über einen Query-Parameter alle Mitarbeiter der Abteilung Verkauf (ID 2): GET /employees?department=2.",
    method: "GET",
    path: "/employees?department=2",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && r.body && Array.isArray(r.body.data) && r.body.data.length > 0 && r.body.data.every((e) => e.departmentId === 2),
  },
  {
    difficulty: "medium",
    prompt: 'Suche per Query-Parameter nach allen Mitarbeitern mit "Meier" im Namen (GET /employees?search=Meier).',
    method: "GET",
    path: "/employees?search=Meier",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && r.body && Array.isArray(r.body.data) && r.body.data.length === 2 && r.body.data.every((e) => e.name.toLowerCase().includes("meier")),
  },
  {
    difficulty: "medium",
    prompt: "Gib alle Mitarbeiter absteigend nach Gehalt sortiert aus (GET /employees?sort=-salary) - wer steht ganz oben?",
    method: "GET",
    path: "/employees?sort=-salary",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && r.body && Array.isArray(r.body.data) && r.body.data.length > 1 && r.body.data[0].salary >= r.body.data[r.body.data.length - 1].salary,
  },
  {
    difficulty: "medium",
    prompt: "Rufe nur die erste Seite mit 2 Einträgen ab (GET /employees?page=1&limit=2) und beachte das \"meta\"-Feld in der Antwort.",
    method: "GET",
    path: "/employees?page=1&limit=2",
    body: "",
    auth: "",
    validate: (r) => r.status === 200 && r.body && Array.isArray(r.body.data) && r.body.data.length === 2 && r.body.meta && r.body.meta.page === 1 && r.body.meta.limit === 2,
  },
  {
    difficulty: "hard",
    prompt: 'Versuche OHNE Authorization-Header einen neuen Mitarbeiter anzulegen (POST /employees, Body: {"name": "Test", "departmentId": 1}) und beobachte den Statuscode.',
    method: "POST",
    path: "/employees",
    body: '{"name": "Test", "departmentId": 1}',
    auth: "",
    validate: (r) => r.status === 401,
  },
  {
    difficulty: "hard",
    prompt:
      'Versuche jetzt MIT gültigem Authorization-Header ("Bearer demo-token-123"), aber mit einer nicht existierenden Abteilung (departmentId: 99) einen Mitarbeiter anzulegen - erwarte 400.',
    method: "POST",
    path: "/employees",
    body: '{"name": "Test", "departmentId": 99}',
    auth: AUTH_HEADER_OK,
    validate: (r) => r.status === 400,
  },
  {
    difficulty: "hard",
    prompt:
      'Lege nun korrekt einen neuen Mitarbeiter an: POST /employees mit Authorization-Header und Body {"name": "Nina Vogel", "departmentId": 3, "salary": 7500}.',
    method: "POST",
    path: "/employees",
    body: '{"name": "Nina Vogel", "departmentId": 3, "salary": 7500}',
    auth: AUTH_HEADER_OK,
    validate: (r) => r.status === 201 && r.body && r.body.name === "Nina Vogel" && r.body.departmentId === 3,
  },
  {
    difficulty: "hard",
    prompt: 'Ändere per PATCH /employees/3 NUR das Feld "active" auf false (Body: {"active": false}), mit gültigem Authorization-Header.',
    method: "PATCH",
    path: "/employees/3",
    body: '{"active": false}',
    auth: AUTH_HEADER_OK,
    validate: (r) => r.status === 200 && r.body && r.body.id === 3 && r.body.active === false,
  },
  {
    difficulty: "hard",
    prompt: "Lösche Mitarbeiter 4 per DELETE /employees/4, mit gültigem Authorization-Header.",
    method: "DELETE",
    path: "/employees/4",
    body: "",
    auth: AUTH_HEADER_OK,
    validate: (r) => r.status === 204,
  },
  {
    difficulty: "hard",
    prompt: "Rufe einen nicht existierenden Mitarbeiter ab (GET /employees/999) und beobachte den Statuscode.",
    method: "GET",
    path: "/employees/999",
    body: "",
    auth: "",
    validate: (r) => r.status === 404,
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
            <input type="text" class="task-path mono" placeholder="/employees" />
          </div>
        </div>
        <div class="field">
          <label>Authorization-Header (falls nötig, z.B. "Bearer demo-token-123")</label>
          <input type="text" class="task-auth mono" placeholder="Bearer demo-token-123" />
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
    const authInput = card.querySelector(".task-auth");
    const bodyInput = card.querySelector(".task-body");
    methodSel.value = task.method;

    const checkBtn = card.querySelector(".task-check-btn");
    const resultBox = card.querySelector(".task-result-box");
    const feedback = card.querySelector(".task-feedback");

    checkBtn.addEventListener("click", () => {
      resultBox.classList.remove("hidden");
      const result = handleRequest(methodSel.value, pathInput.value, bodyInput.value, authInput.value);
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
        feedback.textContent = "✗ Noch nicht ganz - prüfe Methode, Pfad, Authorization-Header und Body gegen die Aufgabenstellung.";
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
    question: "Was unterscheidet einen Pfad-Parameter (z.B. /employees/42) von einem Query-Parameter (z.B. ?department=1)?",
    options: [
      "Der Pfad-Parameter identifiziert eine konkrete Ressource innerhalb der URL-Struktur, der Query-Parameter filtert/steuert die Anfrage zusätzlich, angehängt nach einem Fragezeichen",
      "Beide bedeuten technisch exakt dasselbe, nur unterschiedliche Schreibweise",
      "Query-Parameter dürfen nur bei POST-Anfragen verwendet werden, Pfad-Parameter nur bei GET",
    ],
    correctIndex: 0,
    explanation:
      "/employees/42 identifiziert direkt EINEN bestimmten Mitarbeiter (ID 42) als Teil des Pfads. ?department=1 steht dagegen für eine Zusatzoption (hier: Filter) und wird nach einem \"?\" an die URL angehängt, oft mit mehreren durch \"&\" getrennten Parametern.",
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
    question: "Wozu dient eine verschachtelte Route wie GET /departments/1/employees, statt einfach GET /employees?department=1 zu verwenden?",
    options: [
      "Beide sind in der Praxis üblich und liefern ähnliche Ergebnisse - die verschachtelte Route drückt zusätzlich explizit die Zugehörigkeits-Beziehung (\"diese Mitarbeiter GEHÖREN zu dieser Abteilung\") direkt in der URL-Struktur aus",
      "Verschachtelte Routen sind technisch verboten und werden von keiner echten API unterstützt",
      "Der Unterschied ist rein kosmetisch, die verschachtelte Route ist niemals sinnvoll",
    ],
    correctIndex: 0,
    explanation:
      "Beide Varianten kommen in echten APIs vor. Die verschachtelte Route (/departments/1/employees) betont die Eltern-Kind-Beziehung direkt in der URL, während der Query-Parameter (/employees?department=1) eher eine allgemeine Filterung derselben Ressourcen-Liste ausdrückt.",
  },
  {
    difficulty: "hard",
    question: "Ein POST /employees ohne Pflichtfeld \"name\" im Body wird gesendet. Welcher Statuscode ist dafür am passendsten - und warum nicht 500?",
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
    question: "Ein POST /employees wird OHNE Authorization-Header gesendet, obwohl der Endpunkt eigentlich einen gültigen Token verlangt. Welcher Statuscode ist korrekt?",
    options: [
      "401 Unauthorized - der Client hat sich nicht (ausreichend) authentifiziert",
      "403 Forbidden - der Client ist zwar bekannt, darf diese Aktion aber grundsätzlich nie ausführen",
      "404 Not Found - der Endpunkt existiert für nicht angemeldete Clients schlicht nicht",
    ],
    correctIndex: 0,
    explanation:
      "401 bedeutet \"wir wissen nicht (sicher), wer du bist\" - fehlende oder ungültige Anmeldedaten. 403 wäre der richtige Code, WENN der Client zweifelsfrei identifiziert ist, aber trotzdem keine Berechtigung für diese konkrete Aktion hat - ein feiner, aber wichtiger Unterschied.",
  },
  {
    difficulty: "hard",
    question:
      "Ein POST /employees mit gültigem Token, aber einer departmentId, die auf keine existierende Abteilung verweist, wird gesendet. Warum ist 400 hier die richtige Wahl und nicht z.B. 404?",
    options: [
      "404 würde bedeuten, der angefragte ENDPUNKT selbst existiert nicht - hier existiert der Endpunkt (/employees) sehr wohl, nur der übergebene WERT im Body ist ungültig, was klassisch als 400 (fehlerhafte Anfrage) gilt",
      "404 ist in jedem Fall falsch und wird von REST-APIs grundsätzlich nie verwendet",
      "400 und 404 bedeuten in der Praxis exakt dasselbe und sind beliebig austauschbar",
    ],
    correctIndex: 0,
    explanation:
      "404 bezieht sich auf die angefragte RESSOURCE/URL selbst (\"/employees/42 existiert nicht\"). Hier ist die URL (/employees, POST) völlig korrekt - das Problem liegt in einem ungültigen WERT innerhalb des gesendeten Bodys (eine nicht existierende departmentId), was inhaltlich zu 400 (Bad Request) passt.",
  },
  {
    difficulty: "hard",
    question:
      "Warum liefert eine gut gebaute DELETE-Route oft den Statuscode 204 (No Content) statt 200 (OK)?",
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
    question: "Wozu dient ein \"meta\"-Feld wie { total, page, limit } in einer paginierten API-Antwort?",
    options: [
      "Es gibt dem Client zusätzliche Informationen über die GESAMTE Ergebnismenge (nicht nur die aktuell gelieferte Seite) - z.B. um zu wissen, ob und wie viele weitere Seiten existieren",
      "Es enthält ausschliesslich Debugging-Informationen für Entwickler, die in Produktion entfernt werden müssen",
      "Es ersetzt den eigentlichen Statuscode der Antwort",
    ],
    correctIndex: 0,
    explanation:
      "Ohne Metadaten wie total/page/limit könnte ein Client bei einer paginierten Liste nicht wissen, wie viele Einträge es INSGESAMT gibt oder ob eine nächste Seite existiert - er sähe nur die wenigen Einträge der aktuellen Seite, ohne Kontext.",
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
