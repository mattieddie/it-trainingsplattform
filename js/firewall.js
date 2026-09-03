/*
 * firewall.js - Modul 3: Firewall-Regel-Puzzle
 * Der Nutzer bringt eine Menge von Firewall-Regeln in eine Reihenfolge.
 * Validiert wird nicht gegen eine "einzig richtige" Reihenfolge, sondern
 * indem simulierte Testpakete durch die Regeln laufen ("erste passende
 * Regel gewinnt") und das Ergebnis mit dem erwarteten Verhalten verglichen
 * wird. Das erlaubt mehrere gueltige Loesungen, solange das Verhalten stimmt.
 */

const MODULE_ID = "firewall";

const PUZZLES = [
  {
    id: "puzzle-easy",
    difficulty: "easy",
    title: "SSH nur vom Management-Netz",
    goal:
      "SSH (Port 22) auf den Server 192.168.1.10 soll NUR vom Management-Netz 10.0.0.0/24 erlaubt sein, von ueberall sonst geblockt. HTTP (Port 80) soll auf diesem Server von ueberall erlaubt sein.",
    rules: [
      { source: "any", destination: "192.168.1.10", port: "80", action: "Allow" },
      { source: "any", destination: "192.168.1.10", port: "22", action: "Deny" },
      { source: "10.0.0.0/24", destination: "192.168.1.10", port: "22", action: "Allow" },
    ],
    tests: [
      { desc: "Admin (10.0.0.5) via SSH", source: "10.0.0.5", destination: "192.168.1.10", port: 22, expected: "Allow" },
      { desc: "Fremder Host via SSH", source: "8.8.8.8", destination: "192.168.1.10", port: 22, expected: "Deny" },
      { desc: "Beliebiger Host via HTTP", source: "8.8.8.8", destination: "192.168.1.10", port: 80, expected: "Allow" },
    ],
  },
  {
    id: "puzzle-medium",
    difficulty: "medium",
    title: "Bekannter Angreifer im internen Netz",
    goal:
      "Der Host 192.168.10.66 wurde als kompromittiert erkannt und muss vollstaendig blockiert werden - auch wenn er sich im sonst vertrauenswuerdigen Netz 192.168.10.0/24 befindet. Dieses Netz darf ansonsten per HTTPS (443) auf den Webserver 192.168.1.20 zugreifen. Alles andere ist zu blocken (Standard-Deny).",
    rules: [
      { source: "any", destination: "any", port: "any", action: "Deny" },
      { source: "192.168.10.0/24", destination: "192.168.1.20", port: "443", action: "Allow" },
      { source: "192.168.10.66", destination: "any", port: "any", action: "Deny" },
    ],
    tests: [
      { desc: "Kompromittierter Host via HTTPS", source: "192.168.10.66", destination: "192.168.1.20", port: 443, expected: "Deny" },
      { desc: "Normaler interner Host via HTTPS", source: "192.168.10.5", destination: "192.168.1.20", port: 443, expected: "Allow" },
      { desc: "Normaler interner Host via HTTP (80)", source: "192.168.10.5", destination: "192.168.1.20", port: 80, expected: "Deny" },
      { desc: "Externer Host via HTTPS", source: "8.8.8.8", destination: "192.168.1.20", port: 443, expected: "Deny" },
    ],
  },
  {
    id: "puzzle-hard",
    difficulty: "hard",
    title: "DMZ-Webserver mit Monitoring & Jump-Host",
    goal:
      "DMZ-Webserver 10.10.10.5: HTTP (80) und HTTPS (443) sind von ueberall erlaubt. Das Monitoring-System 10.0.5.50 darf zusaetzlich per SNMP (Port 161) zugreifen. SSH (22) auf den Server ist nur vom Jump-Host 10.0.0.100 erlaubt. Alles andere ist zu blocken.",
    rules: [
      { source: "any", destination: "10.10.10.5", port: "443", action: "Allow" },
      { source: "any", destination: "any", port: "any", action: "Deny" },
      { source: "any", destination: "10.10.10.5", port: "22", action: "Deny" },
      { source: "10.0.0.100", destination: "10.10.10.5", port: "22", action: "Allow" },
      { source: "10.0.5.50", destination: "10.10.10.5", port: "161", action: "Allow" },
      { source: "any", destination: "10.10.10.5", port: "80", action: "Allow" },
    ],
    tests: [
      { desc: "Jump-Host via SSH", source: "10.0.0.100", destination: "10.10.10.5", port: 22, expected: "Allow" },
      { desc: "Fremder Host via SSH", source: "8.8.8.8", destination: "10.10.10.5", port: 22, expected: "Deny" },
      { desc: "Monitoring via SNMP", source: "10.0.5.50", destination: "10.10.10.5", port: 161, expected: "Allow" },
      { desc: "Fremder Host via SNMP", source: "8.8.8.8", destination: "10.10.10.5", port: 161, expected: "Deny" },
      { desc: "Beliebiger Host via HTTP", source: "8.8.8.8", destination: "10.10.10.5", port: 80, expected: "Allow" },
      { desc: "Beliebiger Host via HTTPS", source: "8.8.8.8", destination: "10.10.10.5", port: 443, expected: "Allow" },
      { desc: "Beliebiger Host via RDP (3389)", source: "8.8.8.8", destination: "10.10.10.5", port: 3389, expected: "Deny" },
    ],
  },
];

