/*
 * dns-concepts.js - Modul 5: DNS & Domain-Konzepte
 * Statischer Erklaerteil + ein kleiner Konfigurator, der anhand von
 * Benutzername/Repo/eigener Domain Beispiel-DNS-Eintraege fuer GitHub
 * Pages generiert. Die Werte werden nur lokal (localStorage) gespeichert.
 */

const MODULE_ID = "dnsconcepts";
const DNS_CONFIG_KEY = "netsec-trainer-dns-config-v1";

// Offizielle GitHub-Pages-IPs fuer A-Records auf die Apex-Domain.
const GITHUB_PAGES_IPS = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
];

const QUIZ = [
  {
    question:
      "Welcher Record-Typ verweist auf eine andere IP-Adresse (z.B. auf einen Server)?",
    options: ["A-Record", "CNAME-Record", "MX-Record"],
    correctIndex: 0,
  },
  {
    question:
      "Welcher Record-Typ verweist auf einen anderen Hostnamen statt auf eine IP-Adresse?",
    options: ["A-Record", "CNAME-Record", "TXT-Record"],
    correctIndex: 1,
  },
  {
    question:
      "Was gibt die TTL (Time to Live) eines DNS-Eintrags an?",
    options: [
      "Wie lange ein Resolver den Eintrag cachen darf, bevor er neu abgefragt wird",
      "Wie viele Server einen Eintrag gleichzeitig speichern duerfen",
      "Die maximale Anzahl DNS-Anfragen pro Sekunde",
    ],
    correctIndex: 0,
  },
  {
    question:
      "Warum kann eine DNS-Aenderung nach dem Speichern noch eine Weile 'alt' erscheinen (Propagation)?",
    options: [
      "Weil DNS-Server weltweit Aenderungen sofort erzwingen muessen",
      "Weil verschiedene Resolver/Caches den alten Wert bis zum Ablauf seiner TTL weiter ausliefern koennen",
      "Weil Browser DNS-Eintraege nie cachen",
    ],
    correctIndex: 1,
  },
];

function loadDnsConfig() {
  try {
    const raw = localStorage.getItem(DNS_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDnsConfig(config) {
  try {
    localStorage.setItem(DNS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("DNS-Konfiguration konnte nicht gespeichert werden:", err);
  }
}

function renderExampleRecords() {
  const username = document.getElementById("gh-username").value.trim() || "DEIN-USERNAME";
  const repo = document.getElementById("gh-repo").value.trim();
  const customDomain = document.getElementById("custom-domain").value.trim();

  const pagesHost = `${username}.github.io`;
  const pagesUrl = repo ? `https://${pagesHost}/${repo}/` : `https://${pagesHost}/`;

  document.getElementById("computed-pages-url").textContent = pagesUrl;

  const rows = [];

  if (customDomain) {
    const isApex = customDomain.split(".").length === 2; // z.B. beispiel.ch
    if (isApex) {
      GITHUB_PAGES_IPS.forEach((ip) => {
        rows.push({ type: "A", name: customDomain, value: ip, ttl: "3600" });
      });
      rows.push({
        type: "CNAME",
        name: `www.${customDomain}`,
        value: pagesHost,
        ttl: "3600",
      });
    } else {
      rows.push({ type: "CNAME", name: customDomain, value: pagesHost, ttl: "3600" });
    }
  } else {
    rows.push({
      type: "CNAME",
      name: "(deine-subdomain).beispiel.ch",
      value: pagesHost,
      ttl: "3600",
    });
  }

  const tbody = document.getElementById("records-tbody");
  tbody.innerHTML = rows
    .map(
      (r) => `<tr>
        <td class="mono">${r.type}</td>
        <td class="mono">${r.name}</td>
        <td class="mono">${r.value}</td>
        <td class="mono">${r.ttl}</td>
      </tr>`
    )
    .join("");

  saveDnsConfig({ username, repo, customDomain });
}

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  QUIZ.forEach((q, qIdx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    wrapper.innerHTML = `
      <h4 style="margin-top:0;">${qIdx + 1}. ${q.question}</h4>
      <div class="option-list" data-question="${qIdx}"></div>
    `;
    const list = wrapper.querySelector(".option-list");
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.innerHTML = `<input type="radio" name="q${qIdx}" /> <span>${opt}</span>`;
      item.addEventListener("click", () => {
        list.querySelectorAll(".option-item").forEach((el) => {
          el.classList.remove("selected");
          el.querySelector("input").checked = false;
        });
        item.classList.add("selected");
        item.querySelector("input").checked = true;
        item.dataset.chosen = "true";
        list.dataset.chosenIndex = String(oIdx);
      });
      list.appendChild(item);
    });
    container.appendChild(wrapper);
  });
}

function checkQuiz() {
  const lists = document.querySelectorAll(".option-list");
  let correctCount = 0;

  lists.forEach((list, qIdx) => {
    const chosenIndex = list.dataset.chosenIndex;
    const q = QUIZ[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item, oIdx) => {
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (
        chosenIndex !== undefined &&
        Number(chosenIndex) === oIdx &&
        oIdx !== q.correctIndex
      ) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;
  });

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${QUIZ.length} richtig.</strong> ${
    allCorrect
      ? "Sehr gut, die DNS-Grundlagen sitzen!"
      : "Schau dir die markierten Antworten oben nochmal an und wiederhole bei Bedarf den Erklaerteil."
  }`;

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

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  const stored = loadDnsConfig();
  if (stored.username) document.getElementById("gh-username").value = stored.username;
  if (stored.repo) document.getElementById("gh-repo").value = stored.repo;
  if (stored.customDomain)
    document.getElementById("custom-domain").value = stored.customDomain;

  renderExampleRecords();
  ["gh-username", "gh-repo", "custom-domain"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderExampleRecords);
  });

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
