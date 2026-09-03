/*
 * intune-entra.js - Modul 8: Intune / Entra ID (Azure AD) / Hybrid
 * Zwei Teile, gleiches Muster wie im Active-Directory-Modul:
 *  1) Conditional-Access-Szenario-Quiz: zeigt den zentralen Unterschied zu
 *     Firewall-Regeln - bei CA gewinnt NICHT die erste passende Regel,
 *     sondern ALLE zutreffenden Richtlinien wirken gemeinsam (UND-Ver-
 *     knuepfung ihrer Grant Controls), und ein "Blockieren" ueberstimmt
 *     immer alle anderen Grants.
 *  2) Troubleshooting-Tickets (Geraete-Join, Compliance, Sync, Legacy Auth).
 * Alle Ausgaben sind hartcodierte Text-Fixtures, es wird nichts echtes
 * gegen Microsoft Entra ID / Intune ausgefuehrt.
 */

const MODULE_ID = "intuneentra";

/* ================= Teil 1: Conditional-Access-Quiz ================= */

const CA_POLICIES_TABLE =
  "Richtlinie 1 \"Baseline-MFA\"\n" +
  "  Nutzer: Alle          Bedingung: Anmeldung ausserhalb des Firmennetzwerks\n" +
  "  Grant:  MFA erforderlich\n\n" +
  "Richtlinie 2 \"Admin-Schutz\"\n" +
  "  Nutzer: Gruppe \"Admins\"   Bedingung: beliebig\n" +
  "  Grant:  MFA UND konformes Geraet erforderlich\n\n" +
  "Richtlinie 3 \"Geo-Block\"\n" +
  "  Nutzer: Alle          Bedingung: Anmeldung aus Hochrisiko-Land\n" +
  "  Grant:  Zugriff blockieren";

const CA_QUIZ = [
  {
    question:
      "Ein normaler Nutzer (kein Admin) meldet sich von zuhause (ausserhalb des Firmennetzwerks) an. Welche Anforderung(en) muss er erfuellen?",
    options: [
      "MFA erforderlich",
      "MFA UND konformes Geraet erforderlich",
      "Keine besonderen Anforderungen",
      "Zugriff wird blockiert",
    ],
    correctIndex: 0,
    explanation:
      "Nur Richtlinie 1 greift (ausserhalb des Netzwerks, gilt fuer alle Nutzer) → MFA erforderlich. Richtlinie 2 greift nicht (keine Admin-Gruppe), Richtlinie 3 nicht (kein Hochrisiko-Land).",
  },
  {
    question:
      "Ein Admin meldet sich aus dem Buero-Netzwerk an. Welche Anforderung(en) muss er erfuellen?",
    options: [
      "Keine besonderen Anforderungen",
      "Nur MFA erforderlich",
      "MFA UND konformes Geraet erforderlich",
      "Zugriff wird blockiert",
    ],
    correctIndex: 2,
    explanation:
      "Richtlinie 1 greift nicht (er ist im Firmennetz, die Bedingung 'ausserhalb' trifft nicht zu). Richtlinie 2 greift (Admin-Gruppe, Bedingung 'beliebig') → MFA UND konformes Geraet.",
  },
  {
    question:
      "Ein Admin meldet sich von zuhause an (ausserhalb des Netzwerks). Welche Anforderung(en) gelten in Summe?",
    options: [
      "Nur MFA (die staerkere Anforderung aus Richtlinie 2 zaehlt nicht, da Richtlinie 1 zuerst greift)",
      "MFA UND konformes Geraet - beide zutreffenden Richtlinien wirken gemeinsam",
      "Nur konformes Geraet, MFA wird ignoriert",
      "Es gilt nur die zuletzt erstellte Richtlinie",
    ],
    correctIndex: 1,
    explanation:
      "Anders als bei Firewall-Regeln gibt es bei Conditional Access KEIN 'erste Regel gewinnt'. Richtlinie 1 UND Richtlinie 2 treffen beide zu - ihre Grant Controls werden kumulativ mit UND verknuepft. Ergebnis: MFA UND konformes Geraet muessen erfuellt sein.",
  },
  {
    question:
      "Ein beliebiger Nutzer versucht sich aus einem als Hochrisiko eingestuften Land anzumelden, erfuellt aber MFA und hat ein konformes Geraet. Wird der Zugriff gewaehrt?",
    options: [
      "Ja, da MFA und konformes Geraet erfuellt sind",
      "Nein - eine zutreffende 'Blockieren'-Richtlinie ueberstimmt immer alle anderen (erfuellten) Grant-Anforderungen",
      "Nur mit zusaetzlicher Admin-Freigabe",
      "Ja, aber nur fuer eine begrenzte Sitzungsdauer",
    ],
    correctIndex: 1,
    explanation:
      "Richtlinie 3 greift (Hochrisiko-Land) und deren Control ist 'Zugriff blockieren'. Eine zutreffende Block-Richtlinie gewinnt immer, unabhaengig davon, welche anderen (erfuellbaren) Anforderungen andere Richtlinien stellen.",
  },
];

