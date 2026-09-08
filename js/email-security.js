/*
 * email-security.js - Modul 10: E-Mail-Sicherheit (SPF/DKIM/DMARC)
 * Konzept-Erklärung + ein schwierigkeitsgestuftes Quiz zu DNS-Record-
 * Interpretation und Spoofing-/Zustellungs-Szenarien. Alle Records und
 * Szenarien sind erfundene Beispiele, keine echten Abfragen.
 */

const MODULE_ID = "emailsecurity";

const QUIZ = [
  {
    difficulty: "easy",
    question:
      "Warum konnte E-Mail-Absenderfälschung (Spoofing) historisch so einfach funktionieren?",
    options: [
      "Weil SMTP ursprünglich ohne Absenderprüfung entworfen wurde - der sichtbare From-Header lässt sich frei setzen, wie eine handschriftliche Absenderzeile auf einem Papierumschlag",
      "Weil E-Mail-Server grundsätzlich keine Verschlüsselung unterstützen",
      "Weil Spoofing erst seit wenigen Jahren technisch überhaupt möglich ist",
    ],
    correctIndex: 0,
    explanation:
      "SMTP stammt aus einer Zeit, in der gegenseitiges Vertrauen zwischen wenigen Servern selbstverständlich war. SPF, DKIM und DMARC wurden alle erst später nachgerüstet, um genau diese fehlende Absenderprüfung zu schliessen.",
  },
  {
    difficulty: "easy",
    question:
      "Ein SPF-Eintrag lautet: v=spf1 include:_spf.google.com ~all. Was bedeutet der Qualifier \"~all\" am Ende?",
    options: [
      "SoftFail: nicht gelistete Server werden als verdächtig markiert, die Mail wird aber meist trotzdem zugestellt (oft mit Spam-Kennzeichnung)",
      "HardFail: nicht gelistete Server werden strikt abgelehnt",
      "Alle Server sind automatisch erlaubt, unabhängig von der Liste",
    ],
    correctIndex: 0,
    explanation:
      "\"~all\" (SoftFail) ist eine mildere Einstellung als \"-all\" (HardFail, strikte Ablehnung) und \"+all\" (alles erlauben, sehr unsicher). Viele Domains starten testweise mit \"~all\", bevor sie auf \"-all\" umstellen.",
  },
  {
    difficulty: "easy",
    question: "Was prüfen SPF, DKIM und DMARC im Kern gemeinsam?",
    options: [
      "Ob eine E-Mail tatsächlich von einem autorisierten Server der angegebenen Absenderdomain stammt und unterwegs nicht verändert wurde",
      "Ob der Empfänger die Mail gelesen hat",
      "Ob der E-Mail-Anhang virenfrei ist",
    ],
    correctIndex: 0,
    explanation:
      "Alle drei Mechanismen drehen sich um Absender-Authentizität: SPF prüft die sendende IP, DKIM prüft eine kryptografische Signatur, DMARC verknüpft beides mit einer Richtlinie, was bei Fehlschlag passieren soll.",
  },
  {
    difficulty: "medium",
    question:
      "Wo wird der öffentliche Schlüssel für die DKIM-Prüfung veröffentlicht?",
    options: [
      "Als TXT-Record unter selector._domainkey.domain.tld",
      "Im Header jeder einzelnen E-Mail",
      "Auf der Webseite der Firma unter /dkim-key",
    ],
    correctIndex: 0,
    explanation:
      "Der DKIM-Selector (ein beliebiger Name, z.B. \"mail\") plus \"._domainkey.\" plus die Domain ergeben den DNS-Namen, unter dem der öffentliche Schlüssel als TXT-Record liegt - der empfangende Server holt ihn sich dort, um die Signatur zu prüfen.",
  },
  {
    difficulty: "medium",
    question:
      "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@firma.ch - was passiert mit Mails, die die DMARC-Prüfung nicht bestehen?",
    options: [
      "Sie werden in Quarantäne verschoben (typischerweise der Spam-Ordner), und ein Bericht geht an die angegebene Adresse",
      "Sie werden automatisch gelöscht, ohne Benachrichtigung",
      "Sie werden trotzdem normal zugestellt, nur langsamer",
    ],
    correctIndex: 0,
    explanation:
      "\"p=quarantine\" ist eine von drei DMARC-Richtlinien (p=none nur beobachten, p=quarantine in Verdacht/Spam verschieben, p=reject komplett ablehnen). \"rua\" gibt die Adresse für aggregierte aggregierte Berichte an.",
  },
  {
    difficulty: "medium",
    question: "Warum sollte eine Domain nur EINEN einzigen SPF-TXT-Record haben?",
    options: [
      "Weil bei mehreren SPF-Einträgen das Prüfergebnis laut Standard undefiniert ist - mehrere Versanddienste müssen über \"include:\" in einem einzigen Eintrag kombiniert werden",
      "Weil DNS technisch nur einen TXT-Record pro Domain erlaubt",
      "Weil zwei SPF-Einträge automatisch beide Server-Listen kombiniert erlauben",
    ],
    correctIndex: 0,
    explanation:
      "Mehrere SPF-Records für dieselbe Domain führen zu einem undefinierten/fehlerhaften Ergebnis. Nutzt eine Firma mehrere Versanddienste (z.B. Google Workspace + ein Newsletter-Tool), müssen diese über mehrere \"include:\"-Mechanismen in EINEM Eintrag zusammengefasst werden.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Angreifer fälscht die Absenderadresse info@firma.ch und versendet Phishing-Mails über einen eigenen Server. SPF für firma.ch ist korrekt auf die echten Mailserver gesetzt (-all). DKIM ist nicht konfiguriert. DMARC steht auf p=reject mit strikter SPF-Alignment. Wird die Phishing-Mail zugestellt?",
    options: [
      "Nein - SPF schlägt fehl (der fremde Server ist nicht autorisiert), und DMARC mit p=reject lehnt die Mail deshalb ab, unabhängig vom fehlenden DKIM",
      "Ja, weil DKIM nicht konfiguriert ist, greift DMARC gar nicht",
      "Ja, SPF wird nur bei ausgehenden, nicht bei eingehenden Mails geprüft",
    ],
    correctIndex: 0,
    explanation:
      "SPF prüft, ob die sendende Server-IP für die Absenderdomain autorisiert ist - der Angreifer-Server ist es nicht, SPF schlägt also fehl. Da DMARC auf p=reject mit strikter SPF-Alignment steht und mindestens ein Mechanismus (hier keiner) bestehen muss, wird die Mail abgelehnt.",
  },
  {
    difficulty: "hard",
    question:
      "Ein legitimer Newsletter-Dienst versendet im Auftrag von firma.ch, ist aber NICHT in der SPF-Liste von firma.ch eingetragen. Er signiert die Mails aber korrekt per DKIM mit einem Schlüssel von firma.ch. DMARC von firma.ch verlangt (Standardverhalten): mindestens SPF ODER DKIM muss im Alignment bestehen. Kommt die Mail durch?",
    options: [
      "Ja - DKIM besteht und ist ausreichend, DMARC verlangt normalerweise nur einen der beiden Mechanismen erfolgreich",
      "Nein, es müssen immer BEIDE Mechanismen (SPF und DKIM) gleichzeitig bestehen",
      "Nein, ohne SPF-Eintrag wird die Mail immer automatisch geblockt",
    ],
    correctIndex: 0,
    explanation:
      "DMARC verlangt im Standardfall, dass MINDESTENS EINER der beiden Mechanismen (SPF oder DKIM) besteht UND mit der sichtbaren Absenderdomain übereinstimmt (Alignment). Da DKIM hier korrekt validiert, reicht das aus - selbst wenn SPF fehlschlägt.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Angreifer registriert eine eigene Domain böse-domain.example und konfiguriert dort SPF und DKIM technisch einwandfrei. Er versendet eine Mail, bei der die SPF-/DKIM-geprüfte Domain böse-domain.example lautet, der sichtbare From-Header aber chef@firma.ch zeigt. firma.ch hat DMARC korrekt konfiguriert. Was passiert?",
    options: [
      "DMARC schlägt trotz gültiger SPF/DKIM-Prüfung fehl, weil die geprüfte Domain (böse-domain.example) nicht mit der sichtbaren Absenderdomain (firma.ch) übereinstimmt (Alignment-Fehler)",
      "Die Mail wird zugestellt, da SPF und DKIM beide technisch bestehen",
      "DMARC prüft nur den sichtbaren From-Header, SPF/DKIM sind dabei irrelevant",
    ],
    correctIndex: 0,
    explanation:
      "SPF und DKIM bestätigen für sich genommen nur eine technische Domain (Envelope-From bzw. das d=-Tag) - nicht den sichtbaren From-Header. Genau deshalb prüft DMARC zusätzlich das Alignment: die geprüfte Domain muss zur sichtbaren Absenderdomain passen. Ohne diese Zusatzprüfung könnte jeder Angreifer mit einer eigenen, sauber konfigurierten Domain trotzdem einen falschen sichtbaren Absender vortäuschen.",
  },
  {
    difficulty: "hard",
    question:
      "Eine Firma aktiviert DMARC direkt mit p=reject, bevor alle legitimen Versandquellen (z.B. ein altes ERP-System, das Rechnungen per Mail verschickt) korrekt per SPF/DKIM eingebunden sind. Was ist die wahrscheinliche Folge?",
    options: [
      "Auch die eigenen legitimen Mails aus dem ERP-System werden abgelehnt/nicht zugestellt, weil sie DMARC nicht bestehen",
      "Das ERP-System wird automatisch von DMARC ausgenommen",
      "Es passiert nichts, DMARC gilt nur für Mails von aussen an die Firma",
    ],
    correctIndex: 0,
    explanation:
      "DMARC unterscheidet nicht zwischen 'bösartig' und 'einfach falsch konfiguriert' - jede Mail, die SPF/DKIM-Alignment nicht besteht, wird gemäss Richtlinie behandelt. Deshalb empfiehlt sich ein schrittweises Vorgehen: erst p=none (nur Berichte sammeln, nichts blocken), dann p=quarantine, erst zuletzt p=reject, sobald alle legitimen Quellen sauber eingebunden sind.",
  },
];

