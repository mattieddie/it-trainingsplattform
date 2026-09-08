/*
 * network-devices.js - Modul: Netzwerkgeräte & Routing
 * Teil 1: Quiz zu den Unterschieden Hub/Switch/Router.
 * Teil 2: generierte Routing-Tabellen-Aufgaben (Longest-Prefix-Match).
 */

const MODULE_ID = "networkdevices";
const GOAL_CORRECT = 8;

/* ================= Teil 1: Geräte-Quiz ================= */

const QUIZ = [
  {
    difficulty: "easy",
    question:
      "Welches Gerät leitet ankommende Daten ungefiltert an ALLE anderen Ports weiter (Schicht 1)?",
    options: [
      "Ein Hub - er versteht keine Adressen und verstärkt/verteilt das Signal blind an alle Ports",
      "Ein Switch - er lernt MAC-Adressen und leitet gezielt nur an den richtigen Port weiter",
      "Ein Router - er trifft Weiterleitungsentscheidungen anhand der Ziel-IP-Adresse",
      "Ein Access Point - er verbindet WLAN-Geräte mit dem restlichen Netzwerk",
    ],
    correctIndex: 0,
    explanation:
      "Ein Hub versteht nichts von Adressen - er verstärkt das Signal nur elektrisch und schickt es blind an alle anderen Ports. Alle angeschlossenen Geräte teilen sich dieselbe Kollisionsdomäne.",
  },
  {
    difficulty: "easy",
    question: "Welches Gerät verbindet unterschiedliche Netzwerke/Subnetze anhand von IP-Adressen?",
    options: [
      "Ein Router - er trifft Weiterleitungsentscheidungen auf Basis der Ziel-IP-Adresse und seiner Routing-Tabelle",
      "Ein Hub - er kennt weder MAC- noch IP-Adressen und arbeitet rein elektrisch",
      "Ein Switch - er leitet innerhalb EINES Netzwerks anhand von MAC-Adressen weiter, nicht zwischen Netzwerken",
      "Ein Repeater - er verstärkt nur das Signal, ohne es anhand irgendeiner Adresse zu lenken",
    ],
    correctIndex: 0,
    explanation:
      "Ein Router arbeitet auf Schicht 3 und trifft Weiterleitungsentscheidungen anhand der Ziel-IP-Adresse und seiner Routing-Tabelle - er verbindet verschiedene Netzwerke miteinander.",
  },
  {
    difficulty: "medium",
    question: "Wie \"lernt\" ein Switch, an welchem Port sich welches Gerät befindet?",
    options: [
      "Er merkt sich die Quell-MAC-Adresse eingehender Frames zusammen mit dem Port, an dem sie ankamen (MAC-Adress-Tabelle)",
      "Ein Administrator muss jede MAC-Adresse manuell eintragen",
      "Er fragt bei jedem Frame den Hersteller der Netzwerkkarte per Internet ab",
    ],
    correctIndex: 0,
    explanation:
      "Der Switch baut automatisch eine MAC-Adress-Tabelle auf: sobald ein Frame an einem Port ankommt, merkt er sich \"diese Quell-MAC ist an diesem Port erreichbar\" - für künftige Pakete an diese Adresse muss er dann nicht mehr fluten.",
  },
  {
    difficulty: "medium",
    question:
      "Was macht ein Switch, wenn er ein Paket an eine ihm noch unbekannte Ziel-MAC-Adresse senden soll?",
    options: [
      "Er flutet das Paket an alle Ports (ausser dem Eingangsport), bis er eine Antwort sieht und die Adresse lernt (\"Unknown Unicast Flooding\")",
      "Er verwirft das Paket sofort, da die Adresse unbekannt ist",
      "Er schickt es automatisch an den Router weiter",
    ],
    correctIndex: 0,
    explanation:
      "Ohne Eintrag in der MAC-Adress-Tabelle verhält sich der Switch für dieses eine Paket wie ein Hub und flutet es an alle Ports - sobald das Zielgerät antwortet, lernt der Switch dessen Port und muss künftig nicht mehr fluten.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet eine Kollisionsdomäne von einer Broadcast-Domäne?",
    options: [
      "Jeder Switch-Port ist eine eigene Kollisionsdomäne (kein Kollisionsrisiko mehr); alle Ports eines Switches teilen sich aber weiterhin dieselbe Broadcast-Domäne (ausser mit VLANs)",
      "Beide Begriffe bedeuten exakt dasselbe",
      "Eine Kollisionsdomäne betrifft nur WLAN, eine Broadcast-Domäne nur Kabelnetzwerke",
    ],
    correctIndex: 0,
    explanation:
      "Switches trennen Kollisionsdomänen (pro Port), aber nicht automatisch Broadcast-Domänen - ein Broadcast erreicht weiterhin alle Ports desselben Switches (und aller verbundenen Switches). Erst VLANs oder Router trennen auch die Broadcast-Domäne.",
  },
  {
    difficulty: "hard",
    question: "Warum sind Hubs aus modernen Netzwerken praktisch verschwunden?",
    options: [
      "Alle angeschlossenen Geräte teilen sich dieselbe Kollisionsdomäne und Bandbreite (Half-Duplex, CSMA/CD-Kollisionen) - das skaliert schlecht. Switches bieten dedizierte Bandbreite pro Port und kollisionsfreien Vollduplex-Betrieb",
      "Hubs wurden aus rein rechtlichen Gründen verboten",
      "Hubs unterstützen kein Ethernet-Kabel",
    ],
    correctIndex: 0,
    explanation:
      "Je mehr Geräte an einem Hub hängen, desto mehr Kollisionen und desto langsamer wird das gemeinsam genutzte Medium. Switches sind seit den 1990ern kaum teurer, aber technisch klar überlegen - Hubs sind daher aus dem produktiven Einsatz verschwunden.",
  },
  {
    difficulty: "hard",
    question:
      "Zwei Routen passen auf dieselbe Ziel-IP, aber mit unterschiedlicher Präfixlänge (z.B. /16 und /24). Welche Route gewinnt?",
    options: [
      "Die spezifischere Route mit der längeren Präfixlänge (\"Longest Prefix Match\") - hier also die /24-Route",
      "Die zuerst in der Tabelle eingetragene Route, unabhängig von der Präfixlänge",
      "Beide Routen werden gleichzeitig verwendet (Lastverteilung)",
    ],
    correctIndex: 0,
    explanation:
      "Anders als bei Firewall-Regeln (erste passende Regel gewinnt) gilt beim Routing das Prinzip \"Longest Prefix Match\": von allen passenden Routen gewinnt die mit der spezifischsten (längsten) Präfixlänge - unabhängig von der Reihenfolge in der Tabelle.",
  },
  {
    difficulty: "easy",
    question: "Was bewirkt ein VLAN auf einem physischen Switch?",
    options: [
      "Es teilt den Switch logisch in mehrere getrennte Broadcast-Domänen auf, ohne dass zusätzliche physische Hardware nötig ist",
      "Es erhöht die maximale Übertragungsgeschwindigkeit aller angeschlossenen Ports",
      "Es verschlüsselt automatisch den gesamten Datenverkehr auf dem Switch",
    ],
    correctIndex: 0,
    explanation:
      "Ein VLAN (Virtual LAN) trennt einen einzelnen physischen Switch logisch in mehrere eigenständige Broadcast-Domänen - Geräte in unterschiedlichen VLANs erreichen sich nicht per Broadcast, obwohl sie am selben Switch hängen.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet einen Access-Port von einem Trunk-Port?",
    options: [
      "Ein Access-Port gehört zu genau einem VLAN und überträgt unmarkierte Frames; ein Trunk-Port trägt mehrere VLANs gleichzeitig, per Tag unterschieden",
      "Ein Trunk-Port ist nur ein anderer Name für einen Access-Port mit höherer Geschwindigkeit",
      "Ein Access-Port wird ausschliesslich zwischen zwei Switches verwendet, ein Trunk-Port nur für Endgeräte",
    ],
    correctIndex: 0,
    explanation:
      "Access-Ports verbinden Endgeräte (PC, Drucker) mit genau einem VLAN, ohne dass das Gerät selbst etwas von VLANs mitbekommt. Trunk-Ports verbinden meist Switches untereinander (oder mit einem Router) und bündeln den Verkehr mehrerer VLANs über eine einzige Leitung.",
  },
  {
    difficulty: "medium",
    question: "Wozu dient das 802.1Q-Tag in einem Ethernet-Frame?",
    options: [
      "Es markiert, zu welchem VLAN der Frame gehört, damit ein Trunk-Port mehrere VLANs über dieselbe Leitung sauber getrennt übertragen kann",
      "Es enthält eine Prüfsumme zur Fehlerkorrektur bei beschädigten Frames",
      "Es verschlüsselt den Inhalt des Frames für die Übertragung über den Trunk",
    ],
    correctIndex: 0,
    explanation:
      "Das 802.1Q-Tag fügt dem Frame 4 zusätzliche Bytes mit u.a. der VLAN-ID hinzu. Nur so kann ein Trunk-Port, der Verkehr mehrerer VLANs gleichzeitig trägt, jeden Frame beim Empfang wieder dem richtigen VLAN zuordnen.",
  },
  {
    difficulty: "hard",
    question:
      "Ein PC in VLAN 10 soll mit einem Server in VLAN 20 kommunizieren, beide hängen am selben Switch. Reicht dafür eine reine Layer-2-VLAN-Konfiguration am Switch aus?",
    options: [
      "Nein - VLANs sind eigene Broadcast-Domänen wie getrennte Netzwerke, dafür braucht es Routing (Router oder Layer-3-Switch) zwischen den VLANs, genau wie zwischen zwei physisch getrennten Subnetzen",
      "Ja, solange beide Geräte an demselben physischen Switch angeschlossen sind, spielt das VLAN keine Rolle",
      "Ja, ein Trunk-Port zwischen den beiden Access-Ports reicht dafür bereits aus",
    ],
    correctIndex: 0,
    explanation:
      "VLANs trennen Broadcast-Domänen genauso wirksam wie physisch getrennte Netzwerke - reines Switching (Layer 2) reicht für die Kommunikation zwischen unterschiedlichen VLANs nicht aus. Es braucht Inter-VLAN-Routing, z.B. über einen Router-on-a-Stick oder einen Layer-3-fähigen Switch.",
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
      item.innerHTML = `<input type="radio" name="ndq${qIdx}" /> <span>${opt}</span>`;
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

    const expBox = list.parentElement.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className = "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${QUIZ.length} richtig.</strong>`;

  updateProgressFlag("quizDone", allCorrect);
}

/* ================= Teil 2: Routing-Tabellen-Aufgaben ================= */

let currentTask = null;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ipToInt(ip) {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function inNetwork(ip, netBase, cidr) {
  if (cidr === 0) return true;
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(netBase) & mask);
}

function randomPublicIp() {
  const first = randInt(20, 220);
  if (first === 10) return randomPublicIp();
  return `${first}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function generateTask(difficulty) {
  const x = randInt(1, 250);
  const y = randInt(1, 250);
  const xDecoy = ((x + randInt(10, 100)) % 250) + 1;

  const routeDefault = { cidr: "0.0.0.0/0", gateway: "Default-Gateway (ISP)", net: "0.0.0.0", bits: 0 };
  const route24 = {
    cidr: `10.${x}.${y}.0/24`,
    gateway: `Abteilungs-Router (10.${x}.${y}.1)`,
    net: `10.${x}.${y}.0`,
    bits: 24,
  };
  const route16 = {
    cidr: `10.${x}.0.0/16`,
    gateway: `Standort-Router (10.${x}.0.1)`,
    net: `10.${x}.0.0`,
    bits: 16,
  };
  const route8 = {
    cidr: `10.0.0.0/8`,
    gateway: `Kern-Router (10.0.0.1)`,
    net: `10.0.0.0`,
    bits: 8,
  };
  const routeDecoy16 = {
    cidr: `10.${xDecoy}.0.0/16`,
    gateway: `Standort-Router B (10.${xDecoy}.0.1)`,
    net: `10.${xDecoy}.0.0`,
    bits: 16,
  };

  let routes;
  let zone;
  if (difficulty === "easy") {
    routes = [routeDefault, route24];
    zone = choice(["in24", "outside"]);
  } else if (difficulty === "medium") {
    routes = [routeDefault, route16, route24];
    zone = choice(["in24", "in16only", "outside"]);
  } else {
    routes = [routeDefault, route8, route16, route24, routeDecoy16];
    zone = choice(["in24", "in16only", "in8only", "outside"]);
  }

  let destinationIp;
  if (zone === "in24") {
    destinationIp = `10.${x}.${y}.${randInt(1, 254)}`;
  } else if (zone === "in16only") {
    let yOther = randInt(1, 250);
    if (yOther === y) yOther = (yOther % 250) + 1;
    destinationIp = `10.${x}.${yOther}.${randInt(1, 254)}`;
  } else if (zone === "in8only") {
    let xOther = randInt(1, 250);
    if (xOther === x || xOther === xDecoy) xOther = ((xOther + 37) % 250) + 1;
    destinationIp = `10.${xOther}.${randInt(0, 255)}.${randInt(1, 254)}`;
  } else {
    destinationIp = randomPublicIp();
  }

  // korrekte Route ermitteln: laengster passender Praefix gewinnt
  const matching = routes.filter((r) => inNetwork(destinationIp, r.net, r.bits));
  matching.sort((a, b) => b.bits - a.bits);
  const correctRoute = matching[0];

  return {
    difficulty,
    routes: shuffle(routes),
    destinationIp,
    correctGateway: correctRoute.gateway,
  };
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderTask() {
  const difficulty = document.getElementById("task-difficulty-select").value;
  currentTask = generateTask(difficulty);

  const diffBadge = document.getElementById("task-difficulty-badge");
  diffBadge.textContent = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[difficulty];
  diffBadge.className = "badge difficulty-" + difficulty;

  const tbody = document.getElementById("routing-table-body");
  tbody.innerHTML = currentTask.routes
    .map(
      (r) => `<tr>
        <td class="mono">${r.cidr}</td>
        <td class="mono">${r.gateway}</td>
      </tr>`
    )
    .join("");

  document.getElementById("task-destination-ip").textContent = currentTask.destinationIp;

  const optionsEl = document.getElementById("routing-options-list");
  optionsEl.innerHTML = "";
  currentTask.routes
    .map((r) => r.gateway)
    .forEach((gateway) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.innerHTML = `<input type="radio" name="routing-option" /> <span class="mono">${gateway}</span>`;
      item.addEventListener("click", () => {
        optionsEl.querySelectorAll(".option-item").forEach((el) => {
          el.classList.remove("selected");
          el.querySelector("input").checked = false;
        });
        item.classList.add("selected");
        item.querySelector("input").checked = true;
        optionsEl.dataset.chosen = gateway;
      });
      optionsEl.appendChild(item);
    });

  const fb = document.getElementById("task-feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";
}

function checkTask() {
  if (!currentTask) return;
  const optionsEl = document.getElementById("routing-options-list");
  const chosen = optionsEl.dataset.chosen;
  if (!chosen) return;

  const correct = chosen === currentTask.correctGateway;

  optionsEl.querySelectorAll(".option-item").forEach((el) => {
    const label = el.querySelector("span").textContent;
    if (label === currentTask.correctGateway) el.classList.add("correct-answer");
    if (label === chosen && !correct) el.classList.add("wrong-answer");
  });

  updateTaskScore(correct);

  const fb = document.getElementById("task-feedback");
  fb.classList.remove("hidden");
  fb.className = "feedback-box " + (correct ? "correct" : "incorrect");
  fb.innerHTML = correct
    ? "<strong>Richtig!</strong> Das ist die Route mit dem längsten passenden Präfix."
    : `<strong>Nicht ganz.</strong> Die korrekte Route (längster passender Präfix) führt über: <span class="mono">${currentTask.correctGateway}</span>`;
}

function updateTaskScore(wasCorrect) {
  const progress = loadProgress();
  const prev = progress[MODULE_ID] || {};
  const totalCount = (prev.totalCount || 0) + 1;
  const correctCount = (prev.correctCount || 0) + (wasCorrect ? 1 : 0);

  const quizDone = Boolean(prev.quizDone);
  const tasksDone = correctCount >= GOAL_CORRECT;
  const status = quizDone && tasksDone ? "done" : "progress";
  const wasDone = prev.status === "done";
  setModuleStatus(MODULE_ID, status, { totalCount, correctCount });

  renderScorePill(correctCount, totalCount);
  updateChecklist({ correctCount, quizDone });

  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function renderScorePill(correctCount, totalCount) {
  document.getElementById(
    "task-score-pill"
  ).textContent = `${correctCount || 0} / ${GOAL_CORRECT} richtig (insgesamt ${totalCount || 0} Versuche)`;
}

/* ================= Gemeinsam ================= */

function updateProgressFlag(flagName, value) {
  const progress = loadProgress();
  const prev = progress[MODULE_ID] || {};
  const updated = Object.assign({}, prev, { [flagName]: value });
  const tasksDone = (updated.correctCount || 0) >= GOAL_CORRECT;
  const done = Boolean(updated.quizDone) && tasksDone;
  const wasDone = prev.status === "done";
  setModuleStatus(MODULE_ID, done ? "done" : "progress", updated);
  updateChecklist(updated);
  if (done && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateChecklist(state) {
  const taskItem = document.getElementById("check-tasks");
  const tasksDone = (state.correctCount || 0) >= GOAL_CORRECT;
  taskItem.classList.toggle("status-done", tasksDone);
  taskItem.textContent = tasksDone
    ? "✅ Routing-Tabellen-Aufgaben: Ziel erreicht"
    : `⬜ Routing-Tabellen-Aufgaben: ${state.correctCount || 0} / ${GOAL_CORRECT} richtig`;

  const quizItem = document.getElementById("check-quiz");
  quizItem.classList.toggle("status-done", Boolean(state.quizDone));
  quizItem.textContent = state.quizDone
    ? "✅ Geräte-Quiz vollständig richtig gelöst"
    : "⬜ Geräte-Quiz vollständig richtig lösen";
}

/* ================= ARP-Auflösung-Animation ================= */

const ARP_NODES = {
  client: { left: "8%", top: "50%" },
  target: { left: "88%", top: "18%" },
  other: { left: "88%", top: "82%" },
};

const ARP_ANIM_STEPS = [
  {
    text: 'PC A sendet einen Broadcast: "Wer hat 192.168.1.20? Bitte melde deine MAC-Adresse!"',
    packets: [
      { id: "arp-packet-1", from: "client", to: "target", cls: "pkt-broadcast" },
      { id: "arp-packet-2", from: "client", to: "other", cls: "pkt-broadcast" },
    ],
  },
  {
    text: "Nur PC B antwortet direkt (Unicast) mit seiner MAC-Adresse - PC C ignoriert die Anfrage, da sie ihn nicht betrifft.",
    packets: [{ id: "arp-packet-1", from: "target", to: "client", cls: "pkt-final" }],
    inactiveNode: "arp-node-other",
  },
];

let arpAnimStep = 0;
let arpAnimRunning = false;

function arpAnimSetButtonsDisabled(disabled) {
  document.getElementById("arp-anim-play").disabled = disabled;
  document.getElementById("arp-anim-step").disabled = disabled;
}

async function arpAnimPlayStep(index) {
  const step = ARP_ANIM_STEPS[index];
  const status = document.getElementById("arp-anim-status");
  const stepEls = document.querySelectorAll("#arp-anim-steps .proto-anim-step");
  const allPacketIds = ["arp-packet-1", "arp-packet-2"];

  stepEls.forEach((el, i) => el.classList.toggle("active", i === index));

  document.querySelectorAll("#arp-anim-track .proto-anim-node2d").forEach((el) => el.classList.remove("inactive"));
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
    protoAnimJumpTo(el, ARP_NODES[p.from]);
    protoAnimMoveTo(el, ARP_NODES[p.to]);
  });

  status.textContent = step.text;
  await protoAnimWait(1200);

  stepEls[index].classList.remove("active");
  stepEls[index].classList.add("done");
}

async function arpAnimPlayAll() {
  if (arpAnimRunning) return;
  arpAnimRunning = true;
  arpAnimSetButtonsDisabled(true);
  arpAnimResetVisuals();

  for (let i = 0; i < ARP_ANIM_STEPS.length; i++) {
    await arpAnimPlayStep(i);
  }
  arpAnimStep = ARP_ANIM_STEPS.length;

  document.getElementById("arp-anim-status").textContent =
    'PC A kennt jetzt die MAC-Adresse von PC B und kann die Daten direkt adressieren. Klicke "Zurücksetzen", um es erneut zu sehen.';
  arpAnimSetButtonsDisabled(false);
  arpAnimRunning = false;
}

async function arpAnimNextStep() {
  if (arpAnimRunning || arpAnimStep >= ARP_ANIM_STEPS.length) return;
  arpAnimRunning = true;
  arpAnimSetButtonsDisabled(true);

  await arpAnimPlayStep(arpAnimStep);
  arpAnimStep++;

  if (arpAnimStep >= ARP_ANIM_STEPS.length) {
    document.getElementById("arp-anim-status").textContent =
      'PC A kennt jetzt die MAC-Adresse von PC B und kann die Daten direkt adressieren. Klicke "Zurücksetzen", um es erneut zu sehen.';
  }
  arpAnimSetButtonsDisabled(false);
  arpAnimRunning = false;
}

function arpAnimResetVisuals() {
  arpAnimStep = 0;
  ["arp-packet-1", "arp-packet-2"].forEach((id) => {
    const el = document.getElementById(id);
    el.className = "proto-anim-packet2d hidden-packet";
    el.style.left = ARP_NODES.client.left;
    el.style.top = ARP_NODES.client.top;
  });
  document.querySelectorAll("#arp-anim-track .proto-anim-node2d").forEach((el) => el.classList.remove("inactive"));
  document.querySelectorAll("#arp-anim-steps .proto-anim-step").forEach((el) => el.classList.remove("active", "done"));
}

function arpAnimReset() {
  arpAnimResetVisuals();
  document.getElementById("arp-anim-status").textContent =
    'Bereit - klicke "Abspielen" oder gehe Schritt für Schritt durch.';
}

function wireArpAnimation() {
  arpAnimReset();
  document.getElementById("arp-anim-play").addEventListener("click", arpAnimPlayAll);
  document.getElementById("arp-anim-step").addEventListener("click", arpAnimNextStep);
  document.getElementById("arp-anim-reset").addEventListener("click", arpAnimReset);
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);

  wireArpAnimation();

  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  updateChecklist(stored);
  renderScorePill(stored.correctCount || 0, stored.totalCount || 0);
  if (stored.status === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);

  renderTask();
  document.getElementById("check-task-btn").addEventListener("click", checkTask);
  document.getElementById("new-task-btn").addEventListener("click", renderTask);
  document.getElementById("task-difficulty-select").addEventListener("change", renderTask);
});
