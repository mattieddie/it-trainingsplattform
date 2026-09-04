/*
 * intune-entra.js - Modul 8: Intune / Entra ID (Azure AD) / Hybrid
 * Zwei Teile, gleiches Muster wie im Active-Directory-Modul:
 *  1) Conditional-Access-Szenario-Quiz: zeigt den zentralen Unterschied zu
 *     Firewall-Regeln - bei CA gewinnt NICHT die erste passende Regel,
 *     sondern ALLE zutreffenden Richtlinien wirken gemeinsam (UND-
 *     Verknüpfung ihrer Grant Controls), und ein "Blockieren" überstimmt
 *     immer alle anderen Grants.
 *  2) Troubleshooting-Tickets (Geräte-Join, Compliance, Sync, Legacy Auth).
 * Alle Ausgaben sind hartcodierte Text-Fixtures, es wird nichts echtes
 * gegen Microsoft Entra ID / Intune ausgeführt.
 */

const MODULE_ID = "intuneentra";

/* ================= Teil 1: Conditional-Access-Quiz ================= */

const CA_POLICIES_TABLE =
  "Richtlinie 1 \"Baseline-MFA\"\n" +
  "  Nutzer: Alle          Bedingung: Anmeldung ausserhalb des Firmennetzwerks\n" +
  "  Grant:  MFA erforderlich\n\n" +
  "Richtlinie 2 \"Admin-Schutz\"\n" +
  "  Nutzer: Gruppe \"Admins\"   Bedingung: beliebig\n" +
  "  Grant:  MFA UND konformes Gerät erforderlich\n\n" +
  "Richtlinie 3 \"Geo-Block\"\n" +
  "  Nutzer: Alle          Bedingung: Anmeldung aus Hochrisiko-Land\n" +
  "  Grant:  Zugriff blockieren";

const CA_QUIZ = [
  {
    difficulty: "easy",
    question:
      "Ein normaler Nutzer (kein Admin) meldet sich von zuhause (ausserhalb des Firmennetzwerks) an. Welche Anforderung(en) muss er erfüllen?",
    options: [
      "MFA erforderlich",
      "MFA UND konformes Gerät erforderlich",
      "Keine besonderen Anforderungen",
      "Zugriff wird blockiert",
    ],
    correctIndex: 0,
    explanation:
      "Nur Richtlinie 1 greift (ausserhalb des Netzwerks, gilt für alle Nutzer) → MFA erforderlich. Richtlinie 2 greift nicht (keine Admin-Gruppe), Richtlinie 3 nicht (kein Hochrisiko-Land).",
  },
  {
    difficulty: "medium",
    question:
      "Ein Admin meldet sich aus dem Büro-Netzwerk an. Welche Anforderung(en) muss er erfüllen?",
    options: [
      "Keine besonderen Anforderungen",
      "Nur MFA erforderlich",
      "MFA UND konformes Gerät erforderlich",
      "Zugriff wird blockiert",
    ],
    correctIndex: 2,
    explanation:
      "Richtlinie 1 greift nicht (er ist im Firmennetz, die Bedingung 'ausserhalb' trifft nicht zu). Richtlinie 2 greift (Admin-Gruppe, Bedingung 'beliebig') → MFA UND konformes Gerät.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Admin meldet sich von zuhause an (ausserhalb des Netzwerks). Welche Anforderung(en) gelten in Summe?",
    options: [
      "Nur MFA (die stärkere Anforderung aus Richtlinie 2 zählt nicht, da Richtlinie 1 zuerst greift)",
      "MFA UND konformes Gerät - beide zutreffenden Richtlinien wirken gemeinsam",
      "Nur konformes Gerät, MFA wird ignoriert",
      "Es gilt nur die zuletzt erstellte Richtlinie",
    ],
    correctIndex: 1,
    explanation:
      "Anders als bei Firewall-Regeln gibt es bei Conditional Access KEIN 'erste Regel gewinnt'. Richtlinie 1 UND Richtlinie 2 treffen beide zu - ihre Grant Controls werden kumulativ mit UND verknüpft. Ergebnis: MFA UND konformes Gerät müssen erfüllt sein.",
  },
  {
    difficulty: "hard",
    question:
      "Ein beliebiger Nutzer versucht sich aus einem als Hochrisiko eingestuften Land anzumelden, erfüllt aber MFA und hat ein konformes Gerät. Wird der Zugriff gewährt?",
    options: [
      "Ja, da MFA und konformes Gerät erfüllt sind",
      "Nein - eine zutreffende 'Blockieren'-Richtlinie überstimmt immer alle anderen (erfüllten) Grant-Anforderungen",
      "Nur mit zusätzlicher Admin-Freigabe",
      "Ja, aber nur für eine begrenzte Sitzungsdauer",
    ],
    correctIndex: 1,
    explanation:
      "Richtlinie 3 greift (Hochrisiko-Land) und deren Control ist 'Zugriff blockieren'. Eine zutreffende Block-Richtlinie gewinnt immer, unabhängig davon, welche anderen (erfüllbaren) Anforderungen andere Richtlinien stellen.",
  },
];

