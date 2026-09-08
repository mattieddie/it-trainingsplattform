/*
 * certificates.js - Modul: Zertifikate & PKI
 * Vertrauenskette, Zertifikatsfelder, Ablauf/Widerruf, sowie SCEP-Verteilung
 * über Intune. Baut auf dem Modul "Verschlüsselung" (asymmetrische
 * Verschlüsselung) auf.
 */

const MODULE_ID = "certificates";

const TERM_PAIRS = [
  { id: "ca", left: "CA", right: "Zertifizierungsstelle - stellt Zertifikate aus und signiert sie" },
  { id: "ra", left: "RA", right: "Registrierungsstelle - prüft die Identität vor der Ausstellung" },
  { id: "va", left: "VA", right: "Validierungsdienst - beantwortet Anfragen zum Zertifikatsstatus" },
  { id: "crl", left: "CRL", right: "Liste vorzeitig widerrufener Zertifikate zum Download" },
  { id: "ocsp", left: "OCSP", right: "Echtzeit-Abfrage, ob ein einzelnes Zertifikat noch gültig ist" },
  { id: "scep", left: "SCEP", right: "Protokoll für automatisierte Zertifikatsanfragen von Geräten" },
  { id: "ndes", left: "NDES", right: "Windows-Serverrolle, die SCEP-Anfragen an die CA weiterleitet" },
];

