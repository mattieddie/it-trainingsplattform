/*
 * sqli.js - Modul 4: SQL-Injection-Simulation (rein clientseitig, sandboxed)
 *
 * WICHTIG: Es gibt hier keine echte Datenbank und keine echte SQL-Engine.
 * Alles läuft gegen ein hartcodiertes JS-Array (FAKE_USERS). Der "Query-
 * String" wird nur zur Veranschaulichung als Text zusammengebaut. Ob ein
 * Login "erfolgreich" ist, wird durch simple Mustererkennung (RegEx) auf
 * genau diesem Text entschieden - es wird nichts geparst oder ausgeführt.
 * Ziel ist rein didaktisch: zeigen, WARUM String-Verkettung gefährlich ist.
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

const FAKE_PRODUCTS = [
  { name: "USB-C-Kabel" },
  { name: "Laptop-Tasche" },
  { name: "Webcam HD" },
  { name: "Mechanische Tastatur" },
];

/* ---------------- Herausforderungen (schwierigkeitsgestuft) ---------------- */

const CHALLENGES = [
  {
    id: "any-tautology",
    difficulty: "easy",
    type: "login",
    title: "Logge dich als beliebiger Nutzer ein - ohne ein Passwort zu kennen",
    instructions:
      "Nutze eine Tautologie (eine Bedingung, die immer wahr ist) im Login-Formular unten. Der Benutzername ist dabei egal.",
    validate: (username, password) =>
      TAUTOLOGY_PATTERN.test(username) || TAUTOLOGY_PATTERN.test(password),
    explanation:
      "Eine Tautologie wie ' OR '1'='1 macht die WHERE-Klausel immer wahr - dadurch liefert die (simulierte) Abfrage einen Treffer, unabhängig vom echten Passwort.",
  },
  {
    id: "admin-comment",
    difficulty: "medium",
    type: "login",
    title: "Melde dich gezielt als \"admin\" an - per Kommentar-Injection",
    instructions:
      "Diesmal ohne Tautologie: nutze eine Kommentar-Injection (-- oder #) direkt nach dem Benutzernamen \"admin\", um die Passwort-Prüfung auszukommentieren.",
    validate: (username, password) =>
      /^admin\s*'/i.test(username) &&
      COMMENT_AFTER_QUOTE_PATTERN.test(username) &&
      !TAUTOLOGY_PATTERN.test(username),
    explanation:
      "admin'-- schliesst den String nach \"admin\" ab und kommentiert den Rest der Query (inkl. AND password = '...') aus. Damit reicht der bekannte Benutzername admin allein.",
  },
  {
    id: "union-leak",
    difficulty: "hard",
    type: "search",
    title: "UNION-basierte Injection: Nutzerliste über die Produktsuche leaken",
    instructions:
      "Das Produktsuchfeld unten durchsucht normalerweise nur Produktnamen. Nutze eine UNION SELECT-Injection, um (simuliert) alle Benutzernamen aus der users-Tabelle mit auszugeben.",
    validate: (input) => /union\s+select/i.test(input),
    explanation:
      "UNION SELECT hängt an das Ergebnis der eigentlichen Abfrage die Ergebnisse einer ZWEITEN, selbst gewählten Abfrage an - z.B. eine, die Benutzernamen aus einer ganz anderen Tabelle liest. So lassen sich über ein harmlos wirkendes Suchfeld plötzlich Daten aus anderen Tabellen abgreifen.",
  },
];

let currentChallenge = null;

function loadSolvedChallenges() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solvedChallenges) ? stored.solvedChallenges : [];
}

function pickChallenge() {
  const solved = loadSolvedChallenges();
  const unsolved = CHALLENGES.filter((c) => !solved.includes(c.id));
  const pool = unsolved.length > 0 ? unsolved : CHALLENGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildSearchQueryText(input) {
  return `SELECT name FROM products WHERE name LIKE '%${input}%';`;
}

function evaluateProductSearch(input) {
  const query = buildSearchQueryText(input);
  if (/union\s+select/i.test(input)) {
    return {
      query,
      leaked: true,
      rows: FAKE_USERS.map((u) => u.username),
    };
  }
  const rows = FAKE_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(input.toLowerCase())
  ).map((p) => p.name);
  return { query, leaked: false, rows };
}

