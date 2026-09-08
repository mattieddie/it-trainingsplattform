/*
 * dns-dhcp-basics.js - Modul: DNS-Auflösung & DHCP-Prozess im Detail
 * Ergänzt die Module "DNS & Domain-Konzepte" (Records/Konfiguration) und
 * "DHCP/DNS-Troubleshooting" (Tickets) um die zugrundeliegende
 * Protokoll-Mechanik: wie der DHCP-Lease-Prozess und die rekursive
 * DNS-Auflösung tatsächlich Schritt für Schritt ablaufen.
 */

const MODULE_ID = "dnsdhcpdetail";

const QUIZ = [
  {
    difficulty: "easy",
    question: "In welcher Reihenfolge laufen die vier klassischen DHCP-Nachrichten ab?",
    options: [
      "Discover → Offer → Request → Acknowledge (DORA)",
      "Offer → Discover → Acknowledge → Request",
      "Request → Discover → Offer → Acknowledge",
    ],
    correctIndex: 0,
    explanation:
      "DORA ist die gängige Eselsbrücke: der Client entdeckt (Discover) verfügbare Server, diese bieten an (Offer), der Client fordert ein Angebot an (Request), der Server bestätigt (Acknowledge).",
  },
  {
    difficulty: "easy",
    question:
      "Warum wird die erste DHCP-Discover-Nachricht als Broadcast (nicht gezielt an einen bestimmten Server) verschickt?",
    options: [
      "Der Client kennt zu diesem Zeitpunkt noch gar keine IP-Adresse (auch nicht die des DHCP-Servers) - ein Broadcast erreicht alle Geräte im Netzsegment, unabhängig von deren Adresse",
      "Broadcast ist bei DHCP grundsätzlich schneller als eine gezielte Anfrage",
      "DHCP-Server akzeptieren grundsätzlich keine gezielten Anfragen",
    ],
    correctIndex: 0,
    explanation:
      "Zu Beginn hat der Client noch keinerlei IP-Konfiguration - er kann also niemanden gezielt adressieren. Ein Broadcast ins gesamte lokale Netzsegment ist der einzige Weg, überhaupt einen DHCP-Server zu erreichen.",
  },
  {
    difficulty: "easy",
    question: "Was liefert ein rekursiver DNS-Resolver dem anfragenden Client am Ende zurück?",
    options: [
      "Die endgültig aufgelöste IP-Adresse - der Client selbst muss keine der Zwischen-Anfragen an Root-/TLD-/autoritative Server stellen",
      "Nur die Adresse des zuständigen Root-Nameservers",
      "Eine vollständige Liste aller weltweiten DNS-Server",
    ],
    correctIndex: 0,
    explanation:
      "Genau das ist der Sinn eines rekursiven Resolvers: er übernimmt die komplette Kette von Zwischenanfragen für den Client und liefert am Ende nur das fertige Ergebnis zurück.",
  },
  {
    difficulty: "medium",
    question:
      "Warum sendet der Client bei DHCP auch die DHCPREQUEST-Nachricht als Broadcast, obwohl er bereits weiss, welchen Server er ausgewählt hat?",
    options: [
      "Damit auch die NICHT gewählten DHCP-Server mitbekommen, dass ihr Angebot nicht angenommen wurde, und die dafür reservierte IP-Adresse wieder freigeben können",
      "Weil Unicast-Nachrichten bei DHCP technisch grundsätzlich nicht unterstützt werden",
      "Damit alle Server im Netz automatisch zusätzlich dieselbe IP-Adresse reservieren",
    ],
    correctIndex: 0,
    explanation:
      "Ohne diesen Broadcast würden nicht gewählte Server ihre angebotene Adresse weiter reserviert halten, obwohl sie nie vergeben wird - der Broadcast informiert alle beteiligten Server gleichzeitig über die Entscheidung.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Client führt \"ipconfig /release\" gefolgt von \"ipconfig /renew\" aus. Was passiert dabei aus DHCP-Sicht?",
    options: [
      "/release sendet ein DHCPRELEASE (gibt die aktuelle Adresse vorzeitig zurück), /renew startet den DORA-Prozess erneut für eine (ggf. neue) Adresse",
      "Beide Befehle bewirken exakt dasselbe, nur mit unterschiedlichem Namen",
      "/release löscht dauerhaft die Konfiguration des DHCP-Servers",
    ],
    correctIndex: 0,
    explanation:
      "/release beendet den aktuellen Lease vorzeitig (DHCPRELEASE), /renew fordert danach über einen neuen DORA-Durchlauf eine Adresse an - das ist der klassische erste Trick bei IP-Konfigurationsproblemen.",
  },
  {
    difficulty: "medium",
    question:
      "Beim rekursiven Auflösen von shop.beispiel.ch fragt der Resolver zuerst einen Root-Nameserver. Was antwortet dieser typischerweise?",
    options: [
      "Er kennt shop.beispiel.ch nicht direkt, verweist den Resolver aber auf den zuständigen TLD-Nameserver (hier: für .ch)",
      "Er liefert direkt die fertige IP-Adresse von shop.beispiel.ch",
      "Er lehnt die Anfrage grundsätzlich ab - Root-Server beantworten keine Anfragen",
    ],
    correctIndex: 0,
    explanation:
      "Root-Nameserver kennen keine einzelnen Domains - sie wissen nur, welcher TLD-Nameserver (z.B. für .ch, .com, .de) als Nächstes zuständig ist, und verweisen dorthin weiter.",
  },
  {
    difficulty: "hard",
    question:
      "Ein DNS-Resolver hat die IP von shop.beispiel.ch im Cache, die TTL ist aber gerade abgelaufen. Was passiert bei der nächsten Anfrage?",
    options: [
      "Der Resolver verwirft den abgelaufenen Eintrag und startet die rekursive Auflösung (ggf. wieder über Root/TLD/autoritativ) erneut",
      "Er liefert trotzdem den alten, zwischengespeicherten Wert weiter - TTL hat nur informativen Charakter",
      "Die Anfrage schlägt automatisch fehl, bis der Cache manuell geleert wird",
    ],
    correctIndex: 0,
    explanation:
      "Die TTL ist die verbindliche Kennzahl, wie lange ein Resolver einen Eintrag verwenden darf. Nach Ablauf muss er neu nachfragen, statt den möglicherweise veralteten Wert weiter auszuliefern.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Netzwerk hat zwei DHCP-Server für Redundanz. Ein Client bekommt trotzdem nur von EINEM der beiden tatsächlich eine Adresse zugewiesen, obwohl beide ein Angebot gemacht haben. Warum?",
    options: [
      "Der Client wählt eines der Angebote aus (meist das zuerst eingetroffene) und bestätigt nur dieses per Request - DHCP ist so konzipiert, dass am Ende immer nur eine einzige Adresse pro Client vergeben wird",
      "Beide Server vergeben ihm automatisch dieselbe Adresse doppelt",
      "Der Client bekommt zwangsläufig zwei unterschiedliche IP-Adressen gleichzeitig zugewiesen",
    ],
    correctIndex: 0,
    explanation:
      "Der DORA-Ablauf ist genau dafür gemacht: mehrere Server dürfen anbieten, aber der Client entscheidet sich für genau eines - Redundanz sorgt hier nur dafür, dass überhaupt ein Angebot ankommt, falls ein Server ausfällt.",
  },
  {
    difficulty: "hard",
    question:
      "Warum kann eine DNS-Änderung bei verschiedenen Nutzern weltweit unterschiedlich schnell ankommen (Propagation), obwohl der Eintrag beim autoritativen Server längst aktualisiert ist?",
    options: [
      "Verschiedene rekursive Resolver haben den alten Wert unterschiedlich lange im Cache (abhängig von der TTL zum Zeitpunkt ihrer letzten Abfrage) und liefern ihn bis zum Ablauf weiter aus",
      "DNS-Änderungen werden grundsätzlich weltweit sofort synchron verteilt - Propagation tritt nur bei Fehlkonfiguration auf",
      "Jeder einzelne Nutzer muss die Änderung manuell in seinem Browser bestätigen",
    ],
    correctIndex: 0,
    explanation:
      "Jeder Resolver cacht unabhängig und bis zu seiner eigenen TTL - je nachdem, wann er zuletzt gefragt hat, läuft sein Cache zu einem anderen Zeitpunkt ab. Genau das erzeugt den schrittweisen \"Propagations\"-Effekt.",
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
      item.innerHTML = `<input type="radio" name="ddq${qIdx}" /> <span>${opt}</span>`;
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

/* ---------- DHCP-DORA-Animation ---------- */

const DHCP_NODES = {
  client: { left: "8%", top: "50%" },
  server1: { left: "88%", top: "18%" },
  server2: { left: "88%", top: "82%" },
};

const DHCP_ANIM_STEPS = [
  {
    text: 'Client sendet DHCPDISCOVER als Broadcast: "Ist irgendwo ein DHCP-Server da?"',
    packets: [
      { id: "dhcp-packet-1", from: "client", to: "server1", cls: "pkt-broadcast" },
      { id: "dhcp-packet-2", from: "client", to: "server2", cls: "pkt-broadcast" },
    ],
    detail: [
      { label: "Typ", value: "DHCPDISCOVER" },
      { label: "Von → An", value: "0.0.0.0 → 255.255.255.255 (Broadcast)" },
      { label: "Inhalt", value: "Client-MAC AA:BB:CC:11:22:33, noch keine IP - sucht DHCP-Server" },
    ],
  },
  {
    text: "Beide erreichten Server antworten mit DHCPOFFER: je eine freie IP-Adresse samt Konfiguration.",
    packets: [
      { id: "dhcp-packet-1", from: "server1", to: "client", cls: "pkt-reply" },
      { id: "dhcp-packet-2", from: "server2", to: "client", cls: "pkt-reply" },
    ],
    detail: [
      { label: "Typ", value: "DHCPOFFER" },
      { label: "Server 1 bietet", value: "192.168.1.50, /24, Gateway .1, Lease 24h" },
      { label: "Server 2 bietet", value: "192.168.1.80, /24, Gateway .1, Lease 24h" },
    ],
  },
  {
    text: "Client wählt Server 1 und sendet DHCPREQUEST als Broadcast - so sehen auch nicht gewählte Server die Entscheidung.",
    packets: [
      { id: "dhcp-packet-1", from: "client", to: "server1", cls: "pkt-broadcast" },
      { id: "dhcp-packet-2", from: "client", to: "server2", cls: "pkt-broadcast" },
    ],
    detail: [
      { label: "Typ", value: "DHCPREQUEST" },
      { label: "Von → An", value: "0.0.0.0 → 255.255.255.255 (Broadcast)" },
      { label: "Inhalt", value: '"Ich nehme das Angebot von Server 1: 192.168.1.50"' },
    ],
  },
  {
    text: "Server 1 bestätigt mit DHCPACK - die Adresse ist vergeben. Server 2 gibt sein reserviertes Angebot wieder frei.",
    packets: [{ id: "dhcp-packet-1", from: "server1", to: "client", cls: "pkt-final" }],
    inactiveNode: "dhcp-node-server2",
    detail: [
      { label: "Typ", value: "DHCPACK" },
      { label: "Von → An", value: "Server 1 → Client" },
      { label: "Inhalt", value: "IP 192.168.1.50/24, Gateway 192.168.1.1, DNS 192.168.1.1, Lease 24h" },
    ],
  },
];

let dhcpAnimStep = 0;
let dhcpAnimRunning = false;

function dhcpAnimSetButtonsDisabled(disabled) {
  document.getElementById("dhcp-anim-play").disabled = disabled;
  document.getElementById("dhcp-anim-step").disabled = disabled;
}

async function dhcpAnimPlayStep(index) {
  const step = DHCP_ANIM_STEPS[index];
  const status = document.getElementById("dhcp-anim-status");
  const stepEls = document.querySelectorAll("#dhcp-anim-steps .proto-anim-step");
  const allPacketIds = ["dhcp-packet-1", "dhcp-packet-2"];

  stepEls.forEach((el, i) => el.classList.toggle("active", i === index));

  document.querySelectorAll("#dhcp-anim-track .proto-anim-node2d").forEach((el) => el.classList.remove("inactive"));
  if (step.inactiveNode) {
    document.getElementById(step.inactiveNode).classList.add("inactive");
  }

  const activePacketIds = step.packets.map((p) => p.id);
  allPacketIds.forEach((id) => {
    if (!activePacketIds.includes(id)) {
      document.getElementById(id).classList.add("hidden-packet");
    }
  });

  step.packets.forEach((p) => {
    const el = document.getElementById(p.id);
    el.classList.remove("hidden-packet", "pkt-query", "pkt-reply", "pkt-final", "pkt-broadcast");
    el.classList.add(p.cls);
    protoAnimJumpTo(el, DHCP_NODES[p.from]);
    protoAnimMoveTo(el, DHCP_NODES[p.to]);
  });

  status.textContent = step.text;
  protoAnimRenderDetail(document.getElementById("dhcp-anim-detail"), step.detail);
  await protoAnimWait(1200);

  stepEls[index].classList.remove("active");
  stepEls[index].classList.add("done");
}

async function dhcpAnimPlayAll() {
  if (dhcpAnimRunning) return;
  dhcpAnimRunning = true;
  dhcpAnimSetButtonsDisabled(true);
  dhcpAnimResetVisuals();

  for (let i = 0; i < DHCP_ANIM_STEPS.length; i++) {
    await dhcpAnimPlayStep(i);
  }
  dhcpAnimStep = DHCP_ANIM_STEPS.length;

  document.getElementById("dhcp-anim-status").textContent =
    'Client ist vollständig konfiguriert (IP, Subnetzmaske, Gateway, DNS). Klicke "Zurücksetzen", um es erneut zu sehen.';
  dhcpAnimSetButtonsDisabled(false);
  dhcpAnimRunning = false;
}

async function dhcpAnimNextStep() {
  if (dhcpAnimRunning || dhcpAnimStep >= DHCP_ANIM_STEPS.length) return;
  dhcpAnimRunning = true;
  dhcpAnimSetButtonsDisabled(true);

  await dhcpAnimPlayStep(dhcpAnimStep);
  dhcpAnimStep++;

  if (dhcpAnimStep >= DHCP_ANIM_STEPS.length) {
    document.getElementById("dhcp-anim-status").textContent =
      'Client ist vollständig konfiguriert (IP, Subnetzmaske, Gateway, DNS). Klicke "Zurücksetzen", um es erneut zu sehen.';
  }
  dhcpAnimSetButtonsDisabled(false);
  dhcpAnimRunning = false;
}

function dhcpAnimResetVisuals() {
  dhcpAnimStep = 0;
  ["dhcp-packet-1", "dhcp-packet-2"].forEach((id) => {
    const el = document.getElementById(id);
    el.className = "proto-anim-packet2d hidden-packet";
    el.style.left = DHCP_NODES.client.left;
    el.style.top = DHCP_NODES.client.top;
  });
  document.querySelectorAll("#dhcp-anim-track .proto-anim-node2d").forEach((el) => el.classList.remove("inactive"));
  document.querySelectorAll("#dhcp-anim-steps .proto-anim-step").forEach((el) => el.classList.remove("active", "done"));
  protoAnimRenderDetail(document.getElementById("dhcp-anim-detail"), null);
}

function dhcpAnimReset() {
  dhcpAnimResetVisuals();
  dhcpAnimRunning = false;
  dhcpAnimSetButtonsDisabled(false);
  document.getElementById("dhcp-anim-status").textContent =
    'Bereit - klicke "Abspielen" oder gehe Schritt für Schritt durch.';
}

function wireDhcpAnimation() {
  dhcpAnimReset();
  document.getElementById("dhcp-anim-play").addEventListener("click", dhcpAnimPlayAll);
  document.getElementById("dhcp-anim-step").addEventListener("click", dhcpAnimNextStep);
  document.getElementById("dhcp-anim-reset").addEventListener("click", dhcpAnimReset);
}

/* ---------- DNS-Rekursionsanimation ---------- */

const DNS_NODES = {
  client: { left: "6%", top: "50%" },
  resolver: { left: "34%", top: "50%" },
  root: { left: "90%", top: "12%" },
  tld: { left: "90%", top: "50%" },
  auth: { left: "90%", top: "88%" },
};

const DNS_ANIM_STEPS = [
  {
    from: "client",
    to: "resolver",
    cls: "pkt-query",
    text: 'Client fragt seinen Resolver: "Wie lautet die IP von shop.beispiel.ch?"',
    detail: [
      { label: "Typ", value: "DNS-Query" },
      { label: "Frage", value: "shop.beispiel.ch, Typ A" },
    ],
  },
  {
    from: "resolver",
    to: "root",
    cls: "pkt-query",
    text: "Nichts im Cache - Resolver fragt einen Root-Nameserver.",
    detail: [
      { label: "Typ", value: "DNS-Query" },
      { label: "Frage", value: "shop.beispiel.ch, Typ A" },
    ],
  },
  {
    from: "root",
    to: "resolver",
    cls: "pkt-reply",
    text: 'Root-Server kennt die Domain nicht, verweist aber: "Frag den zuständigen .ch-TLD-Server."',
    detail: [
      { label: "Typ", value: "Referral (NS-Record)" },
      { label: "Antwort", value: "Zuständig: .ch-TLD-Server (keine direkte Antwort)" },
    ],
  },
  {
    from: "resolver",
    to: "tld",
    cls: "pkt-query",
    text: "Resolver fragt den .ch-TLD-Server.",
    detail: [
      { label: "Typ", value: "DNS-Query" },
      { label: "Frage", value: "shop.beispiel.ch, Typ A" },
    ],
  },
  {
    from: "tld",
    to: "resolver",
    cls: "pkt-reply",
    text: 'TLD-Server verweist weiter: "Frag den autoritativen Nameserver von beispiel.ch."',
    detail: [
      { label: "Typ", value: "Referral (NS-Record)" },
      { label: "Antwort", value: "Zuständig: ns1.beispiel.ch (autoritativer Server)" },
    ],
  },
  {
    from: "resolver",
    to: "auth",
    cls: "pkt-query",
    text: "Resolver fragt den autoritativen Nameserver direkt.",
    detail: [
      { label: "Typ", value: "DNS-Query" },
      { label: "Frage", value: "shop.beispiel.ch, Typ A" },
    ],
  },
  {
    from: "auth",
    to: "resolver",
    cls: "pkt-final",
    text: "Autoritativer Server kennt die Antwort: die IP-Adresse von shop.beispiel.ch.",
    detail: [
      { label: "Typ", value: "DNS-Antwort (A-Record)" },
      { label: "Antwort", value: "shop.beispiel.ch = 91.198.22.4, TTL 3600s" },
    ],
  },
  {
    from: "resolver",
    to: "client",
    cls: "pkt-final",
    text: "Resolver cacht das Ergebnis (für die Dauer der TTL) und gibt die Antwort an den Client zurück.",
    detail: [
      { label: "Typ", value: "DNS-Antwort (A-Record)" },
      { label: "Antwort", value: "shop.beispiel.ch = 91.198.22.4, TTL 3600s (jetzt im Resolver-Cache)" },
    ],
  },
];

let dnsAnimStep = 0;
let dnsAnimRunning = false;

function dnsAnimSetButtonsDisabled(disabled) {
  document.getElementById("dns-anim-play").disabled = disabled;
  document.getElementById("dns-anim-step").disabled = disabled;
}

async function dnsAnimPlayStep(index) {
  const step = DNS_ANIM_STEPS[index];
  const packet = document.getElementById("dns-packet");
  const status = document.getElementById("dns-anim-status");
  const stepEls = document.querySelectorAll("#dns-anim-steps .proto-anim-step");

  stepEls.forEach((el, i) => el.classList.toggle("active", i === index));

  packet.classList.remove("hidden-packet", "pkt-query", "pkt-reply", "pkt-final");
  packet.classList.add(step.cls);
  protoAnimJumpTo(packet, DNS_NODES[step.from]);
  protoAnimMoveTo(packet, DNS_NODES[step.to]);

  status.textContent = step.text;
  protoAnimRenderDetail(document.getElementById("dns-anim-detail"), step.detail);
  await protoAnimWait(950);

  stepEls[index].classList.remove("active");
  stepEls[index].classList.add("done");
}

async function dnsAnimPlayAll() {
  if (dnsAnimRunning) return;
  dnsAnimRunning = true;
  dnsAnimSetButtonsDisabled(true);
  dnsAnimResetVisuals();

  for (let i = 0; i < DNS_ANIM_STEPS.length; i++) {
    await dnsAnimPlayStep(i);
  }
  dnsAnimStep = DNS_ANIM_STEPS.length;

  document.getElementById("dns-anim-status").textContent =
    'Client hat die IP-Adresse - der Resolver hat sie zusätzlich für spätere Anfragen zwischengespeichert. Klicke "Zurücksetzen", um es erneut zu sehen.';
  dnsAnimSetButtonsDisabled(false);
  dnsAnimRunning = false;
}

async function dnsAnimNextStep() {
  if (dnsAnimRunning || dnsAnimStep >= DNS_ANIM_STEPS.length) return;
  dnsAnimRunning = true;
  dnsAnimSetButtonsDisabled(true);

  await dnsAnimPlayStep(dnsAnimStep);
  dnsAnimStep++;

  if (dnsAnimStep >= DNS_ANIM_STEPS.length) {
    document.getElementById("dns-anim-status").textContent =
      'Client hat die IP-Adresse - der Resolver hat sie zusätzlich für spätere Anfragen zwischengespeichert. Klicke "Zurücksetzen", um es erneut zu sehen.';
  }
  dnsAnimSetButtonsDisabled(false);
  dnsAnimRunning = false;
}

function dnsAnimResetVisuals() {
  dnsAnimStep = 0;
  const packet = document.getElementById("dns-packet");
  packet.className = "proto-anim-packet2d hidden-packet";
  packet.style.left = DNS_NODES.client.left;
  packet.style.top = DNS_NODES.client.top;
  document.querySelectorAll("#dns-anim-steps .proto-anim-step").forEach((el) => el.classList.remove("active", "done"));
  protoAnimRenderDetail(document.getElementById("dns-anim-detail"), null);
}

function dnsAnimReset() {
  dnsAnimResetVisuals();
  dnsAnimRunning = false;
  dnsAnimSetButtonsDisabled(false);
  document.getElementById("dns-anim-status").textContent =
    'Bereit - klicke "Abspielen" oder gehe Schritt für Schritt durch.';
}

function wireDnsAnimation() {
  dnsAnimReset();
  document.getElementById("dns-anim-play").addEventListener("click", dnsAnimPlayAll);
  document.getElementById("dns-anim-step").addEventListener("click", dnsAnimNextStep);
  document.getElementById("dns-anim-reset").addEventListener("click", dnsAnimReset);
}

const DORA_STEPS = [
  { id: "d", label: "Discover - Client sucht per Broadcast nach DHCP-Servern" },
  { id: "o", label: "Offer - Server bieten je eine IP-Adresse + Konfiguration an" },
  { id: "r", label: "Request - Client fordert per Broadcast ein Angebot verbindlich an" },
  { id: "a", label: "Acknowledge - gewählter Server bestätigt, Lease beginnt" },
];

const RECORD_PAIRS = [
  { id: "a", left: "A", right: "IPv4-Adresse einer Domain" },
  { id: "aaaa", left: "AAAA", right: "IPv6-Adresse einer Domain" },
  { id: "cname", left: "CNAME", right: "Verweis auf einen anderen Domainnamen" },
  { id: "mx", left: "MX", right: "Zuständiger Mailserver" },
  { id: "ptr", left: "PTR", right: "Reverse-DNS: IP → Domainname" },
  { id: "ns", left: "NS", right: "Zuständiger Nameserver einer Domain" },
  { id: "soa", left: "SOA", right: "Administrative Zonen-Basisdaten" },
  { id: "txt", left: "TXT", right: "Freier Text, z.B. für SPF/DKIM" },
];

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);

  wireDhcpAnimation();
  wireDnsAnimation();

  const doraPuzzle = initReorderPuzzle(document.getElementById("dora-reorder-container"), DORA_STEPS);
  document.getElementById("check-dora-order-btn").addEventListener("click", () => {
    const allCorrect = doraPuzzle.check();
    const fb = document.getElementById("dora-order-feedback");
    fb.classList.remove("hidden");
    fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
    fb.innerHTML = allCorrect
      ? "Richtig! Discover → Offer → Request → Acknowledge."
      : "Noch nicht ganz - grün markierte Karten stehen an der richtigen Stelle, rot markierte nicht.";
  });
  document.getElementById("reset-dora-order-btn").addEventListener("click", () => {
    doraPuzzle.reset();
    document.getElementById("dora-order-feedback").classList.add("hidden");
  });

  initMatchPuzzle(document.getElementById("record-match-container"), RECORD_PAIRS, (matched, total) => {
    document.getElementById("record-match-progress").textContent = `${matched} / ${total} Paare gefunden`;
  });
});