const MAIL_STEPS = [
  {
    label: "SPF",
    parts: ["envelope"],
    text:
      "<strong>SPF prüft ausschliesslich den technischen Envelope-From</strong> (auch Return-Path genannt - die Absenderadresse auf SMTP-Ebene, die kein normaler Nutzer je zu sehen bekommt). Geprüft wird: kommt die Mail von einer Server-IP, die im SPF-Record GENAU DIESER Envelope-Domain als autorisiert gelistet ist? Der sichtbare From-Header, die DKIM-Signatur und der Body spielen für SPF keine Rolle.",
  },
  {
    label: "DKIM",
    parts: ["dkim", "from", "body"],
    text:
      "<strong>DKIM prüft die kryptografische Signatur</strong> im DKIM-Signature-Header. Diese deckt einen Hash des Bodys (<code class=\"mono\">bh=</code>) sowie eine festgelegte Liste an Headern ab (<code class=\"mono\">h=from:subject:date</code> - typischerweise inkl. From). Wurde seit dem Signieren auch nur ein Byte in Body oder den signierten Headern verändert, passt die Signatur nicht mehr zum neu berechneten Wert - unabhängig vom Envelope-From, den SPF prüft.",
  },
  {
    label: "DMARC",
    parts: ["from"],
    text:
      "<strong>DMARC prüft selbst gar keinen Mail-Inhalt direkt</strong>, sondern vergleicht die ERGEBNISSE von SPF und DKIM: stimmt die dabei jeweils geprüfte Domain (Envelope-From bzw. DKIM-<code class=\"mono\">d=</code>-Tag) mit der sichtbaren From-Adresse überein (\"Alignment\")? Erst dieser Abgleich mit dem sichtbaren From-Header schliesst die Lücke, die SPF und DKIM alleine offenlassen würden.",
  },
];