/* ================= Teil 2: Gerätemanagement-Quiz ================= */

const DEVICE_QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist Windows Autopilot?",
    options: [
      "Ein Dienst, der neue Geräte direkt ab Werk (out-of-box) automatisch mit Firmeneinstellungen provisioniert, ohne dass IT das Gerät vorher manuell einrichten muss",
      "Eine Funktion, die Geräte automatisch neu startet, wenn Updates anstehen",
      "Ein Tool, das defekte Geräte automatisch per Post an den Hersteller zurückschickt",
    ],
    correctIndex: 0,
    explanation:
      "Autopilot ermöglicht \"Zero-Touch-Provisioning\": ein Nutzer packt ein neues Gerät aus, meldet sich mit dem Firmenkonto an, und Richtlinien/Apps/Einstellungen werden automatisch angewendet - IT muss das Gerät nie in der Hand gehabt haben.",
  },
  {
    difficulty: "easy",
    question:
      "Was ist der Unterschied zwischen \"Zurücksetzen\" (Wipe) und \"Ausmustern\" (Retire) eines Geräts in Intune?",
    options: [
      "Wipe löscht alle Daten und setzt das Gerät auf Werkseinstellungen zurück; Retire entfernt nur die Firmenverwaltung/-daten (z.B. bei BYOD), persönliche Daten bleiben erhalten",
      "Beide Aktionen bedeuten exakt dasselbe, nur unterschiedliche Bezeichnung",
      "Wipe entfernt nur die Verwaltung, Retire löscht sämtliche Daten inkl. privater Dateien",
    ],
    correctIndex: 0,
    explanation:
      "\"Wipe\" ist der drastischere Schritt (kompletter Reset, sinnvoll bei Verlust/Diebstahl eines Firmengeräts). \"Retire\" trennt ein Gerät sauber von der Verwaltung, ohne private Inhalte anzurühren - typisch beim Ausscheiden eines Mitarbeiters mit eigenem (BYOD) Gerät.",
  },
  {
    difficulty: "medium",
    question:
      "Welcher Autopilot-Modus passt für Geräte, die sich ein einzelner Nutzer mit eigenem Konto selbst einrichten soll (im Gegensatz zu einem Kiosk-Gerät ohne persönliche Anmeldung)?",
    options: [
      "User-Driven Mode - der Nutzer meldet sich beim Setup mit seinem Konto an, das Gerät wird ihm zugeordnet",
      "Self-Deploying Mode - komplett ohne jede Nutzeranmeldung, typisch für Kiosk-/Gemeinsam genutzte Geräte",
      "Beide Modi funktionieren für diesen Zweck identisch",
    ],
    correctIndex: 0,
    explanation:
      "User-Driven Mode bindet das Gerät an eine bestimmte Person (mit Anmeldung während des Setups). Self-Deploying Mode ist für Geräte gedacht, die niemandem persönlich zugeordnet sind (z.B. Empfangs-Kiosk, Besprechungsraum-Tablet).",
  },
  {
    difficulty: "medium",
    question:
      "Ein Nutzer soll eine Pflicht-App (z.B. der Firmen-VPN-Client) automatisch auf seinem verwalteten Gerät installiert bekommen, ohne sie manuell aus dem Firmenportal laden zu müssen.",
    options: [
      "Die App-Zuweisung auf \"Erforderlich\" (Required) statt \"Verfügbar\" (Available) stellen",
      "Die App als \"Verfügbar\" (Available) zuweisen - das installiert automatisch bei allen Nutzern",
      "Apps können in Intune generell nicht automatisch installiert werden",
    ],
    correctIndex: 0,
    explanation:
      "\"Erforderlich\" (Required) installiert die App automatisch im Hintergrund auf allen zugewiesenen Geräten. \"Verfügbar\" (Available) legt die App nur ins Firmenportal, von wo der Nutzer sie selbst installieren kann.",
  },
  {
    difficulty: "medium",
    question:
      "Ein privates (BYOD) Smartphone soll Firmen-E-Mail per Outlook nutzen dürfen, die IT soll das Gerät aber NICHT vollständig verwalten oder komplett löschen können.",
    options: [
      "App-Schutzrichtlinien (MAM / App Protection Policies) statt vollständiger Geräteverwaltung (MDM) einsetzen - schützt nur die Firmendaten innerhalb der App",
      "Das Gerät trotzdem vollständig per MDM registrieren, das ist bei BYOD kein Problem",
      "Ohne volle Geräteverwaltung ist der Zugriff auf Firmen-Mail technisch nicht möglich",
    ],
    correctIndex: 0,
    explanation:
      "App-Schutzrichtlinien (Mobile Application Management) schützen nur die Firmendaten innerhalb bestimmter Apps (z.B. Verhindern von Copy-Paste in private Apps, Anmeldezwang), ohne das gesamte Gerät zu verwalten - der übliche Ansatz für private Geräte.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Firmenlaptop wurde gestohlen. Welche Kombination sorgt dafür, dass alle Firmendaten sofort remote gelöscht werden UND das Gerät danach nicht mehr als Firmengerät in der Verwaltung geführt wird?",
    options: [
      "Zuerst \"Zurücksetzen\" (Wipe) zum Löschen aller Daten, danach das Gerät aus der Verwaltung entfernen (Retire/Löschen des Geräteobjekts)",
      "Nur \"Ausmustern\" (Retire) reicht aus, das löscht automatisch auch alle Daten",
      "Ein einfacher Passwort-Reset des Nutzerkontos genügt bereits",
    ],
    correctIndex: 0,
    explanation:
      "Retire allein löscht keine Firmendaten (es trennt nur die Verwaltung) - bei einem gestohlenen Gerät ist das zu wenig. Ein vollständiger Wipe löscht die Daten; anschliessend wird das Geräteobjekt aus der Verwaltung entfernt, damit es nicht fälschlich als aktives Firmengerät gilt.",
  },
  {
    difficulty: "hard",
    question:
      "Ein neu bestelltes Gerät soll beim allerersten Einschalten durch den Endnutzer zuhause automatisch der Firmenumgebung beitreten und alle Richtlinien/Apps erhalten - ganz ohne dass IT das Gerät vorher in der Hand hatte. Was ist dafür zwingend nötig?",
    options: [
      "Die Hardware-ID (Hardware Hash) des Geräts muss vorab (z.B. vom Händler) bei Windows Autopilot registriert und mit dem Tenant verknüpft worden sein",
      "Der Nutzer braucht lediglich einen Domain-Administrator-Account",
      "Das ist ohne physischen Kontakt der IT mit dem Gerät technisch nicht möglich",
    ],
    correctIndex: 0,
    explanation:
      "Autopilot funktioniert nur, wenn die eindeutige Hardware-ID des Geräts vorher in Autopilot registriert wurde (oft direkt durch den Händler/OEM). Erst dann erkennt der Dienst das Gerät beim ersten Start automatisch als Firmengerät.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Gerät ist als \"nicht konform\" markiert (z.B. weil BitLocker fehlt), der Nutzer braucht aber dringend Zugriff auf eine kritische App. Was ist die sicherheitstechnisch richtige Vorgehensweise?",
    options: [
      "Das konkrete Problem beheben (z.B. BitLocker aktivieren), statt die Compliance-Richtlinie pauschal zu deaktivieren oder aufzuweichen",
      "Die Compliance-Richtlinie für alle Geräte vorübergehend deaktivieren, bis das Problem behoben ist",
      "Dem Nutzer dauerhaft eine Ausnahme von allen Sicherheitsrichtlinien einräumen",
    ],
    correctIndex: 0,
    explanation:
      "Eine pauschale Deaktivierung oder Aufweichung der Richtlinie senkt den Schutz für ALLE Geräte, nicht nur das betroffene. Der richtige Weg ist, die konkrete Ursache der Nichtkonformität zu beheben - das stellt Sicherheit UND Zugriff wieder her.",
  },
];

