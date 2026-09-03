/*
 * network-packets.js - Modul: Netzwerkpakete, TCP/UDP & OSI-Modell
 * Konzept-Erklärung + ein schwierigkeitsgestuftes Quiz.
 */

const MODULE_ID = "networkpackets";

const QUIZ = [
  {
    difficulty: "easy",
    question: "Wie viele Schichten hat das klassische OSI-Modell?",
    options: ["7", "4", "5"],
    correctIndex: 0,
    explanation:
      "Das OSI-Modell hat 7 Schichten: Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung. Das TCP/IP-Modell fasst dieselben Aufgaben pragmatischer in nur 4 Schichten zusammen.",
  },
  {
    difficulty: "easy",
    question:
      "Welches Transportprotokoll baut vor der Datenübertragung eine Verbindung auf (Handshake) und garantiert zuverlässige, geordnete Zustellung?",
    options: ["TCP", "UDP", "IP"],
    correctIndex: 0,
    explanation:
      "TCP (Transmission Control Protocol) ist verbindungsorientiert: Drei-Wege-Handshake vor der Übertragung, Bestätigungen (ACKs), erneutes Senden bei Verlust, und Sortierung falls Pakete in falscher Reihenfolge ankommen.",
  },
  {
    difficulty: "easy",
    question: "Wofür steht TTL in einem IP-Paket-Header?",
    options: [
      "Time To Live - maximale Anzahl an Router-Durchgängen (Hops), bevor das Paket verworfen wird",
      "Total Transfer Limit - maximale Dateigrösse pro Paket",
      "Time To Login - Zeitlimit für die Anmeldung am Zielserver",
    ],
    correctIndex: 0,
    explanation:
      "Jeder Router verringert die TTL um 1. Erreicht sie 0, wird das Paket verworfen. Das verhindert, dass Pakete bei einer Routing-Schleife ewig im Kreis wandern.",
  },
  {
    difficulty: "medium",
    question:
      "Welches Protokoll wird typischerweise für DNS-Anfragen, Video-Streaming und Online-Gaming verwendet, obwohl es keine Zustellung garantiert?",
    options: ["UDP", "TCP", "ICMP"],
    correctIndex: 0,
    explanation:
      "UDP (User Datagram Protocol) verzichtet bewusst auf Verbindungsaufbau, Bestätigungen und Neuübertragung - das macht es schneller und schlanker. Für Echtzeit-Anwendungen ist eine leicht verspätete oder fehlende Antwort oft weniger schlimm als die Verzögerung durch TCP.",
  },
  {
    difficulty: "medium",
    question: "In welcher Reihenfolge läuft der TCP-Drei-Wege-Handschlag (Three-Way Handshake) ab?",
    options: ["SYN → SYN-ACK → ACK", "ACK → SYN → SYN-ACK", "SYN → ACK → SYN-ACK"],
    correctIndex: 0,
    explanation:
      "Der Client sendet SYN (Verbindungswunsch), der Server antwortet mit SYN-ACK (Bestätigung + eigener Verbindungswunsch), der Client bestätigt mit ACK - danach ist die Verbindung in beide Richtungen aufgebaut.",
  },
  {
    difficulty: "medium",
    question:
      "Welche OSI-Schicht ist für die logische Adressierung (IP-Adressen) und das Routing zwischen Netzwerken zuständig?",
    options: [
      "Schicht 3 - Vermittlungsschicht (Network Layer)",
      "Schicht 2 - Sicherungsschicht (Data Link Layer)",
      "Schicht 4 - Transportschicht",
    ],
    correctIndex: 0,
    explanation:
      "Schicht 3 (Vermittlung/Network) arbeitet mit IP-Adressen und trifft Routing-Entscheidungen. Schicht 2 arbeitet mit MAC-Adressen innerhalb eines Netzsegments, Schicht 4 (Transport) mit Ports und Verbindungen (TCP/UDP).",
  },
  {
    difficulty: "medium",
    question: "Was passiert mit der TTL eines IP-Pakets bei jedem Router-Durchgang (Hop)?",
    options: [
      "Sie wird um 1 verringert - erreicht sie 0, wird das Paket verworfen und eine Fehlermeldung an den Absender geschickt",
      "Sie wird um 1 erhöht, damit das Paket länger unterwegs sein darf",
      "Sie bleibt während der gesamten Übertragung unverändert",
    ],
    correctIndex: 0,
    explanation:
      "Jeder durchquerte Router dekrementiert die TTL. Das Werkzeug \"traceroute\"/\"tracert\" nutzt genau dieses Verhalten aus, um jeden einzelnen Hop auf dem Weg sichtbar zu machen.",
  },
  {
    difficulty: "hard",
    question:
      "Warum verpackt (kapselt) jede Netzwerkschicht die Daten der darüberliegenden Schicht in einen eigenen Header?",
    options: [
      "Jede Schicht fügt nur die für ihre eigene Aufgabe nötigen Steuerinformationen hinzu (z.B. IP-Header fürs Routing, TCP-Header für Reihenfolge/Ports) - der Empfänger entfernt sie beim Empfang schichtweise wieder",
      "Das ist nur eine historische Konvention ohne technischen Nutzen",
      "Um die Dateigrösse künstlich zu vergrössern",
    ],
    correctIndex: 0,
    explanation:
      "Kapselung trennt sauber die Zuständigkeiten: die Sicherungsschicht kümmert sich nur um den lokalen Sprung (MAC-Adressen), die Vermittlungsschicht nur ums Routing (IP), die Transportschicht nur um Ports/Zuverlässigkeit. Beim Empfänger wird Schicht für Schicht wieder \"ausgepackt\" (Dekapselung).",
  },
  {
    difficulty: "hard",
    question:
      "Ein Traceroute zeigt, dass ein Paket nach 12 Hops nie am Ziel ankommt, sondern immer wieder \"TTL exceeded\" meldet, mit denselben Routern im Kreis. Was deutet das an?",
    options: [
      "Eine Routing-Schleife (Loop) - das Paket wird immer wieder zwischen denselben Routern weitergereicht, bis die TTL abläuft",
      "Der Zielserver ist einfach nur langsam",
      "Das Ziel-Netzwerk verwendet ausschliesslich UDP",
    ],
    correctIndex: 0,
    explanation:
      "Wiederkehrende dieselben Hops bei \"TTL exceeded\" sind ein klassisches Anzeichen für eine Routing-Schleife, meist durch einen Konfigurationsfehler (z.B. zwei Router, die sich gegenseitig als Weg zum selben Ziel eingetragen haben).",
  },
  {
    difficulty: "hard",
    question: "Warum passt das 7-Schichten-OSI-Modell nicht exakt 1:1 auf das 4-Schichten-TCP/IP-Modell?",
    options: [
      "Das TCP/IP-Modell fasst mehrere OSI-Schichten zusammen (z.B. Sitzungs-, Darstellungs- und Anwendungsschicht alle in einer einzigen \"Anwendungsschicht\") - es entstand pragmatisch aus echten Protokollen, während OSI ein theoretisches Referenzmodell ist",
      "Beide Modelle sind komplett identisch, nur unterschiedlich benannt",
      "TCP/IP hat mehr Schichten als OSI, nicht weniger",
    ],
    correctIndex: 0,
    explanation:
      "OSI wurde als allgemeines, herstellerunabhängiges Referenzmodell entworfen. TCP/IP entstand direkt aus den tatsächlich implementierten Internet-Protokollen und ist dadurch pragmatischer/gröber gegliedert - in der Praxis wird meist mit vier TCP/IP-Schichten gedacht, aber mit OSI-Begriffen (\"Layer 2\", \"Layer 3\") gesprochen.",
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
      item.innerHTML = `<input type="radio" name="npq${qIdx}" /> <span>${opt}</span>`;
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

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