let currentPuzzle = null;
let currentOrder = []; // Array von Rule-Objekten in aktueller Reihenfolge
let dragFromIndex = null;

/* ---------------- IP/CIDR-Matching (einfache Teilmenge) ---------------- */

function ipToInt(ip) {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function fieldMatches(fieldValue, actualIp) {
  if (fieldValue === "any") return true;
  if (fieldValue.includes("/")) {
    const [base, bitsStr] = fieldValue.split("/");
    const bits = Number(bitsStr);
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ipToInt(base) & mask) === (ipToInt(actualIp) & mask);
  }
  return fieldValue === actualIp;
}

function portMatches(fieldValue, actualPort) {
  if (fieldValue === "any") return true;
  return Number(fieldValue) === Number(actualPort);
}

function simulatePacket(rules, packet) {
  for (const rule of rules) {
    if (
      fieldMatches(rule.source, packet.source) &&
      fieldMatches(rule.destination, packet.destination) &&
      portMatches(rule.port, packet.port)
    ) {
      return rule.action;
    }
  }
  return "Deny"; // implizites Standard-Deny
}

/* ---------------- Reihenfolge mischen ---------------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- Rendering ---------------- */

function loadSolvedSet() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solved) ? stored.solved : [];
}

function renderPuzzle(puzzleId) {
  currentPuzzle = PUZZLES.find((p) => p.id === puzzleId) || PUZZLES[0];
  currentOrder = shuffle(currentPuzzle.rules);

  document.getElementById("puzzle-title").textContent = currentPuzzle.title;
  document.getElementById("puzzle-goal").textContent = currentPuzzle.goal;

  const diffBadge = document.getElementById("puzzle-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentPuzzle.difficulty];
  diffBadge.className = "badge difficulty-" + currentPuzzle.difficulty;

  renderRuleList();
  document.getElementById("test-results").innerHTML = "";
  updateSolvedBadge();
}

function renderRuleList() {
  const list = document.getElementById("rule-list");
  list.innerHTML = "";

  currentOrder.forEach((rule, idx) => {
    const li = document.createElement("li");
    li.className = "rule-item";
    li.draggable = true;
    li.dataset.index = String(idx);

    li.innerHTML = `
      <div class="rule-index">${idx + 1}</div>
      <div><span class="rule-field-label">Quelle</span>${rule.source}</div>
      <div><span class="rule-field-label">Ziel</span>${rule.destination}</div>
      <div><span class="rule-field-label">Port</span>${rule.port}</div>
      <div><span class="rule-field-label">Aktion</span>
        <span class="${rule.action === "Allow" ? "action-allow" : "action-deny"}">${rule.action}</span>
      </div>
      <div class="reorder-btns">
        <button class="btn small" data-move="up" title="Nach oben">↑</button>
        <button class="btn small" data-move="down" title="Nach unten">↓</button>
      </div>
    `;

    li.addEventListener("dragstart", () => {
      dragFromIndex = idx;
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    li.addEventListener("dragover", (e) => e.preventDefault());
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragFromIndex === null || dragFromIndex === idx) return;
      moveRule(dragFromIndex, idx);
    });

    li.querySelector('[data-move="up"]').addEventListener("click", () => {
      if (idx > 0) moveRule(idx, idx - 1);
    });
    li.querySelector('[data-move="down"]').addEventListener("click", () => {
      if (idx < currentOrder.length - 1) moveRule(idx, idx + 1);
    });

    list.appendChild(li);
  });
}