function initInteractiveSteps() {
  const buttons = document.querySelectorAll("#mail-step-buttons .step-btn");
  const parts = document.querySelectorAll("#mail-mockup .mail-part");
  const explanation = document.getElementById("mail-step-explanation");
  if (!buttons.length) return;

  function showStep(stepIdx) {
    const step = MAIL_STEPS[stepIdx];
    buttons.forEach((btn) => btn.classList.toggle("active", Number(btn.dataset.step) === stepIdx));
    parts.forEach((part) => part.classList.toggle("highlight", step.parts.includes(part.dataset.part)));
    explanation.classList.remove("hidden");
    explanation.className = "feedback-box";
    explanation.innerHTML = `<strong>${stepIdx + 1}. ${step.label} prüft:</strong> ${step.text}`;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showStep(Number(btn.dataset.step)));
  });

  showStep(0);
}

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
      item.innerHTML = `<input type="radio" name="mq${qIdx}" /> <span>${opt}</span>`;
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

  if (allCorrect) {
    const wasDone = getModuleStatus(MODULE_ID) === "done";
    setModuleStatus(MODULE_ID, "done", { quizScore: correctCount });
    if (!wasDone) {
      document.getElementById("completion-banner").classList.remove("hidden");
    }
  } else {
    setModuleStatus(MODULE_ID, "progress", { quizScore: correctCount });
  }
}