/* ================= Teil 3: Troubleshooting-Tickets ================= */

const TICKETS = [
  {
    id: "device-not-in-intune",
    difficulty: "easy",
    title: "Ticket #3001 - Neues Notebook erscheint nicht in Intune",
    symptom:
      "Ein neues Firmen-Notebook wurde eingerichtet und an den Nutzer übergeben. Im Intune-Portal taucht das Gerät aber nicht auf, Richtlinien werden nicht angewendet.",
    tools: [
      {
        id: "dsregcmd",
        label: "dsregcmd /status auf dem Notebook ausführen",
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
        label: "Einstellungen > Konten > Zugriff für Arbeit oder Schule prüfen",
        output:
`Keine verbundenen Konten vorhanden.`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Gerät wurde nie erfolgreich mit Entra ID verbunden (weder Join noch Registrierung) - ohne diesen Schritt gibt es kein Intune-Onboarding",
      "Der Intune-Dienst ist aktuell gestört",
      "Das Gerät hat keine Internetverbindung",
      "Die Intune-Lizenz des Nutzers ist abgelaufen",
    ],
    correctIndex: 0,
    explanation:
      "\"dsregcmd /status\" zeigt bei allen Join-Arten \"NO\" - das Gerät ist überhaupt nicht mit Entra ID verbunden. Intune verwaltet nur Geräte, die zuvor per Entra-Join, Hybrid-Join oder -Registrierung mit Entra ID verbunden wurden. Lösung: Einrichtungsassistent (OOBE) mit Firmenkonto erneut durchlaufen bzw. \"Verbinden\" unter Zugriff für Arbeit oder Schule ausführen.",
  },
  {
    id: "hybrid-join-scp",
    difficulty: "medium",
    title: "Ticket #3015 - Hybrid Entra Join schlägt fehl",
    symptom:
      "On-Premises-AD-Computer sollen automatisch auch als \"Hybrid Entra Joined\" erscheinen. Bei einem PC bleibt der Status jedoch dauerhaft nur domänenverbunden.",
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
        label: "Entra Connect Sync-Status auf dem Sync-Server prüfen",
        output:
`Letzte Synchronisierung: vor 12 Minuten (erfolgreich)
Letzter Geräte-Registrierungs-Lauf: Fehler
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
      "Das Service Connection Point (SCP) im On-Premises-AD ist fehlerhaft konfiguriert oder fehlt - dadurch findet das Gerät den richtigen Entra-ID-Tenant für den Hybrid-Join nicht",
      "Die allgemeine AD-Synchronisierung ist komplett ausgefallen",
      "Das Gerät hat eine falsche Subnetzmaske",
      "Der Nutzer hat keine Intune-Lizenz zugewiesen",
    ],
    correctIndex: 0,
    explanation:
      "Die normale Objekt-Synchronisierung läuft (\"vor 12 Minuten erfolgreich\"), aber speziell die Geräte-Registrierung für Hybrid-Join scheitert - der Hinweis auf das fehlerhafte SCP bestätigt das. Das SCP im AD sagt Windows-Clients, zu welchem Entra-ID-Tenant sie sich für den Hybrid-Join registrieren sollen. Ohne korrektes SCP bleibt der PC nur domänenverbunden.",
  },
  {
    id: "compliance-bitlocker",
    difficulty: "medium",
    title: "Ticket #3022 - Gerät als \"nicht konform\" markiert",
    symptom:
      "Ein Nutzer wird beim Zugriff auf eine Cloud-App blockiert, weil sein Gerät laut Conditional Access nicht konform sei. Er behauptet, alle Vorgaben zu erfüllen.",
    tools: [
      {
        id: "compliance-report",
        label: "Intune Compliance-Bericht für das Gerät öffnen",
        output:
`Gesamtstatus: Nicht konform

Fehlgeschlagene Regeln:
  - Laufwerksverschlüsselung (BitLocker): Nicht aktiv
Bestanden:
  - Passwort/PIN erforderlich: OK
  - Betriebssystem-Version: OK`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Compliance-Richtlinie verlangt aktivierte Laufwerksverschlüsselung (BitLocker), die auf diesem Gerät nicht aktiv ist",
      "Der Nutzer hat kein gültiges Passwort gesetzt",
      "Das Gerät hat eine zu alte Betriebssystem-Version",
      "Der Compliance-Dienst in Intune ist gestört",
      "Das Gerät ist nicht in Intune registriert",
    ],
    correctIndex: 0,
    explanation:
      "Der Compliance-Bericht listet die BitLocker-Regel explizit als fehlgeschlagen, während Passwort und OS-Version bestanden sind. Ohne aktivierte Laufwerksverschlüsselung bleibt das Gerät nicht konform - und Conditional-Access-Richtlinien, die ein konformes Gerät verlangen, blockieren den Zugriff.",
  },
  {
    id: "password-hash-sync-delay",
    difficulty: "hard",
    title: "Ticket #3038 - Neues Passwort wirkt in der Cloud erst verzögert",
    symptom:
      "Ein Nutzer ändert sein Passwort im On-Premises-AD. Lokale Anmeldung funktioniert sofort mit dem neuen Passwort, M365/Cloud-Dienste akzeptieren aber noch für einige Minuten das alte Passwort.",
    tools: [
      {
        id: "connect-health",
        label: "Entra Connect Sync-Health prüfen",
        output:
`Synchronisierungsmethode: Password Hash Sync (PHS)
Sync-Intervall: alle 2 Minuten (Standard)
Letzter Passwort-Sync-Zyklus: vor 90 Sekunden gestartet, läuft noch`,
      },
      {
        id: "signin-log",
        label: "Entra ID Anmeldeprotokoll prüfen",
        output:
`09:14:02  Anmeldung fehlgeschlagen - Falsches Passwort (altes PW verwendet)
09:15:47  Anmeldung erfolgreich - Passwort akzeptiert`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das ist kein Fehler, sondern die normale, kurze Verzögerung von Password Hash Sync (typisch ca. 2 Minuten), bis das neue Passwort-Hash in Entra ID ankommt",
      "Der Nutzer hat sein Passwort gar nicht wirklich geändert",
      "Entra Connect ist komplett ausgefallen",
      "Es liegt ein Konflikt durch doppelte Benutzerkonten vor",
    ],
    correctIndex: 0,
    explanation:
      "Bei Password Hash Sync wird das Passwort-Hash typischerweise alle rund 2 Minuten synchronisiert (bei Bedarf sogar schneller ausgelöst). Die kurze Verzögerung zwischen lokaler Änderung und Cloud-Wirksamkeit ist normales, erwartetes Verhalten - kein Fehler.",
  },
  {
    id: "legacy-auth-bypass",
    difficulty: "hard",
    title: "Ticket #3044 - MFA-Pflicht wird trotz aktivierter Richtlinie umgangen",
    symptom:
      "Obwohl eine Conditional-Access-Richtlinie \"MFA für alle Nutzer erforderlich\" aktiv ist, meldet sich ein Angreifer erfolgreich per IMAP-E-Mail-Client an einem kompromittierten Konto an - ganz ohne MFA-Aufforderung.",
    tools: [
      {
        id: "signin-log",
        label: "Entra ID Anmeldeprotokoll (verdächtige Anmeldung) prüfen",
        output:
`Anmeldezeit:      02:14:11
Client-App:       Andere Clients (Legacy Authentication - IMAP4)
Conditional Access: Nicht angewendet
Status:           Erfolgreich`,
      },
      {
        id: "ca-policy",
        label: "Details der Richtlinie \"MFA für alle Nutzer\" prüfen",
        output:
`Cloud-Apps: Alle
Client-Apps-Bedingung: Nicht konfiguriert (Legacy Authentication nicht explizit erfasst)
Grant: MFA erforderlich`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Legacy-Authentifizierungsprotokolle (wie IMAP) unterstützen kein modernes Auth/MFA und wurden von der Richtlinie nicht explizit erfasst - dadurch greift Conditional Access hier gar nicht",
      "Das Nutzerkonto war von der Richtlinie ausdrücklich ausgenommen",
      "Die Richtlinie war zum Zeitpunkt des Angriffs deaktiviert",
      "MFA war für dieses Konto nie eingerichtet worden",
    ],
    correctIndex: 0,
    explanation:
      "Das Anmeldeprotokoll zeigt \"Conditional Access: Nicht angewendet\" bei einer Anmeldung über Legacy Authentication (IMAP4). Legacy-Protokolle unterstützen kein modernes Authentifizierungsverfahren und damit auch keine MFA-Aufforderung - viele CA-Richtlinien erfassen sie nicht automatisch. Empfehlung: Legacy Authentication über eine eigene Richtlinie grundsätzlich blockieren (Standardempfehlung von Microsoft).",
  },
];

let currentTicket = null;
let selectedOptionIndex = null;

/* ---------------- Quiz-Logik (generisch für beide Quiz-Blöcke) ---------------- */

function renderQuizGeneric(quizArray, containerId, namePrefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  quizArray.forEach((q, qIdx) => {
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
      item.innerHTML = `<input type="radio" name="${namePrefix}${qIdx}" /> <span>${opt}</span>`;
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

function checkQuizGeneric(quizArray, containerId, feedbackId, flagName) {
  const lists = document.querySelectorAll(`#${containerId} .option-list`);
  let correctCount = 0;

  lists.forEach((list, qIdx) => {
    const chosenIndex = list.dataset.chosenIndex;
    const q = quizArray[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item) => {
      const oIdx = Number(item.dataset.origIndex);
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (chosenIndex !== undefined && Number(chosenIndex) === oIdx && oIdx !== q.correctIndex) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;

    const expBox = list.parentElement.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className =
      "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const fb = document.getElementById(feedbackId);
  fb.classList.remove("hidden");
  const allCorrect = correctCount === quizArray.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${quizArray.length} richtig.</strong>`;

  updateProgressFlag(flagName, allCorrect);
}

function renderQuiz() {
  document.getElementById("ca-policies-table").textContent = CA_POLICIES_TABLE;
  renderQuizGeneric(CA_QUIZ, "quiz-container", "caq");
}

function checkQuiz() {
  checkQuizGeneric(CA_QUIZ, "quiz-container", "quiz-feedback", "quizDone");
}

function renderDeviceQuiz() {
  renderQuizGeneric(DEVICE_QUIZ, "device-quiz-container", "dq");
}

function checkDeviceQuiz() {
  checkQuizGeneric(DEVICE_QUIZ, "device-quiz-container", "device-quiz-feedback", "deviceQuizDone");
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
  const shuffledOrder = shuffleArray(currentTicket.options.map((_, i) => i));
  shuffledOrder.forEach((idx) => {
    const opt = currentTicket.options[idx];
    const item = document.createElement("div");
    item.className = "option-item";
    item.dataset.origIndex = String(idx);
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
  document.querySelectorAll("#ticket-options-list .option-item").forEach((el) => {
    const match = Number(el.dataset.origIndex) === idx;
    el.classList.toggle("selected", match);
    el.querySelector("input").checked = match;
  });
}

function checkTicketAnswer() {
  if (selectedOptionIndex === null || !currentTicket) return;

  const correct = selectedOptionIndex === currentTicket.correctIndex;
  document.querySelectorAll("#ticket-options-list .option-item").forEach((el) => {
    const origIdx = Number(el.dataset.origIndex);
    if (origIdx === currentTicket.correctIndex) el.classList.add("correct-answer");
    if (origIdx === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
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
  ).textContent = `Gelöst: ${solved.length} / ${TICKETS.length} Tickets`;
}

/* ---------------- Gemeinsamer Fortschritt ---------------- */

function updateProgressFlag(flagName, value) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const updated = Object.assign({}, stored, { [flagName]: value });
  const done =
    Boolean(updated.quizDone) && Boolean(updated.deviceQuizDone) && Boolean(updated.ticketsDone);
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
    ? "✅ Conditional-Access-Quiz vollständig richtig gelöst"
    : "⬜ Conditional-Access-Quiz vollständig richtig lösen";

  const deviceQuizItem = document.getElementById("check-device-quiz");
  deviceQuizItem.classList.toggle("status-done", Boolean(state.deviceQuizDone));
  deviceQuizItem.textContent = state.deviceQuizDone
    ? "✅ Gerätemanagement-Quiz vollständig richtig gelöst"
    : "⬜ Gerätemanagement-Quiz vollständig richtig lösen";

  const ticketsItem = document.getElementById("check-tickets");
  ticketsItem.classList.toggle("status-done", Boolean(state.ticketsDone));
  ticketsItem.textContent = state.ticketsDone
    ? "✅ Alle Troubleshooting-Tickets gelöst"
    : "⬜ Alle Troubleshooting-Tickets lösen";
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

  renderDeviceQuiz();
  document.getElementById("check-device-quiz-btn").addEventListener("click", checkDeviceQuiz);

  renderTicket();
  document.getElementById("ticket-check-btn").addEventListener("click", checkTicketAnswer);
  document.getElementById("ticket-next-btn").addEventListener("click", renderTicket);
});