const QUIZ = [
  {
    difficulty: "easy",
    question: "Welches Grundproblem löst eine PKI (Public Key Infrastructure)?",
    options: [
      "Sie bestätigt vertrauenswürdig, dass ein bestimmter öffentlicher Schlüssel wirklich zu der Identität gehört, die er behauptet - eine Zertifizierungsstelle (CA) bürgt für diese Bindung",
      "Sie ersetzt Verschlüsselung komplett durch schnellere Hash-Verfahren",
      "Sie verhindert, dass Daten überhaupt verschlüsselt werden müssen",
    ],
    correctIndex: 0,
    explanation:
      "Ein Schlüsselpaar allein sagt nichts darüber aus, WEM der öffentliche Schlüssel gehört - genau diese Bindung zwischen Identität und Schlüssel bestätigt eine vertrauenswürdige Zertifizierungsstelle (CA) mit ihrer Signatur.",
  },
  {
    difficulty: "easy",
    question: "Was passiert typischerweise, wenn ein Zertifikat sein Ablaufdatum überschreitet?",
    options: [
      "Verbindungen/Authentifizierungen, die dieses Zertifikat nutzen, schlagen fehl bzw. Browser/Clients zeigen eine Vertrauenswarnung - eine rechtzeitige Erneuerung ist nötig",
      "Das Zertifikat funktioniert unverändert weiter, das Datum ist rein informativ",
      "Der zugehörige private Schlüssel wird automatisch gelöscht",
    ],
    correctIndex: 0,
    explanation:
      "Abgelaufene Zertifikate werden von Clients als ungültig behandelt - klassische Folgen sind Browser-Warnungen, fehlschlagende WLAN-/VPN-Authentifizierung oder abbrechende TLS-Verbindungen, bis ein neues Zertifikat ausgestellt wird.",
  },
  {
    difficulty: "easy",
    question: "Was ist eine Root-CA?",
    options: [
      "Die oberste Zertifizierungsstelle einer Vertrauenskette - ihr Zertifikat ist selbstsigniert und muss vorab (z.B. im Betriebssystem/Browser) als vertrauenswürdig hinterlegt sein",
      "Ein Zertifikat, das nur für die Root-Partition einer Festplatte gilt",
      "Ein Zertifikat, das automatisch nach 24 Stunden abläuft",
    ],
    correctIndex: 0,
    explanation:
      "Die Root-CA steht an der Spitze der Vertrauenskette. Da niemand über ihr steht, signiert sie ihr eigenes Zertifikat selbst - Vertrauen entsteht dadurch, dass Betriebssysteme/Browser eine Liste bekannter, vertrauenswürdiger Root-CAs mitbringen.",
  },
  {
    difficulty: "medium",
    question:
      "Warum kommen bei vielen Zertifikaten Intermediate-CAs zwischen Root-CA und dem eigentlichen Endzertifikat zum Einsatz?",
    options: [
      "Der besonders sensible private Schlüssel der Root-CA soll so selten wie möglich benutzt werden (idealerweise offline gelagert) - Intermediate-CAs übernehmen das tägliche Ausstellen und können bei einem Vorfall isoliert widerrufen werden, ohne die Root-CA zu kompromittieren",
      "Intermediate-CAs sind nur ein Marketing-Begriff ohne technischen Unterschied zur Root-CA",
      "Sie beschleunigen ausschliesslich die Ladezeit von Webseiten",
    ],
    correctIndex: 0,
    explanation:
      "Würde die Root-CA jedes einzelne Endzertifikat direkt signieren, müsste ihr Schlüssel ständig online/aktiv sein - ein ideales Angriffsziel. Intermediate-CAs übernehmen das Tagesgeschäft, sodass die Root-CA meist offline bleiben kann.",
  },
  {
    difficulty: "medium",
    question: "Ein Zertifikat wird vorzeitig widerrufen (z.B. weil der private Schlüssel gestohlen wurde). Worüber erfahren Clients das?",
    options: [
      "Über eine Zertifikatssperrliste (CRL) oder einen Online-Statusabruf (OCSP), die/den der Client bei der Prüfung konsultiert",
      "Automatisch, sobald das Ablaufdatum erreicht ist - vorzeitiger Widerruf ist technisch nicht möglich",
      "Nur per manueller E-Mail-Benachrichtigung an alle betroffenen Nutzer",
    ],
    correctIndex: 0,
    explanation:
      "CRL (eine herunterladbare Sperrliste) und OCSP (eine Echtzeit-Statusabfrage für ein einzelnes Zertifikat) sind die beiden Standardmechanismen, mit denen ein Client prüfen kann, ob ein an sich noch gültiges (nicht abgelaufenes) Zertifikat vorzeitig widerrufen wurde.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet SCEP grundlegend von einer manuellen Zertifikatsanfrage durch einen Administrator?",
    options: [
      "SCEP erlaubt Geräten, automatisiert und ohne manuelles Eingreifen ein Zertifikat bei einer CA anzufordern - entscheidend für die Verwaltung grosser Geräteflotten (z.B. über Intune)",
      "SCEP funktioniert nur für Zertifikate, die niemals ablaufen",
      "SCEP ersetzt die Zertifizierungsstelle vollständig, es wird gar keine CA mehr benötigt",
    ],
    correctIndex: 0,
    explanation:
      "Ohne SCEP müsste ein Admin für jedes einzelne Gerät manuell ein Zertifikat anfordern und installieren - bei hunderten oder tausenden verwalteten Geräten (z.B. via Intune) ist automatisierte Ausstellung per SCEP der einzige praktikable Weg.",
  },
  {
    difficulty: "hard",
    question:
      "In einer Intune-SCEP-Umgebung übernimmt der NDES-Server (Network Device Enrollment Service) eine zentrale Rolle. Was macht er?",
    options: [
      "Er nimmt die SCEP-Anfragen der Geräte entgegen (meist vermittelt über den Intune-NDES-Connector) und leitet sie an die interne Zertifizierungsstelle weiter, die das eigentliche Zertifikat ausstellt",
      "Er ersetzt Intune komplett und übernimmt die gesamte Geräteverwaltung",
      "Er speichert alle privaten Schlüssel aller verwalteten Geräte zentral auf einem einzigen Server",
    ],
    correctIndex: 0,
    explanation:
      "NDES ist die Brücke zwischen der Cloud (Intune) und der On-Premises-Zertifizierungsstelle (Active Directory Certificate Services): er nimmt SCEP-Anfragen entgegen und reicht sie an die CA zur eigentlichen Ausstellung weiter.",
  },
  {
    difficulty: "hard",
    question:
      "Warum wird bei einer SCEP-Verteilung über Intune fast immer zusätzlich ein \"Trusted Root Certificate\"-Profil an dieselben Geräte verteilt?",
    options: [
      "Das Gerät muss dem Root-CA-Zertifikat der ausstellenden internen CA vertrauen, bevor es dem per SCEP erhaltenen Zertifikat selbst vertrauen kann - ohne das Root-Profil bleibt das neue Zertifikat für viele Zwecke (z.B. WLAN-Authentifizierung) nutzlos",
      "Das Root-Zertifikat ist rein optional und dient nur der Dokumentation",
      "Trusted-Root-Profile werden nur für Zertifikate von öffentlichen (nicht internen) CAs benötigt",
    ],
    correctIndex: 0,
    explanation:
      "Ein Gerät, das die interne CA noch nicht kennt, kann das per SCEP erhaltene Zertifikat nicht sinnvoll validieren - das separate Trusted-Root-Profil sorgt dafür, dass die gesamte Vertrauenskette bis zur Root-CA auf dem Gerät bekannt ist.",
  },
  {
    difficulty: "hard",
    question:
      "Warum ist zertifikatsbasierte Authentifizierung (z.B. für WLAN/VPN via SCEP-Zertifikat) sicherheitstechnisch oft einer reinen Passwort-Authentifizierung vorzuziehen?",
    options: [
      "Ein Zertifikat mit privatem Schlüssel lässt sich nicht wie ein Passwort erraten, phishen oder abhören, ist an das jeweilige Gerät gebunden und lässt sich bei Bedarf gezielt für nur dieses eine Gerät widerrufen",
      "Zertifikate sind grundsätzlich unsichtbar für Angreifer und können deshalb nie kompromittiert werden",
      "Zertifikatsbasierte Authentifizierung benötigt keinerlei zentrale Verwaltung mehr",
    ],
    correctIndex: 0,
    explanation:
      "Passwörter können erraten, wiederverwendet oder gephisht werden. Ein gerätegebundenes Zertifikat mit privatem Schlüssel bietet dagegen einen kryptografischen Nachweis, der sich nicht einfach abtippen oder erraten lässt - und lässt sich pro Gerät gezielt widerrufen.",
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
      item.innerHTML = `<input type="radio" name="pkiq${qIdx}" /> <span>${opt}</span>`;
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

/* ---------- TLS-Handshake-Animation ---------- */

const TLS_NODES = {
  client: { left: "10%", top: "50%" },
  server: { left: "88%", top: "50%" },
};

const TLS_ANIM_STEPS = [
  {
    text: "Client Hello: Browser schlägt eine TLS-Version und unterstützte Cipher Suites vor.",
    from: "client",
    to: "server",
    cls: "pkt-query",
    detail: [
      { label: "TLS-Version", value: "TLS 1.3 (vorgeschlagen)" },
      { label: "Cipher Suites", value: "TLS_AES_128_GCM_SHA256, TLS_CHACHA20_POLY1305_SHA256, ..." },
      { label: "Client-Random", value: "4f3a9c7e..." },
    ],
  },
  {
    text: "Server Hello + Zertifikat: Server wählt eine Cipher Suite und schickt sein Zertifikat (inkl. öffentlichem Schlüssel) mit.",
    from: "server",
    to: "client",
    cls: "pkt-reply",
    detail: [
      { label: "Gewählte Suite", value: "TLS_AES_128_GCM_SHA256" },
      { label: "Zertifikat", value: "CN=shop.beispiel.ch, Issuer=Beispiel Intermediate CA" },
      { label: "Server-Random", value: "9b21ffa0..." },
    ],
  },
  {
    text: 'Browser prüft das Zertifikat, BEVOR er dem Server vertraut - siehe Kapitel "Vertrauenskette" oben.',
    checksOnly: true,
    checks: [
      { label: "Kette zu vertrauenswürdiger Root-CA", state: "pass" },
      { label: "Innerhalb Gültigkeitszeitraum", state: "pass" },
      { label: "Hostname passt zum Zertifikat", state: "pass" },
      { label: "Nicht widerrufen (OCSP)", state: "pass" },
    ],
  },
  {
    text: "Client Key Exchange: Browser erzeugt ein Pre-Master-Secret und verschlüsselt es mit dem öffentlichen Schlüssel aus dem Zertifikat.",
    from: "client",
    to: "server",
    cls: "pkt-query",
    detail: [{ label: "Inhalt", value: "Pre-Master-Secret, verschlüsselt mit dem öffentlichen Schlüssel des Servers" }],
  },
  {
    text: 'Beide Seiten berechnen daraus denselben Sitzungsschlüssel und tauschen verschlüsselte "Finished"-Nachrichten aus - die Verbindung ist gesichert.',
    from: "client",
    to: "server",
    cls: "pkt-final",
    detail: [
      { label: "Sitzungsschlüssel", value: "unabhängig auf beiden Seiten berechnet (identisch)" },
      { label: "Status", value: "Ab jetzt: verschlüsselte HTTPS-Anwendungsdaten" },
    ],
  },
];

let tlsAnimStep = 0;
let tlsAnimRunning = false;

function tlsAnimSetButtonsDisabled(disabled) {
  document.getElementById("tls-anim-play").disabled = disabled;
  document.getElementById("tls-anim-step").disabled = disabled;
}

async function tlsAnimPlayStep(index) {
  const step = TLS_ANIM_STEPS[index];
  const packet = document.getElementById("tls-packet");
  const status = document.getElementById("tls-anim-status");
  const stepEls = document.querySelectorAll("#tls-anim-steps .proto-anim-step");

  stepEls.forEach((el, i) => el.classList.toggle("active", i === index));

  if (step.checksOnly) {
    packet.classList.add("hidden-packet");
    protoAnimRenderChecks(document.getElementById("tls-anim-checks"), step.checks);
    protoAnimRenderDetail(document.getElementById("tls-anim-detail"), null);
  } else {
    packet.classList.remove("hidden-packet", "pkt-query", "pkt-reply", "pkt-final");
    packet.classList.add(step.cls);
    protoAnimJumpTo(packet, TLS_NODES[step.from]);
    protoAnimMoveTo(packet, TLS_NODES[step.to]);
    protoAnimRenderDetail(document.getElementById("tls-anim-detail"), step.detail);
  }

  status.textContent = step.text;
  await protoAnimWait(1200);

  stepEls[index].classList.remove("active");
  stepEls[index].classList.add("done");
}

async function tlsAnimPlayAll() {
  if (tlsAnimRunning) return;
  tlsAnimRunning = true;
  tlsAnimSetButtonsDisabled(true);
  tlsAnimResetVisuals();

  for (let i = 0; i < TLS_ANIM_STEPS.length; i++) {
    await tlsAnimPlayStep(i);
  }
  tlsAnimStep = TLS_ANIM_STEPS.length;

  document.getElementById("tls-anim-status").textContent =
    'Der TLS-Handshake ist abgeschlossen - alle weiteren Daten werden verschlüsselt übertragen. Klicke "Zurücksetzen", um es erneut zu sehen.';
  tlsAnimSetButtonsDisabled(false);
  tlsAnimRunning = false;
}

async function tlsAnimNextStep() {
  if (tlsAnimRunning || tlsAnimStep >= TLS_ANIM_STEPS.length) return;
  tlsAnimRunning = true;
  tlsAnimSetButtonsDisabled(true);

  await tlsAnimPlayStep(tlsAnimStep);
  tlsAnimStep++;

  if (tlsAnimStep >= TLS_ANIM_STEPS.length) {
    document.getElementById("tls-anim-status").textContent =
      'Der TLS-Handshake ist abgeschlossen - alle weiteren Daten werden verschlüsselt übertragen. Klicke "Zurücksetzen", um es erneut zu sehen.';
  }
  tlsAnimSetButtonsDisabled(false);
  tlsAnimRunning = false;
}

function tlsAnimResetVisuals() {
  tlsAnimStep = 0;
  const packet = document.getElementById("tls-packet");
  packet.className = "proto-anim-packet2d hidden-packet";
  packet.style.left = TLS_NODES.client.left;
  packet.style.top = TLS_NODES.client.top;
  document.querySelectorAll("#tls-anim-steps .proto-anim-step").forEach((el) => el.classList.remove("active", "done"));
  protoAnimRenderDetail(document.getElementById("tls-anim-detail"), null);
  protoAnimRenderChecks(document.getElementById("tls-anim-checks"), null);
}

function tlsAnimReset() {
  tlsAnimResetVisuals();
  tlsAnimRunning = false;
  tlsAnimSetButtonsDisabled(false);
  document.getElementById("tls-anim-status").textContent =
    'Bereit - klicke "Abspielen" oder gehe Schritt für Schritt durch.';
}

function wireTlsAnimation() {
  tlsAnimReset();
  document.getElementById("tls-anim-play").addEventListener("click", tlsAnimPlayAll);
  document.getElementById("tls-anim-step").addEventListener("click", tlsAnimNextStep);
  document.getElementById("tls-anim-reset").addEventListener("click", tlsAnimReset);
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  wireTlsAnimation();

  initMatchPuzzle(document.getElementById("term-match-container"), TERM_PAIRS, (matched, total) => {
    document.getElementById("term-match-progress").textContent = `${matched} / ${total} Paare gefunden`;
  });

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