/* ---------- Mail-Zustellungs-Animation (Umschlag öffnen + SPF/DKIM/DMARC) ---------- */

const MAIL_NODES = {
  sender: { left: "6%", top: "50%" },
  receiver: { left: "42%", top: "50%" },
  inbox: { left: "88%", top: "20%" },
  quarantine: { left: "88%", top: "80%" },
};

const MAIL_SCENARIOS = {
  legit: {
    finalStatus: "Mail zugestellt - alle Prüfungen bestanden.",
    steps: [
      {
        label: "1. SMTP-Versand",
        text: "Absender-Server sendet die Mail via SMTP an den empfangenden Mailserver.",
        from: "sender",
        to: "receiver",
        cls: "pkt-query",
        envelope: "closed",
        detail: [
          { label: "Envelope-From", value: "bounce.mailer@mail.google.com" },
          { label: "Sichtbar (From:)", value: "chef@firma.ch" },
        ],
      },
      {
        label: "2. Umschlag öffnen",
        text: "Empfangender Server öffnet den Umschlag und liest die Kopfzeilen (Header).",
        noMove: true,
        envelope: "open",
        detail: [
          { label: "Envelope-From", value: "bounce.mailer@mail.google.com" },
          { label: "From:-Header", value: "chef@firma.ch" },
          { label: "DKIM-Signature", value: "vorhanden (d=firma.ch; s=mail)" },
        ],
      },
      {
        label: "3. SPF",
        text: "SPF-Prüfung: ist die sendende IP im SPF-Record von firma.ch (via include:_spf.google.com) gelistet?",
        noMove: true,
        envelope: "open",
        checks: [{ label: "SPF", state: "pass" }],
      },
      {
        label: "4. DKIM",
        text: "DKIM-Prüfung: passt die Signatur zum öffentlichen Schlüssel aus dem DNS-Record von firma.ch?",
        noMove: true,
        envelope: "open",
        checks: [
          { label: "SPF", state: "pass" },
          { label: "DKIM", state: "pass" },
        ],
      },
      {
        label: "5. DMARC-Entscheid",
        text: "DMARC-Alignment: SPF-/DKIM-geprüfte Domain passt zum sichtbaren From-Header - die Richtlinie erlaubt die Zustellung.",
        from: "receiver",
        to: "inbox",
        cls: "pkt-final",
        envelope: "open",
        checks: [
          { label: "SPF", state: "pass" },
          { label: "DKIM", state: "pass" },
          { label: "DMARC", state: "pass" },
        ],
        detail: [{ label: "Ergebnis", value: "Zugestellt - alle Prüfungen bestanden" }],
      },
    ],
  },
  phishing: {
    finalStatus: "Mail in Quarantäne verschoben - Spoofing-Versuch erkannt.",
    steps: [
      {
        label: "1. SMTP-Versand",
        text: "Angreifer-Server sendet eine Mail und gibt sich als firma.ch aus.",
        from: "sender",
        to: "receiver",
        cls: "pkt-query",
        envelope: "closed",
        detail: [
          { label: "Envelope-From", value: "irgendwas@angreifer-server.example" },
          { label: "Sichtbar (From:)", value: "chef@firma.ch (gefälscht)" },
        ],
      },
      {
        label: "2. Umschlag öffnen",
        text: "Empfangender Server öffnet den Umschlag und liest die Kopfzeilen (Header).",
        noMove: true,
        envelope: "open",
        detail: [
          { label: "Envelope-From", value: "irgendwas@angreifer-server.example" },
          { label: "From:-Header", value: "chef@firma.ch (gefälscht)" },
          { label: "DKIM-Signature", value: "fehlt" },
        ],
      },
      {
        label: "3. SPF",
        text: "SPF-Prüfung: die sendende IP steht in KEINEM SPF-Record von firma.ch.",
        noMove: true,
        envelope: "open",
        checks: [{ label: "SPF", state: "fail" }],
      },
      {
        label: "4. DKIM",
        text: "DKIM-Prüfung: keine gültige Signatur vorhanden - der Angreifer kennt den privaten Schlüssel von firma.ch nicht.",
        noMove: true,
        envelope: "open",
        checks: [
          { label: "SPF", state: "fail" },
          { label: "DKIM", state: "fail" },
        ],
      },
      {
        label: "5. DMARC-Entscheid",
        text: "DMARC: weder SPF noch DKIM bestehen - laut Richtlinie (p=quarantine) wird die Mail zurückgehalten.",
        from: "receiver",
        to: "quarantine",
        cls: "pkt-danger",
        envelope: "open",
        checks: [
          { label: "SPF", state: "fail" },
          { label: "DKIM", state: "fail" },
          { label: "DMARC", state: "fail" },
        ],
        detail: [{ label: "Ergebnis", value: "Quarantäne - Spoofing-Versuch erkannt" }],
      },
    ],
  },
};

