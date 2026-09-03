/*
 * sqli.js - Modul 4: SQL-Injection-Simulation (rein clientseitig, sandboxed)
 *
 * WICHTIG: Es gibt hier keine echte Datenbank und keine echte SQL-Engine.
 * Alles laeuft gegen ein hartcodiertes JS-Array (FAKE_USERS). Der "Query-
 * String" wird nur zur Veranschaulichung als Text zusammengebaut. Ob ein
 * Login "erfolgreich" ist, wird durch simple Mustererkennung (RegEx) auf
 * genau diesem Text entschieden - es wird nichts geparst oder ausgefuehrt.
 * Ziel ist rein didaktisch: zeigen, WARUM String-Verkettung gefaehrlich ist.
 */

const MODULE_ID = "sqli";

const FAKE_USERS = [
  { username: "admin", password: "S3cr3t!2024" },
  { username: "alice", password: "hunter2" },
  { username: "bob", password: "correcthorse" },
];

const EXAMPLE_PAYLOADS = [
  { label: "Tautologie", value: "' OR '1'='1" },
  { label: "Tautologie + Kommentar", value: "' OR '1'='1' -- " },
  { label: "Kommentar-Injection", value: "admin'--" },
];

/* ---------------- Naive (verwundbare) Simulation ---------------- */