/* ================= Teil 2: Troubleshooting-Tickets ================= */

const TICKETS = [
  {
    id: "device-not-in-intune",
    difficulty: "easy",
    title: "Ticket #3001 - Neues Notebook erscheint nicht in Intune",
    symptom:
      "Ein neues Firmen-Notebook wurde eingerichtet und an den Nutzer uebergeben. Im Intune-Portal taucht das Geraet aber nicht auf, Richtlinien werden nicht angewendet.",
    tools: [
      {
        id: "dsregcmd",
        label: "dsregcmd /status auf dem Notebook ausfuehren",
        output:
`+----------------------------------------------------------------+
| Device State                                                    |
+----------------------------------------------------------------+
    AzureAdJoined :          NO
    EnterpriseJoined :       NO
    DomainJoined :           NO
    WorkplaceJoined :        NO`,
      },
      {
        id: "settings",
        label: "Einstellungen > Konten > Zugriff für Arbeit oder Schule pruefen",
        output:
`Keine verbundenen Konten vorhanden.`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Geraet wurde nie erfolgreich mit Entra ID verbunden (weder Join noch Registrierung) - ohne diesen Schritt gibt es kein Intune-Onboarding",
      "Der Intune-Dienst ist aktuell gestoert",
      "Das Geraet hat keine Internetverbindung",
      "Die Intune-Lizenz des Nutzers ist abgelaufen",
    ],
    correctIndex: 0,
    explanation:
      "\"dsregcmd /status\" zeigt bei allen Join-Arten \"NO\" - das Geraet ist ueberhaupt nicht mit Entra ID verbunden. Intune verwaltet nur Geraete, die zuvor per Entra-Join, Hybrid-Join oder -Registrierung mit Entra ID verbunden wurden. Loesung: Einrichtungsassistent (OOBE) mit Firmenkonto erneut durchlaufen bzw. \"Verbinden\" unter Zugriff fuer Arbeit oder Schule ausfuehren.",
  },
  {
    id: "hybrid-join-scp",
    difficulty: "medium",
    title: "Ticket #3015 - Hybrid Entra Join schlaegt fehl",
    symptom:
      "On-Premises-AD-Computer sollen automatisch auch als \"Hybrid Entra Joined\" erscheinen. Bei einem PC bleibt der Status jedoch dauerhaft nur domaenenverbunden.",
    tools: [
      {
        id: "dsregcmd",
        label: "dsregcmd /status auf dem betroffenen PC",
        output:
`    AzureAdJoined :          NO
    DomainJoined :           YES
    DomainName :             FIRMA`,
      },
      {
        id: "connect-sync",
        label: "Entra Connect Sync-Status auf dem Sync-Server pruefen",
        output:
`Letzte Synchronisierung: vor 12 Minuten (erfolgreich)
Letzter Geraete-Registrierungs-Lauf: Fehler
  -> Service Connection Point (SCP) nicht gefunden oder zeigt auf falschen Tenant`,
      },
      {
        id: "other-pc",
        label: "dsregcmd /status auf einem funktionierenden PC (Vergleich)",
        output:
`    AzureAdJoined :          YES
    DomainJoined :           YES
    TenantId :               a1b2c3d4-...`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Service Connection Point (SCP) im On-Premises-AD ist fehlerhaft konfiguriert oder fehlt - dadurch findet das Geraet den richtigen Entra-ID-Tenant fuer den Hybrid-Join nicht",
      "Die allgemeine AD-Synchronisierung ist komplett ausgefallen",
      "Das Geraet hat eine falsche Subnetzmaske",
      "Der Nutzer hat keine Intune-Lizenz zugewiesen",
    ],
    correctIndex: 0,
    explanation:
      "Die normale Objekt-Synchronisierung laeuft (\"vor 12 Minuten erfolgreich\"), aber speziell die Geraete-Registrierung fuer Hybrid-Join scheitert - der Hinweis auf das fehlerhafte SCP bestaetigt das. Das SCP im AD sagt Windows-Clients, zu welchem Entra-ID-Tenant sie sich fuer den Hybrid-Join registrieren sollen. Ohne korrektes SCP bleibt der PC nur domaenenverbunden.",
  },
  {
    id: "compliance-bitlocker",
    difficulty: "medium",
    title: "Ticket #3022 - Geraet als \"nicht konform\" markiert",
    symptom:
      "Ein Nutzer wird beim Zugriff auf eine Cloud-App blockiert, weil sein Geraet laut Conditional Access nicht konform sei. Er behauptet, alle Vorgaben zu erfuellen.",
    tools: [
      {
        id: "compliance-report",
        label: "Intune Compliance-Bericht fuer das Geraet oeffnen",
        output:
`Gesamtstatus: Nicht konform

Fehlgeschlagene Regeln:
  - Laufwerksverschluesselung (BitLocker): Nicht aktiv
Bestanden:
  - Passwort/PIN erforderlich: OK
  - Betriebssystem-Version: OK`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Compliance-Richtlinie verlangt aktivierte Laufwerksverschluesselung (BitLocker), die auf diesem Geraet nicht aktiv ist",
      "Der Nutzer hat kein gueltiges Passwort gesetzt",
      "Das Geraet hat eine zu alte Betriebssystem-Version",
      "Der Compliance-Dienst in Intune ist gestoert",
      "Das Geraet ist nicht in Intune registriert",
    ],
    correctIndex: 0,
    explanation:
      "Der Compliance-Bericht listet die BitLocker-Regel explizit als fehlgeschlagen, waehrend Passwort und OS-Version bestanden sind. Ohne aktivierte Laufwerksverschluesselung bleibt das Geraet nicht konform - und Conditional-Access-Richtlinien, die ein konformes Geraet verlangen, blockieren den Zugriff.",
  },
  {
    id: "password-hash-sync-delay",
    difficulty: "hard",
    title: "Ticket #3038 - Neues Passwort wirkt in der Cloud erst verzoegert",
    symptom:
      "Ein Nutzer aendert sein Passwort im On-Premises-AD. Lokale Anmeldung funktioniert sofort mit dem neuen Passwort, M365/Cloud-Dienste akzeptieren aber noch fuer einige Minuten das alte Passwort.",
    tools: [
      {
        id: "connect-health",
        label: "Entra Connect Sync-Health pruefen",
        output:
`Synchronisierungsmethode: Password Hash Sync (PHS)
Sync-Intervall: alle 2 Minuten (Standard)
Letzter Passwort-Sync-Zyklus: vor 90 Sekunden gestartet, laeuft noch`,
      },
      {
        id: "signin-log",
        label: "Entra ID Anmeldeprotokoll pruefen",
        output:
`09:14:02  Anmeldung fehlgeschlagen - Falsches Passwort (altes PW verwendet)
09:15:47  Anmeldung erfolgreich - Passwort akzeptiert`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das ist kein Fehler, sondern die normale, kurze Verzoegerung von Password Hash Sync (typisch ca. 2 Minuten), bis das neue Passwort-Hash in Entra ID ankommt",
      "Der Nutzer hat sein Passwort gar nicht wirklich geaendert",
      "Entra Connect ist komplett ausgefallen",
      "Es liegt ein Konflikt durch doppelte Benutzerkonten vor",
    ],
    correctIndex: 0,
    explanation:
      "Bei Password Hash Sync wird das Passwort-Hash typischerweise alle rund 2 Minuten synchronisiert (bei Bedarf sogar schneller ausgeloest). Die kurze Verzoegerung zwischen lokaler Aenderung und Cloud-Wirksamkeit ist normales, erwartetes Verhalten - kein Fehler.",
  },
  {
    id: "legacy-auth-bypass",
    difficulty: "hard",
    title: "Ticket #3044 - MFA-Pflicht wird trotz aktivierter Richtlinie umgangen",
    symptom:
      "Obwohl eine Conditional-Access-Richtlinie \"MFA fuer alle Nutzer erforderlich\" aktiv ist, meldet sich ein Angreifer erfolgreich per IMAP-E-Mail-Client an einem kompromittierten Konto an - ganz ohne MFA-Aufforderung.",
    tools: [
      {
        id: "signin-log",
        label: "Entra ID Anmeldeprotokoll (verdaechtige Anmeldung) pruefen",
        output:
`Anmeldezeit:      02:14:11
Client-App:       Andere Clients (Legacy Authentication - IMAP4)
Conditional Access: Nicht angewendet
Status:           Erfolgreich`,
      },
      {
        id: "ca-policy",
        label: "Details der Richtlinie \"MFA fuer alle Nutzer\" pruefen",
        output:
`Cloud-Apps: Alle
Client-Apps-Bedingung: Nicht konfiguriert (Legacy Authentication nicht explizit erfasst)
Grant: MFA erforderlich`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Legacy-Authentifizierungsprotokolle (wie IMAP) unterstuetzen kein modernes Auth/MFA und wurden von der Richtlinie nicht explizit erfasst - dadurch greift Conditional Access hier gar nicht",
      "Das Nutzerkonto war von der Richtlinie ausdruecklich ausgenommen",
      "Die Richtlinie war zum Zeitpunkt des Angriffs deaktiviert",
      "MFA war fuer dieses Konto nie eingerichtet worden",
    ],
    correctIndex: 0,
    explanation:
      "Das Anmeldeprotokoll zeigt \"Conditional Access: Nicht angewendet\" bei einer Anmeldung ueber Legacy Authentication (IMAP4). Legacy-Protokolle unterstuetzen kein modernes Authentifizierungsverfahren und damit auch keine MFA-Aufforderung - viele CA-Richtlinien erfassen sie nicht automatisch. Empfehlung: Legacy Authentication ueber eine eigene Richtlinie grundsaetzlich blockieren (Standardempfehlung von Microsoft).",
  },
];

let currentTicket = null;
let selectedOptionIndex = null;

/* ---------------- Quiz-Logik ---------------- */

function renderQuiz() {
  document.getElementById("ca-policies-table").textContent = CA_POLICIES_TABLE;

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  CA_QUIZ.forEach((q, qIdx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    wrapper.innerHTML = `
      <h4 style="margin-top:0;">${qIdx + 1}. ${q.question}</h4>
      <div class="option-list" data-question="${qIdx}"></div>
      <div class="feedback-box hidden" data-explanation="${qIdx}"></div>
    `;
    const list = wrapper.querySelector(".option-list");
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.innerHTML = `<input type="radio" name="caq${qIdx}" /> <span>${opt}</span>`;
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
    const q = CA_QUIZ[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item, oIdx) => {
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (chosenIndex !== undefined && Number(chosenIndex) === oIdx && oIdx !== q.correctIndex) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;

    const expBox = document.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className =
      "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === CA_QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${CA_QUIZ.length} richtig.</strong>`;

  updateProgressFlag("quizDone", allCorrect);
}

/* ---------------- Ticket-Logik ---------------- */

function loadSolvedTickets() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solvedTickets) ? stored.solvedTickets : [];
}

function pickTicket() {
  const solved = loadSolvedTickets();
  const unsolved = TICKETS.filter((t) => !solved.includes(t.id));
  const pool = unsolved.length > 0 ? unsolved : TICKETS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTicket() {
  currentTicket = pickTicket();
  selectedOptionIndex = null;

  document.getElementById("ticket-title").textContent = currentTicket.title;
  document.getElementById("ticket-symptom").textContent = currentTicket.symptom;

  const diffBadge = document.getElementById("ticket-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentTicket.difficulty];
  diffBadge.className = "badge difficulty-" + currentTicket.difficulty;

  const toolsEl = document.getElementById("ticket-tool-buttons");
  toolsEl.innerHTML = "";
  currentTicket.tools.forEach((tool) => {
    const btn = document.createElement("button");
    btn.className = "btn small";
    btn.textContent = "▶ " + tool.label;
    btn.addEventListener("click", () => toggleToolOutput(tool));
    toolsEl.appendChild(btn);
  });
  document.getElementById("ticket-tool-outputs").innerHTML = "";

  document.getElementById("ticket-question-text").textContent = currentTicket.question;
  const optionsEl = document.getElementById("ticket-options-list");
  optionsEl.innerHTML = "";
  currentTicket.options.forEach((opt, idx) => {
    const item = document.createElement("div");
    item.className = "option-item";
    item.innerHTML = `<input type="radio" name="ticket-option" /> <span>${opt}</span>`;
    item.addEventListener("click", () => selectTicketOption(idx));
    optionsEl.appendChild(item);
  });

  const fb = document.getElementById("ticket-feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";
  document.getElementById("ticket-check-btn").disabled = false;

  updateTicketScorePill();
}

function toggleToolOutput(tool) {
  const outputsEl = document.getElementById("ticket-tool-outputs");
  const existing = document.getElementById("ie-output-" + tool.id);
  if (existing) {
    existing.remove();
    return;
  }
  const block = document.createElement("div");
  block.id = "ie-output-" + tool.id;
  block.innerHTML = `<div class="terminal-output">${escapeHtml(tool.output)}</div>`;
  outputsEl.appendChild(block);
}

function selectTicketOption(idx) {
  selectedOptionIndex = idx;
  document.querySelectorAll("#ticket-options-list .option-item").forEach((el, i) => {
    el.classList.toggle("selected", i === idx);
    el.querySelector("input").checked = i === idx;
  });
}

function checkTicketAnswer() {
  if (selectedOptionIndex === null || !currentTicket) return;

  const correct = selectedOptionIndex === currentTicket.correctIndex;
  document.querySelectorAll("#ticket-options-list .option-item").forEach((el, i) => {
    if (i === currentTicket.correctIndex) el.classList.add("correct-answer");
    if (i === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
  });

  const fb = document.getElementById("ticket-feedback");
  fb.classList.remove("hidden");
  fb.className = "feedback-box " + (correct ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correct ? "Richtig!" : "Nicht ganz."}</strong> ${currentTicket.explanation}`;

  document.getElementById("ticket-check-btn").disabled = true;

  if (correct) {
    markTicketSolved(currentTicket.id);
  }
}

function markTicketSolved(id) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solvedTickets || []);
  solved.add(id);
  const solvedArr = Array.from(solved);
  setModuleStatus(MODULE_ID, stored.status || "progress", { solvedTickets: solvedArr });
  updateTicketScorePill();
  updateProgressFlag("ticketsDone", solvedArr.length >= TICKETS.length);
}

function updateTicketScorePill() {
  const solved = loadSolvedTickets();
  document.getElementById(
    "ticket-score-pill"
  ).textContent = `Geloest: ${solved.length} / ${TICKETS.length} Tickets`;
}

/* ---------------- Gemeinsamer Fortschritt ---------------- */

function updateProgressFlag(flagName, value) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const updated = Object.assign({}, stored, { [flagName]: value });
  const done = Boolean(updated.quizDone) && Boolean(updated.ticketsDone);
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, done ? "done" : "progress", updated);
  updateChecklist(updated);
  if (done && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateChecklist(state) {
  const quizItem = document.getElementById("check-quiz");
  quizItem.classList.toggle("status-done", Boolean(state.quizDone));
  quizItem.textContent = state.quizDone
    ? "✅ Conditional-Access-Quiz vollstaendig richtig geloest"
    : "⬜ Conditional-Access-Quiz vollstaendig richtig loesen";

  const ticketsItem = document.getElementById("check-tickets");
  ticketsItem.classList.toggle("status-done", Boolean(state.ticketsDone));
  ticketsItem.textContent = state.ticketsDone
    ? "✅ Alle Troubleshooting-Tickets geloest"
    : "⬜ Alle Troubleshooting-Tickets loesen";
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);

  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  updateChecklist(stored);
  if (stored.status === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);

  renderTicket();
  document.getElementById("ticket-check-btn").addEventListener("click", checkTicketAnswer);
  document.getElementById("ticket-next-btn").addEventListener("click", renderTicket);
});
