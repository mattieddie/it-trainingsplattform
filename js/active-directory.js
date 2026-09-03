/*
 * active-directory.js - Modul 7: Active Directory
 * Zwei Teile:
 *  1) GPO-Vorhersage-Quiz: anhand einer festen OU/GPO-Struktur wird
 *     gefragt, welche Einstellung fuer ein Objekt in einer bestimmten OU
 *     tatsaechlich effektiv wird (Vererbung, Enforce, Block Inheritance).
 *  2) Troubleshooting-Tickets: gleiche Mechanik wie im DHCP/DNS-Modul -
 *     Symptom, simulierte Tool-Ausgaben (dsa.msc/PowerShell/repadmin/
 *     Event-Log als Text-Fixtures), Multiple-Choice-Diagnose.
 * Alle Ausgaben sind hartcodierte Text-Fixtures, es wird nichts echtes
 * gegen ein AD ausgefuehrt.
 */

const MODULE_ID = "activedirectory";

/* ================= Teil 1: GPO-Vorhersage-Quiz ================= */

const GPO_QUIZ = [
  {
    question:
      "Ein Computer steht in der OU \"IT-Abteilung\" (unter \"Hauptsitz\"). Bekommt er den Firmenlogo-Hintergrund aus dem Domain-GPO \"Unternehmens-Standard\"?",
    options: ["Ja", "Nein"],
    correctIndex: 0,
    explanation:
      "Ja. Auf dem Weg Domain → Hauptsitz → IT-Abteilung blockiert keine OU die Vererbung, also wird das Domain-GPO ganz normal vererbt.",
  },
  {
    question:
      "Derselbe Computer in \"IT-Abteilung\" - bekommt er die USB-Sperre aus dem GPO \"Hauptsitz-Sicherheit\" (verknuepft an der OU \"Hauptsitz\")?",
    options: ["Ja", "Nein"],
    correctIndex: 0,
    explanation:
      "Ja. \"IT-Abteilung\" liegt unterhalb von \"Hauptsitz\" - ein an \"Hauptsitz\" verknuepftes GPO gilt automatisch auch fuer alle untergeordneten OUs.",
  },
  {
    question:
      "Ein Computer steht in der OU \"Filiale-Zuerich\" (unter \"Filialen\", welche die Vererbung blockiert). Bekommt er trotzdem den Firmenlogo-Hintergrund aus dem (nicht erzwungenen) Domain-GPO?",
    options: ["Ja", "Nein"],
    correctIndex: 1,
    explanation:
      "Nein. \"Block Inheritance\" an \"Filialen\" unterbindet die Vererbung von weiter oben - und da das Domain-GPO NICHT erzwungen ist, kann es sich dagegen nicht durchsetzen.",
  },
  {
    question:
      "Angenommen, das Domain-GPO \"Unternehmens-Standard\" wird jetzt zusaetzlich auf \"Erzwungen\" gesetzt. Bekommt der Computer in \"Filiale-Zuerich\" den Hintergrund jetzt?",
    options: ["Ja", "Nein"],
    correctIndex: 0,
    explanation:
      "Ja. Erzwungene (\"Enforced\") GPOs setzen sich IMMER durch - auch gegen \"Block Inheritance\" in tiefer liegenden OUs.",
  },
  {
    question:
      "Bekommt der Computer in \"Filiale-Zuerich\" die USB-Sperre aus \"Hauptsitz-Sicherheit\" (verknuepft an \"Hauptsitz\", erzwungen)?",
    options: ["Ja", "Nein"],
    correctIndex: 1,
    explanation:
      "Nein. \"Hauptsitz-Sicherheit\" ist nur an der OU \"Hauptsitz\" verknuepft. \"Filiale-Zuerich\" liegt in einem komplett anderen Teilbaum (unter \"Filialen\") - es besteht gar keine Eltern-Kind-Beziehung, daher spielt \"Erzwungen\" hier keine Rolle. Vererbung wirkt nur entlang der eigenen Astlinie nach unten.",
  },
];

