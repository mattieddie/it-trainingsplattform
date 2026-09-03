/*
 * subnetting.js - Modul 1: Subnetting-Trainer
 * Generiert zufällige IP/CIDR-Aufgaben und prüft Netzadresse, Broadcast,
 * Anzahl nutzbarer Hosts und das nächste Subnetz.
 */

const MODULE_ID = "subnetting";
const GOAL_CORRECT = 10; // so viele komplett korrekte Aufgaben bis "abgeschlossen"

let currentTask = null;

/* ---------------- IP-Mathe-Hilfsfunktionen ---------------- */

function ipToInt(ip) {
  const parts = ip.split(".").map(Number);
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join(".");
}

function cidrToMaskInt(cidr) {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

function networkInt(ip, cidr) {
  return (ipToInt(ip) & cidrToMaskInt(cidr)) >>> 0;
}

function broadcastInt(netInt, cidr) {
  const wildcard = (~cidrToMaskInt(cidr)) >>> 0;
  return (netInt | wildcard) >>> 0;
}

function usableHostCount(cidr) {
  if (cidr >= 31) return 0; // /31 (point-to-point, keine "nutzbaren" im klassischen Sinn) und /32 (Host)
  return Math.pow(2, 32 - cidr) - 2;
}

function nextNetworkInt(netInt, cidr) {
  const size = Math.pow(2, 32 - cidr);
  return (netInt + size) >>> 0;
}

/* ---------------- Aufgaben-Generierung ---------------- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOctet(excludeReserved) {
  return randInt(0, 255);
}

function generateRandomIpForCidr(cidr) {
  // Erster Oktett bewusst aus einem "normalen" Bereich, um Sonderfälle
  // (0.x, 127.x, 224+ Multicast) zu vermeiden.
  const first = randInt(1, 223);
  const second = randInt(0, 255);
  const third = randInt(0, 255);
  const fourth = randInt(0, 255);
  return `${first}.${second}.${third}.${fourth}`;
}

function difficultyToCidrRange(difficulty) {
  if (difficulty === "easy") return [24, 30];
  if (difficulty === "medium") return [16, 28];
  return [8, 30]; // hard
}

function generateTask(difficulty) {
  const [minCidr, maxCidr] = difficultyToCidrRange(difficulty);
  const cidr = randInt(minCidr, maxCidr);
  const ip = generateRandomIpForCidr(cidr);

  const netInt = networkInt(ip, cidr);
  const bcInt = broadcastInt(netInt, cidr);
  const hosts = usableHostCount(cidr);
  const nextNetInt = nextNetworkInt(netInt, cidr);

  return {
    ip,
    cidr,
    difficulty,
    answers: {
      network: intToIp(netInt),
      broadcast: intToIp(bcInt),
      hosts: hosts,
      nextSubnet: intToIp(nextNetInt),
    },
  };
}

/* ---------------- Validierung ---------------- */

function normalizeIpInput(value) {
  return value.trim();
}

function isValidIpFormat(value) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
}

/* ---------------- UI ---------------- */

function renderTask() {
  const difficulty = document.getElementById("difficulty-select").value;
  currentTask = generateTask(difficulty);

  document.getElementById(
    "task-ip-cidr"
  ).textContent = `${currentTask.ip}/${currentTask.cidr}`;

  const diffBadge = document.getElementById("task-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[difficulty];
  diffBadge.className = "badge difficulty-" + difficulty;

  ["network", "broadcast", "hosts", "nextSubnet"].forEach((field) => {
    const el = document.getElementById("input-" + field);
    el.value = "";
    el.closest(".field").classList.remove("field-correct", "field-incorrect");
  });

  const fb = document.getElementById("feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";

  document.getElementById("input-network").focus();
}

function checkAnswers() {
  if (!currentTask) return;
  const given = {
    network: normalizeIpInput(document.getElementById("input-network").value),
    broadcast: normalizeIpInput(
      document.getElementById("input-broadcast").value
    ),
    hosts: document.getElementById("input-hosts").value.trim(),
    nextSubnet: normalizeIpInput(
      document.getElementById("input-nextSubnet").value
    ),
  };

  const correct = currentTask.answers;
  const results = {
    network: given.network === correct.network,
    broadcast: given.broadcast === correct.broadcast,
    hosts: Number(given.hosts) === correct.hosts,
    nextSubnet: given.nextSubnet === correct.nextSubnet,
  };

  Object.keys(results).forEach((field) => {
    const wrapper = document.getElementById("input-" + field).closest(".field");
    wrapper.classList.toggle("field-correct", results[field]);
    wrapper.classList.toggle("field-incorrect", !results[field]);
  });

  const allCorrect = Object.values(results).every(Boolean);
  updateScore(allCorrect);

  const fb = document.getElementById("feedback");
  fb.classList.remove("hidden");
  if (allCorrect) {
    fb.className = "feedback-box correct";
    fb.innerHTML = `<strong>Richtig!</strong> Alle vier Werte stimmen für ${currentTask.ip}/${currentTask.cidr}.`;
  } else {
    fb.className = "feedback-box incorrect";
    fb.innerHTML = `
      <strong>Nicht ganz richtig.</strong> Die korrekten Werte für ${currentTask.ip}/${currentTask.cidr}:
      <ul style="margin:8px 0 0; padding-left:20px;">
        <li>Netzadresse: <span class="mono">${correct.network}</span></li>
        <li>Broadcast-Adresse: <span class="mono">${correct.broadcast}</span></li>
        <li>Nutzbare Hosts: <span class="mono">${correct.hosts}</span></li>
        <li>Nächstes Subnetz: <span class="mono">${correct.nextSubnet}</span></li>
      </ul>
    `;
  }
}

function updateScore(wasCorrect) {
  const progress = loadProgress();
  const prev = progress[MODULE_ID] || {};
  const totalCount = (prev.totalCount || 0) + 1;
  const correctCount = (prev.correctCount || 0) + (wasCorrect ? 1 : 0);

  const status = correctCount >= GOAL_CORRECT ? "done" : "progress";
  setModuleStatus(MODULE_ID, status, { totalCount, correctCount });

  renderScorePill(correctCount, totalCount);

  if (status === "done" && prev.status !== "done") {
    showCompletionBanner();
  }
}

function renderScorePill(correctCount, totalCount) {
  const el = document.getElementById("score-pill");
  el.textContent = `Score: ${correctCount || 0} / ${GOAL_CORRECT} richtig (insgesamt ${
    totalCount || 0
  } Versuche)`;
}

function showCompletionBanner() {
  document.getElementById("completion-banner").classList.remove("hidden");
}

function initFromStoredProgress() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  renderScorePill(stored.correctCount || 0, stored.totalCount || 0);
  if (stored.status === "done") {
    showCompletionBanner();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  initFromStoredProgress();
  renderTask();

  document.getElementById("check-btn").addEventListener("click", checkAnswers);
  document
    .getElementById("new-task-btn")
    .addEventListener("click", renderTask);
  document
    .getElementById("difficulty-select")
    .addEventListener("change", renderTask);

  document.querySelectorAll(".task-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkAnswers();
    });
  });
});
