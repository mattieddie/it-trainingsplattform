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
    options: ["Hub", "Switch", "Router"],
    correctIndex: 0,
    explanation:
      "Ein Hub versteht nichts von Adressen - er verstärkt das Signal nur elektrisch und schickt es blind an alle anderen Ports. Alle angeschlossenen Geräte teilen sich dieselbe Kollisionsdomäne.",
  },
  {
    difficulty: "easy",
    question: "Welches Gerät verbindet unterschiedliche Netzwerke/Subnetze anhand von IP-Adressen?",
    options: ["Router", "Hub", "Switch"],
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
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
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
    items.forEach((item, oIdx) => {
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

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);

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