const OU_DIAGRAM =
  "Domain: firma.local\n" +
  " │\n" +
  " ├─ [GPO \"Unternehmens-Standard\"] (Domain-Ebene, NICHT erzwungen)\n" +
  " │     → Desktop-Hintergrund: Firmenlogo\n" +
  " │\n" +
  " ├─ OU \"Filialen\"   🚫 Vererbung blockiert\n" +
  " │    └─ OU \"Filiale-Zuerich\"\n" +
  " │         └─ [GPO \"Filiale-Drucker\"] → Standarddrucker: HP-Zuerich\n" +
  " │\n" +
  " └─ OU \"Hauptsitz\"\n" +
  "      ├─ [GPO \"Hauptsitz-Sicherheit\"] 🔒 ERZWUNGEN → USB-Speicher: gesperrt\n" +
  "      └─ OU \"IT-Abteilung\"\n" +
  "           └─ [GPO \"IT-Tools\"] → Software: Sysinternals wird verteilt";

/* ================= Teil 2: Troubleshooting-Tickets ================= */

const TICKETS = [
  {
    id: "account-lockout",
    difficulty: "easy",
    title: "Ticket #2001 - Konto gesperrt",
    symptom:
      "Ein Nutzer meldet: 'Ich komme nicht mehr rein, Windows sagt mein Konto sei gesperrt.' Er habe kurz zuvor sein Passwort auf dem Handy falsch eingegeben.",
    tools: [
      {
        id: "get-aduser",
        label: "Get-ADUser jdoe -Properties LockedOut, BadLogonCount",
        output:
`Name          : Jana Doe
SamAccountName: jdoe
LockedOut     : True
BadLogonCount : 5`,
      },
      {
        id: "eventlog",
        label: "Security-Eventlog auf dem Domain Controller pruefen",
        output:
`4625  Fehlgeschlagene Anmeldung - Konto: jdoe - Grund: Falsches Passwort
4625  Fehlgeschlagene Anmeldung - Konto: jdoe - Grund: Falsches Passwort
4625  Fehlgeschlagene Anmeldung - Konto: jdoe - Grund: Falsches Passwort
4740  Benutzerkonto wurde gesperrt - Konto: jdoe`,
      },
    ],
    question: "Was ist die Ursache und die passende Sofortmassnahme?",
    options: [
      "Die Account-Lockout-Richtlinie hat das Konto nach zu vielen Fehlversuchen gesperrt - mit Unlock-ADAccount entsperren, danach korrektes Passwort verwenden",
      "Das Passwort des Kontos ist regulaer abgelaufen - ein neues Passwort muss gesetzt werden",
      "Das Konto wurde vom Administrator absichtlich deaktiviert",
      "Ein Gruppenrichtlinien-Konflikt verhindert die Anmeldung",
    ],
    correctIndex: 0,
    explanation:
      "LockedOut: True plus mehrere 4625-Ereignisse (falsches Passwort) gefolgt von 4740 (Kontosperrung) zeigen eindeutig eine automatische Sperrung durch die Account-Lockout-Richtlinie nach zu vielen Fehlversuchen. Mit \"Unlock-ADAccount jdoe\" (oder ueber dsa.msc) wird das Konto wieder freigegeben.",
  },
  {
    id: "gpo-wrong-ou",
    difficulty: "medium",
    title: "Ticket #2014 - Gruppenrichtlinie wird nicht angewendet",
    symptom:
      "Ein neues GPO fuer den Desktop-Hintergrund wurde an der OU \"Verkauf\" verknuepft. Auf dem PC \"PC-VK-05\" erscheint der Hintergrund aber nicht, auf anderen PCs im Verkauf schon.",
    tools: [
      {
        id: "gpresult",
        label: "gpresult /r auf PC-VK-05 ausfuehren",
        output:
`Angewendete Gruppenrichtlinienobjekte
    Default Domain Policy

Die folgenden GPOs wurden nicht angewendet, da sie gefiltert wurden:
    (keine)`,
      },
      {
        id: "get-adcomputer",
        label: "Get-ADComputer PC-VK-05 -Properties DistinguishedName",
        output:
`Name                : PC-VK-05
DistinguishedName   : CN=PC-VK-05,OU=Testgeraete,DC=firma,DC=local`,
      },
      {
        id: "get-adcomputer-other",
        label: "Get-ADComputer PC-VK-02 -Properties DistinguishedName (Vergleich, funktioniert)",
        output:
`Name                : PC-VK-02
DistinguishedName   : CN=PC-VK-02,OU=Verkauf,DC=firma,DC=local`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Computer-Objekt PC-VK-05 befindet sich in der falschen OU (\"Testgeraete\" statt \"Verkauf\") und ist daher gar nicht im Geltungsbereich des GPOs",
      "Der Domain Controller ist fuer PC-VK-05 nicht erreichbar",
      "Das GPO wurde versehentlich deaktiviert",
      "PC-VK-05 hat eine veraltete Gruppenrichtlinien-Version zwischengespeichert",
    ],
    correctIndex: 0,
    explanation:
      "Der DistinguishedName zeigt: PC-VK-05 liegt in OU=Testgeraete, nicht in OU=Verkauf, wo das GPO verknuepft ist. GPOs wirken nur auf Objekte innerhalb der OU (oder deren Unter-OUs), an die sie verknuepft sind - ein falsch einsortiertes Objekt bekommt sie schlicht nicht.",
  },
  {
    id: "gpp-item-level-targeting",
    difficulty: "medium",
    title: "Ticket #2027 - Netzlaufwerk wird nicht verbunden",
    symptom:
      "Ueber eine Gruppenrichtlinien-Preference soll allen Vertriebsmitarbeitern automatisch das Laufwerk Z: (Vertriebsordner) verbunden werden. Bei einem neuen Mitarbeiter erscheint Z: nicht, obwohl das GPO laut Bericht angewendet wird.",
    tools: [
      {
        id: "gpresult",
        label: "gpresult /r beim betroffenen Nutzer",
        output:
`Angewendete Gruppenrichtlinienobjekte
    Default Domain Policy
    Laufwerks-Mapping-Vertrieb`,
      },
      {
        id: "get-groupmembership",
        label: "Get-ADPrincipalGroupMembership jdoe | select Name",
        output:
`Name
----
Domain Users
Vertrieb-Aussendienst`,
      },
      {
        id: "gpo-details",
        label: "GPO-Details: \"Laufwerks-Mapping-Vertrieb\" - Preference-Einstellungen",
        output:
`Laufwerk Z: -> \\\\fileserver\\vertrieb
Zielgruppierung (Item-Level Targeting):
    Sicherheitsgruppe = "GRP-Vertrieb-Innendienst"`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das GPO nutzt Item-Level Targeting auf die Gruppe \"GRP-Vertrieb-Innendienst\" - der Nutzer ist aber nur in \"Vertrieb-Aussendienst\" Mitglied, daher greift die Preference fuer ihn nicht",
      "Der Fileserver \\\\fileserver\\vertrieb ist nicht erreichbar",
      "Das GPO wurde nicht korrekt repliziert",
      "Die Gruppenrichtlinie ist fuer Preferences generell deaktiviert",
    ],
    correctIndex: 0,
    explanation:
      "\"gpresult\" zeigt, dass das GPO angewendet WIRD - das Problem liegt also in einer Preference-internen Filterung: Item-Level Targeting schraenkt die Laufwerksverbindung zusaetzlich auf Mitglieder von \"GRP-Vertrieb-Innendienst\" ein. Der Nutzer ist aber in der Gruppe \"Vertrieb-Aussendienst\" - eine andere Gruppe trotz aehnlichem Namen.",
  },
  {
    id: "replication-time-skew",
    difficulty: "hard",
    title: "Ticket #2041 - AD-Replikation zwischen Standorten schlaegt fehl",
    symptom:
      "Neue Benutzerkonten, die auf DC1 (Hauptsitz) angelegt werden, tauchen auf DC2 (Zweigstelle) nicht auf. Zusaetzlich koennen sich manche Nutzer je nachdem, welcher DC sie bedient, nicht anmelden.",
    tools: [
      {
        id: "repadmin",
        label: "repadmin /replsummary ausfuehren",
        output:
`Quelle DC   Groesste Verzoegerung   Fehler
DC1         > 26 Stunden            100 % (Fehlercode 1256)
            "Der Remotename konnte nicht aufgeloest werden / Ziel nicht erreichbar"`,
      },
      {
        id: "eventlog-dc2",
        label: "System-Eventlog auf DC2 pruefen",
        output:
`Ereignis-ID 2108 (NTDS KCC): Die Zeitabweichung zwischen diesem Domaenencontroller
und dem Partner-Domaenencontroller ist zu gross fuer eine sichere Kerberos-
Authentifizierung.`,
      },
      {
        id: "time-check",
        label: "Systemzeit beider DCs vergleichen",
        output:
`DC1 Systemzeit: 2026-09-03 09:14:02
DC2 Systemzeit: 2026-09-03 08:41:37   (Abweichung: ca. 32 Minuten)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Systemzeit zwischen den Domain Controllern weicht zu stark voneinander ab (> 5 Minuten) - dadurch schlaegt Kerberos-Authentifizierung fehl und die Replikation stoppt",
      "DC2 hat keine Netzwerkverbindung zu DC1",
      "Der Festplattenspeicher auf DC2 ist voll",
      "Es liegt ein doppelter FSMO-Rolleninhaber vor",
    ],
    correctIndex: 0,
    explanation:
      "Kerberos toleriert standardmaessig nur eine Zeitabweichung von 5 Minuten zwischen den beteiligten Systemen. Die gemessene Abweichung von ca. 32 Minuten sowie das Event 2108 zeigen klar: eine fehlerhafte Zeitsynchronisation (z.B. defekter NTP/W32Time-Dienst auf DC2) verhindert sowohl Authentifizierung als auch Replikation. Loesung: korrekte Zeitquelle/NTP-Konfiguration wiederherstellen.",
  },
  {
    id: "fsmo-rid-master",
    difficulty: "hard",
    title: "Ticket #2058 - Keine neuen Benutzerkonten moeglich",
    symptom:
      "Administratoren koennen domainweit keine neuen Benutzer- oder Computerkonten mehr anlegen. Die Fehlermeldung erwaehnt, dass keine RID-Pools mehr zugewiesen werden koennen. Bestehende Konten funktionieren normal.",
    tools: [
      {
        id: "netdom",
        label: "netdom query fsmo ausfuehren",
        output:
`Schema Master               DC1.firma.local
Domain Naming Master        DC1.firma.local
PDC Emulator                DC2.firma.local
RID Master                  DC-ALT.firma.local
Infrastructure Master       DC2.firma.local`,
      },
      {
        id: "ping-dcalt",
        label: "ping DC-ALT.firma.local",
        output:
`Ping wird ausgefuehrt fuer DC-ALT.firma.local...
Zielhost nicht erreichbar.
Zielhost nicht erreichbar.`,
      },
      {
        id: "inventory",
        label: "Geraeteinventar pruefen: DC-ALT",
        output:
`Status: Ausser Betrieb genommen (laut Inventar vor 2 Wochen abgeschaltet)
Hinweis: FSMO-Rollen wurden vor der Ausserbetriebnahme NICHT uebertragen!`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der RID-Master (eine FSMO-Rolle) wurde stillgelegt, ohne die Rolle vorher zu uebertragen - ohne erreichbaren RID-Master koennen keine neuen Objekt-SIDs mehr vergeben werden",
      "Die Domaene hat die maximale Anzahl an Benutzerkonten erreicht",
      "Der Schema Master ist nicht erreichbar",
      "Es liegt ein Replikationskonflikt zwischen DC1 und DC2 vor",
    ],
    correctIndex: 0,
    explanation:
      "Jede neue Sicherheits-ID (SID) fuer Benutzer/Computer benoetigt eine RID aus einem Pool, den nur der RID-Master (eine von fuenf FSMO-Rollen) vergeben kann. Da DC-ALT (der RID-Master) ausser Betrieb genommen wurde, ohne die Rolle zu uebertragen, ist kein RID-Master mehr erreichbar. Loesung: Rolle per \"Move-ADDirectoryServerOperationMasterRole\" auf einen aktiven DC uebertragen (oder bei Totalausfall per \"-Force\" uebernehmen/\"seizen\").",
  },
];

let currentTicket = null;
let selectedOptionIndex = null;

/* ---------------- Quiz-Logik ---------------- */

function renderQuiz() {
  document.getElementById("ou-diagram").textContent = OU_DIAGRAM;

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  GPO_QUIZ.forEach((q, qIdx) => {
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
      item.innerHTML = `<input type="radio" name="gpoq${qIdx}" /> <span>${opt}</span>`;
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
    const q = GPO_QUIZ[qIdx];
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
  const allCorrect = correctCount === GPO_QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${GPO_QUIZ.length} richtig.</strong>`;

  updateProgressFlag("quizDone", allCorrect);
}

/* ---------------- Ticket-Logik (analog DHCP/DNS-Modul) ---------------- */

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
  const existing = document.getElementById("ad-output-" + tool.id);
  if (existing) {
    existing.remove();
    return;
  }
  const block = document.createElement("div");
  block.id = "ad-output-" + tool.id;
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
    ? "✅ GPO-Vorhersage-Quiz vollstaendig richtig geloest"
    : "⬜ GPO-Vorhersage-Quiz vollstaendig richtig loesen";

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