let mailScenarioKey = "legit";
let mailAnimStep = 0;
let mailAnimRunning = false;

function mailAnimSetButtonsDisabled(disabled) {
  document.getElementById("mail-anim-play").disabled = disabled;
  document.getElementById("mail-anim-step").disabled = disabled;
}

function mailAnimRenderStepsList() {
  const steps = MAIL_SCENARIOS[mailScenarioKey].steps;
  document.getElementById("mail-anim-steps").innerHTML = steps
    .map(
      (s, i) =>
        `<li class="proto-anim-step" data-step="${i}"><span class="proto-anim-step-label">${s.label}</span>${s.text}</li>`
    )
    .join("");
}

async function mailAnimPlayStep(index) {
  const step = MAIL_SCENARIOS[mailScenarioKey].steps[index];
  const packet = document.getElementById("mail-packet");
  const status = document.getElementById("mail-anim-status");
  const stepEls = document.querySelectorAll("#mail-anim-steps .proto-anim-step");
  const envelope = document.getElementById("mail-anim-envelope");
  const envelopeLabel = document.getElementById("mail-anim-envelope-label");

  stepEls.forEach((el, i) => el.classList.toggle("active", i === index));

  envelope.classList.toggle("open", step.envelope === "open");
  envelopeLabel.textContent = step.envelope === "open" ? "Umschlag geöffnet" : "Umschlag geschlossen";

  if (step.noMove) {
    packet.classList.add("hidden-packet");
  } else {
    packet.classList.remove("hidden-packet", "pkt-query", "pkt-reply", "pkt-final", "pkt-danger");
    packet.classList.add(step.cls);
    protoAnimJumpTo(packet, MAIL_NODES[step.from]);
    protoAnimMoveTo(packet, MAIL_NODES[step.to]);
  }

  protoAnimRenderChecks(document.getElementById("mail-anim-checks"), step.checks);
  protoAnimRenderDetail(document.getElementById("mail-anim-detail"), step.detail);

  status.textContent = step.text;
  await protoAnimWait(1300);

  stepEls[index].classList.remove("active");
  stepEls[index].classList.add("done");
}