function buildNaiveQueryText(username, password) {
  return `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
}

const TAUTOLOGY_PATTERN = /'\s*or\s*'?\s*1\s*'?\s*=\s*'?\s*1/i;
const COMMENT_AFTER_QUOTE_PATTERN = /'.*(--|#)/;

function evaluateNaiveLogin(username, password) {
  const query = buildNaiveQueryText(username, password);

  const hasTautology =
    TAUTOLOGY_PATTERN.test(username) || TAUTOLOGY_PATTERN.test(password);
  const hasCommentTrick =
    COMMENT_AFTER_QUOTE_PATTERN.test(username) ||
    COMMENT_AFTER_QUOTE_PATTERN.test(password);

  if (hasTautology || hasCommentTrick) {
    return {
      query,
      success: true,
      bypass: true,
      reason: hasTautology
        ? "Die eingeschleuste Bedingung ('1'='1) ist immer wahr - die WHERE-Klausel liefert dadurch alle Zeilen zurueck, unabhaengig vom echten Passwort."
        : "Der Kommentar-Marker (--/#) kommentiert den Rest der Query aus, inklusive der Passwort-Pruefung - dadurch reicht ein bekannter Benutzername ohne korrektes Passwort.",
      matchedUser: FAKE_USERS[0].username + " (erste Zeile der Tabelle, simuliert)",
    };
  }

  const match = FAKE_USERS.find(
    (u) => u.username === username && u.password === password
  );

  return {
    query,
    success: Boolean(match),
    bypass: false,
    reason: match
      ? "Benutzername und Passwort stimmen exakt mit einem Eintrag ueberein."
      : "Kein Eintrag in der (simulierten) Nutzerliste passt.",
    matchedUser: match ? match.username : null,
  };
}

/* ---------------- Sichere (parametrisierte) Simulation ---------------- */

function buildParameterizedQueryText() {
  return "SELECT * FROM users WHERE username = ? AND password = ?;";
}

function evaluateParameterizedLogin(username, password) {
  // Bei parametrisierten Queries werden Werte NIE in den Query-Text
  // eingemischt. Sie werden als reine Daten uebergeben - Sonderzeichen
  // wie ' oder -- haben dadurch keinerlei Einfluss auf die Struktur der
  // Abfrage. Wir simulieren das durch einen reinen Werte-Vergleich.
  const match = FAKE_USERS.find(
    (u) => u.username === username && u.password === password
  );

  return {
    query: buildParameterizedQueryText(),
    boundParams: [username, password],
    success: Boolean(match),
    matchedUser: match ? match.username : null,
  };
}

/* ---------------- UI-Hilfsfunktionen ---------------- */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResult(containerEl, resultHtml, isDanger) {
  containerEl.classList.remove("hidden");
  containerEl.className =
    "feedback-box " + (isDanger ? "incorrect" : "correct");
  containerEl.innerHTML = resultHtml;
}

/* ---------------- Fortschritt ---------------- */

function markProgressFlag(flagName) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const updated = Object.assign({}, stored, { [flagName]: true });
  const done = updated.triedNaiveBypass && updated.triedSecureBlock;
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, done ? "done" : "progress", updated);
  updateChecklist(updated);
  if (done && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateChecklist(state) {
  document
    .getElementById("check-naive")
    .classList.toggle("status-done", Boolean(state.triedNaiveBypass));
  document
    .getElementById("check-naive")
    .textContent = state.triedNaiveBypass
    ? "✅ Injection im unsicheren Formular ausgeloest"
    : "⬜ Injection im unsicheren Formular ausloesen";

  document
    .getElementById("check-secure")
    .classList.toggle("status-done", Boolean(state.triedSecureBlock));
  document.getElementById("check-secure").textContent = state.triedSecureBlock
    ? "✅ Gleiche Eingabe im parametrisierten Formular getestet"
    : "⬜ Gleiche Eingabe im parametrisierten Formular testen";
}

/* ---------------- Event-Wiring ---------------- */

function handleNaiveSubmit() {
  const username = document.getElementById("naive-username").value;
  const password = document.getElementById("naive-password").value;
  const result = evaluateNaiveLogin(username, password);

  document.getElementById("naive-query-text").textContent = result.query;

  const box = document.getElementById("naive-result");
  if (result.bypass) {
    renderResult(
      box,
      `<strong>⚠️ Login "erfolgreich" durch SQL-Injection!</strong><br>
       Angemeldet als: <span class="mono">${escapeHtml(result.matchedUser)}</span><br>
       ${result.reason}`,
      true
    );
    markProgressFlag("triedNaiveBypass");
  } else if (result.success) {
    renderResult(
      box,
      `<strong>Login erfolgreich.</strong> Angemeldet als ${escapeHtml(
        result.matchedUser
      )} (korrekte Zugangsdaten, keine Injection).`,
      false
    );
  } else {
    renderResult(box, `<strong>Login fehlgeschlagen.</strong> ${result.reason}`, false);
  }
}

function handleSecureSubmit() {
  const username = document.getElementById("secure-username").value;
  const password = document.getElementById("secure-password").value;
  const result = evaluateParameterizedLogin(username, password);

  document.getElementById("secure-query-text").innerHTML =
    escapeHtml(result.query) +
    `\n\n-- gebundene Parameter (reine Daten, kein Query-Text):\n` +
    `param[0] = ${JSON.stringify(result.boundParams[0])}\n` +
    `param[1] = ${JSON.stringify(result.boundParams[1])}`;

  const box = document.getElementById("secure-result");
  const looksLikeInjectionAttempt =
    TAUTOLOGY_PATTERN.test(username) ||
    TAUTOLOGY_PATTERN.test(password) ||
    COMMENT_AFTER_QUOTE_PATTERN.test(username) ||
    COMMENT_AFTER_QUOTE_PATTERN.test(password);

  if (result.success) {
    renderResult(
      box,
      `<strong>Login erfolgreich.</strong> Angemeldet als ${escapeHtml(
        result.matchedUser
      )}.`,
      false
    );
  } else {
    renderResult(
      box,
      `<strong>Login fehlgeschlagen.</strong> Die Eingabe wurde als reiner String verglichen` +
        (looksLikeInjectionAttempt
          ? " - die Injection-Syntax hat keinerlei Sonderbedeutung und wurde einfach als (falsches) Passwort behandelt."
          : " und stimmt mit keinem Eintrag ueberein."),
      false
    );
  }

  if (looksLikeInjectionAttempt) {
    markProgressFlag("triedSecureBlock");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);

  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  updateChecklist(stored);
  if (stored.status === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  document
    .getElementById("naive-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      handleNaiveSubmit();
    });

  document
    .getElementById("secure-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      handleSecureSubmit();
    });

  const payloadContainer = document.getElementById("payload-examples");
  EXAMPLE_PAYLOADS.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn small";
    btn.textContent = p.label;
    btn.title = p.value;
    btn.addEventListener("click", () => {
      document.getElementById("naive-username").value = "admin";
      document.getElementById("naive-password").value = p.value;
    });
    payloadContainer.appendChild(btn);
  });

  document.getElementById("copy-to-secure").addEventListener("click", () => {
    document.getElementById("secure-username").value = document.getElementById(
      "naive-username"
    ).value;
    document.getElementById("secure-password").value = document.getElementById(
      "naive-password"
    ).value;
  });
});