function renderChallenge() {
  currentChallenge = pickChallenge();

  const diffBadge = document.getElementById("challenge-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentChallenge.difficulty];
  diffBadge.className = "badge difficulty-" + currentChallenge.difficulty;

  document.getElementById("challenge-title").textContent = currentChallenge.title;
  document.getElementById("challenge-instructions").textContent =
    currentChallenge.instructions;

  const isLogin = currentChallenge.type === "login";
  document.getElementById("challenge-login-form").classList.toggle("hidden", !isLogin);
  document.getElementById("challenge-search-form").classList.toggle("hidden", isLogin);

  document.getElementById("challenge-username").value = "";
  document.getElementById("challenge-password").value = "";
  document.getElementById("challenge-search-input").value = "";

  const fb = document.getElementById("challenge-result");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";

  updateChallengeScorePill();
}

function updateChallengeScorePill() {
  const solved = loadSolvedChallenges();
  document.getElementById(
    "challenge-score-pill"
  ).textContent = `Gelöst: ${solved.length} / ${CHALLENGES.length} Herausforderungen`;
}

function markChallengeSolved(id) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solvedChallenges || []);
  solved.add(id);
  const solvedArr = Array.from(solved);
  const updated = Object.assign({}, stored, { solvedChallenges: solvedArr });
  const done =
    Boolean(updated.triedNaiveBypass) &&
    Boolean(updated.triedSecureBlock) &&
    solvedArr.length >= CHALLENGES.length;
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, done ? "done" : "progress", updated);
  updateChallengeScorePill();
  updateChecklist(updated);
  if (done && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function handleChallengeLoginSubmit() {
  if (!currentChallenge) return;
  const username = document.getElementById("challenge-username").value;
  const password = document.getElementById("challenge-password").value;
  const solved = currentChallenge.validate(username, password);

  const fb = document.getElementById("challenge-result");
  fb.classList.remove("hidden");
  if (solved) {
    fb.className = "feedback-box correct";
    fb.innerHTML = `<strong>Geschafft!</strong> ${currentChallenge.explanation}`;
    markChallengeSolved(currentChallenge.id);
  } else {
    fb.className = "feedback-box incorrect";
    fb.innerHTML =
      "<strong>Noch nicht.</strong> Das erfüllt die Aufgabe noch nicht - lies dir die Anweisung nochmal genau durch.";
  }
}

function handleChallengeSearchSubmit() {
  if (!currentChallenge) return;
  const input = document.getElementById("challenge-search-input").value;
  const result = evaluateProductSearch(input);

  const fb = document.getElementById("challenge-result");
  fb.classList.remove("hidden");

  if (result.leaked) {
    fb.className = "feedback-box incorrect";
    fb.innerHTML = `<strong>⚠️ Daten geleakt!</strong> Simulierter Query: <span class="mono">${escapeHtml(
      result.query
    )}</span><br>Ausgegebene "Benutzernamen": ${result.rows
      .map((r) => `<span class="mono">${escapeHtml(r)}</span>`)
      .join(", ")}<br>${currentChallenge.explanation}`;
    markChallengeSolved(currentChallenge.id);
  } else {
    fb.className = "feedback-box correct";
    fb.innerHTML = `Treffer: ${
      result.rows.length ? result.rows.join(", ") : "(keine)"
    } - das ist noch keine Injection, versuch es mit UNION SELECT.`;
  }
}

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
        ? "Die eingeschleuste Bedingung ('1'='1) ist immer wahr - die WHERE-Klausel liefert dadurch alle Zeilen zurück, unabhängig vom echten Passwort."
        : "Der Kommentar-Marker (--/#) kommentiert den Rest der Query aus, inklusive der Passwort-Prüfung - dadurch reicht ein bekannter Benutzername ohne korrektes Passwort.",
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
      ? "Benutzername und Passwort stimmen exakt mit einem Eintrag überein."
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
  // eingemischt. Sie werden als reine Daten übergeben - Sonderzeichen
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
  const solvedChallenges = updated.solvedChallenges || [];
  const done =
    Boolean(updated.triedNaiveBypass) &&
    Boolean(updated.triedSecureBlock) &&
    solvedChallenges.length >= CHALLENGES.length;
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
    ? "✅ Injection im unsicheren Formular ausgelöst"
    : "⬜ Injection im unsicheren Formular auslösen";

  document
    .getElementById("check-secure")
    .classList.toggle("status-done", Boolean(state.triedSecureBlock));
  document.getElementById("check-secure").textContent = state.triedSecureBlock
    ? "✅ Gleiche Eingabe im parametrisierten Formular getestet"
    : "⬜ Gleiche Eingabe im parametrisierten Formular testen";

  const solvedChallenges = (state.solvedChallenges || []).length;
  const challengesDone = solvedChallenges >= CHALLENGES.length;
  document.getElementById("check-challenges").classList.toggle("status-done", challengesDone);
  document.getElementById("check-challenges").textContent = challengesDone
    ? "✅ Alle Herausforderungen (leicht/mittel/schwer) gelöst"
    : `⬜ Alle Herausforderungen lösen (${solvedChallenges} / ${CHALLENGES.length})`;
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
          : " und stimmt mit keinem Eintrag überein."),
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

  renderChallenge();
  document
    .getElementById("challenge-login-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      handleChallengeLoginSubmit();
    });
  document
    .getElementById("challenge-search-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      handleChallengeSearchSubmit();
    });
  document
    .getElementById("challenge-next-btn")
    .addEventListener("click", renderChallenge);
});