async function mailAnimPlayAll() {
  if (mailAnimRunning) return;
  mailAnimRunning = true;
  mailAnimSetButtonsDisabled(true);
  mailAnimResetVisuals();

  const steps = MAIL_SCENARIOS[mailScenarioKey].steps;
  for (let i = 0; i < steps.length; i++) {
    await mailAnimPlayStep(i);
  }
  mailAnimStep = steps.length;

  document.getElementById("mail-anim-status").textContent =
    `${MAIL_SCENARIOS[mailScenarioKey].finalStatus} Klicke "Zurücksetzen", um es erneut zu sehen.`;
  mailAnimSetButtonsDisabled(false);
  mailAnimRunning = false;
}

async function mailAnimNextStep() {
  const steps = MAIL_SCENARIOS[mailScenarioKey].steps;
  if (mailAnimRunning || mailAnimStep >= steps.length) return;
  mailAnimRunning = true;
  mailAnimSetButtonsDisabled(true);

  await mailAnimPlayStep(mailAnimStep);
  mailAnimStep++;

  if (mailAnimStep >= steps.length) {
    document.getElementById("mail-anim-status").textContent =
      `${MAIL_SCENARIOS[mailScenarioKey].finalStatus} Klicke "Zurücksetzen", um es erneut zu sehen.`;
  }
  mailAnimSetButtonsDisabled(false);
  mailAnimRunning = false;
}

function mailAnimResetVisuals() {
  mailAnimStep = 0;
  const packet = document.getElementById("mail-packet");
  packet.className = "proto-anim-packet2d hidden-packet";
  packet.style.left = MAIL_NODES.sender.left;
  packet.style.top = MAIL_NODES.sender.top;
  document.querySelectorAll("#mail-anim-steps .proto-anim-step").forEach((el) => el.classList.remove("active", "done"));
  document.getElementById("mail-anim-envelope").classList.remove("open");
  document.getElementById("mail-anim-envelope-label").textContent = "Umschlag geschlossen";
  protoAnimRenderDetail(document.getElementById("mail-anim-detail"), null);
  protoAnimRenderChecks(document.getElementById("mail-anim-checks"), null);
}

function mailAnimReset() {
  mailAnimResetVisuals();
  mailAnimRunning = false;
  mailAnimSetButtonsDisabled(false);
  document.getElementById("mail-anim-status").textContent =
    'Bereit - klicke "Abspielen" oder gehe Schritt für Schritt durch.';
}

function mailAnimSetScenario(key) {
  if (key === mailScenarioKey) return;
  mailScenarioKey = key;
  document.querySelectorAll("#mail-scenario-buttons .btn").forEach((btn) => {
    const active = btn.dataset.scenario === key;
    btn.classList.toggle("primary", active);
    btn.classList.toggle("ghost", !active);
  });
  mailAnimRenderStepsList();
  mailAnimReset();
}

function wireMailAnimation() {
  mailAnimRenderStepsList();
  mailAnimReset();
  document.getElementById("mail-anim-play").addEventListener("click", mailAnimPlayAll);
  document.getElementById("mail-anim-step").addEventListener("click", mailAnimNextStep);
  document.getElementById("mail-anim-reset").addEventListener("click", mailAnimReset);
  document.querySelectorAll("#mail-scenario-buttons .btn").forEach((btn) => {
    btn.addEventListener("click", () => mailAnimSetScenario(btn.dataset.scenario));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  wireMailAnimation();
  initInteractiveSteps();
  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