function moveRule(fromIdx, toIdx) {
  const [moved] = currentOrder.splice(fromIdx, 1);
  currentOrder.splice(toIdx, 0, moved);
  dragFromIndex = null;
  renderRuleList();
}

function runTests() {
  if (!currentPuzzle) return;
  const results = currentPuzzle.tests.map((test) => {
    const actual = simulatePacket(currentOrder, test);
    return { ...test, actual, pass: actual === test.expected };
  });

  const resultsEl = document.getElementById("test-results");
  resultsEl.innerHTML = `<div class="test-result-list">${results
    .map(
      (r) => `
      <div class="test-result-item ${r.pass ? "pass" : "fail"}">
        <span>${r.pass ? "✅" : "❌"} ${r.desc} (${r.source} → ${r.destination}:${r.port})</span>
        <span>erwartet <strong>${r.expected}</strong>, erhalten <strong>${r.actual}</strong></span>
      </div>`
    )
    .join("")}</div>`;

  const allPass = results.every((r) => r.pass);
  const summary = document.createElement("div");
  summary.className = "feedback-box " + (allPass ? "correct" : "incorrect");
  summary.innerHTML = allPass
    ? "<strong>Alle Tests bestanden!</strong> Diese Regelreihenfolge erzeugt das gewuenschte Verhalten."
    : `<strong>${results.filter((r) => r.pass).length} / ${results.length} Tests bestanden.</strong> Ueberlege, welche Regel zuerst greifen sollte ("erste passende Regel gewinnt") und ordne neu.`;
  resultsEl.appendChild(summary);

  if (allPass) {
    markSolved(currentPuzzle.id);
  }
}

function markSolved(puzzleId) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solved || []);
  solved.add(puzzleId);
  const solvedArr = Array.from(solved);
  const status = solvedArr.length >= PUZZLES.length ? "done" : "progress";
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, status, { solved: solvedArr });
  updateSolvedBadge();
  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateSolvedBadge() {
  const solved = loadSolvedSet();
  document.getElementById(
    "score-pill"
  ).textContent = `Geloest: ${solved.length} / ${PUZZLES.length} Puzzles`;

  document.querySelectorAll(".puzzle-tab").forEach((btn) => {
    const pid = btn.dataset.puzzleId;
    btn.classList.toggle("puzzle-tab-solved", solved.includes(pid));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  const tabsEl = document.getElementById("puzzle-tabs");
  PUZZLES.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.className = "btn small puzzle-tab" + (i === 0 ? " active" : "");
    btn.dataset.puzzleId = p.id;
    btn.textContent = p.title;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".puzzle-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderPuzzle(p.id);
    });
    tabsEl.appendChild(btn);
  });

  renderPuzzle(PUZZLES[0].id);

  document.getElementById("run-tests-btn").addEventListener("click", runTests);
  document.getElementById("shuffle-btn").addEventListener("click", () => {
    currentOrder = shuffle(currentOrder);
    renderRuleList();
    document.getElementById("test-results").innerHTML = "";
  });
});
