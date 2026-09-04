/*
 * vpn-basics.js - Modul: VPN-Grundlagen
 * Konzept-Erklärung + ein schwierigkeitsgestuftes Quiz zu Site-to-Site vs.
 * Client-to-Site, IPSec vs. SSL-VPN, Split-/Full-Tunneling.
 */

const MODULE_ID = "vpnbasics";

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist der Grundgedanke eines VPN (Virtual Private Network)?",
    options: [
      "Ein verschlüsselter \"Tunnel\" durch ein unsicheres Netzwerk (z.B. das Internet), der zwei Netzwerke oder ein Gerät und ein Netzwerk so verbindet, als wären sie direkt vor Ort verbunden",
      "Ein besonders schneller Internetanschluss für Firmen",
      "Ein Programm, das die eigene IP-Adresse dauerhaft versteckt, ohne Verschlüsselung",
    ],
    correctIndex: 0,
    explanation:
      "Ein VPN baut einen verschlüsselten \"virtuellen Draht\" (Tunnel) durch ein an sich unsicheres/öffentliches Netz. Für die Anwendungen darin fühlt es sich an, als wären beide Enden direkt lokal verbunden.",
  },
  {
    difficulty: "easy",
    question:
      "Welcher VPN-Typ verbindet zwei komplette Standorte dauerhaft miteinander (z.B. Hauptsitz und Zweigstelle)?",
    options: ["Site-to-Site-VPN", "Client-to-Site-VPN", "Peer-to-Peer-VPN"],
    correctIndex: 0,
    explanation:
      "Ein Site-to-Site-VPN wird zwischen zwei Firewalls/Routern aufgebaut und verbindet zwei ganze Netzwerke dauerhaft - einzelne Nutzer merken davon meist nichts, sie greifen einfach auf Ressourcen am anderen Standort zu, als wären sie im selben Netz.",
  },
  {
    difficulty: "easy",
    question:
      "Welcher VPN-Typ wird typischerweise von einzelnen Homeoffice-Mitarbeitern genutzt, um sich von unterwegs mit dem Firmennetz zu verbinden?",
    options: ["Client-to-Site-VPN (Remote-Access-VPN)", "Site-to-Site-VPN", "Standard-DNS"],
    correctIndex: 0,
    explanation:
      "Beim Client-to-Site- (auch Remote-Access-)VPN verbindet sich ein einzelnes Gerät mit VPN-Client-Software bei Bedarf mit dem Firmennetz - im Gegensatz zum dauerhaften Site-to-Site-VPN zwischen zwei Standorten.",
  },
  {
    difficulty: "medium",
    question:
      "Was ist der Hauptunterschied zwischen IPSec-VPN und SSL-VPN in Bezug auf die benötigte Software?",
    options: [
      "IPSec braucht meist einen dedizierten Client bzw. Betriebssystem-Unterstützung; SSL-VPN funktioniert oft schon über einen normalen Browser oder ein leichtgewichtiges Client-Programm",
      "Beide benötigen exakt dieselbe Software, nur unterschiedliche Lizenzierung",
      "SSL-VPN funktioniert nur mit Internet Explorer",
    ],
    correctIndex: 0,
    explanation:
      "IPSec arbeitet auf Netzwerkebene (Schicht 3) und braucht dafür meist eine tiefere Betriebssystem-Integration oder einen eigenen Client. SSL-VPN (auch TLS-VPN) setzt auf denselben Mechanismus wie HTTPS und lässt sich dadurch oft schon im Browser oder mit schlanken Clients nutzen.",
  },
  {
    difficulty: "medium",
    question:
      "Warum lässt sich SSL-VPN oft leichter durch restriktive Firewalls (z.B. in Hotels oder öffentlichen WLANs) nutzen als klassisches IPSec?",
    options: [
      "SSL-VPN nutzt meist Port 443 (HTTPS), der praktisch überall offen ist - IPSec braucht eigene Protokolle/Ports, die in restriktiven Netzen oft blockiert sind",
      "SSL-VPN ist grundsätzlich schneller als IPSec",
      "IPSec funktioniert nur innerhalb desselben Landes",
    ],
    correctIndex: 0,
    explanation:
      "Port 443 wird von so gut wie jedem Netzwerk für normales HTTPS-Surfen erlaubt - SSL-VPN tarnt sich quasi als normaler Webseiten-Aufruf. IPSec nutzt dagegen eigene Protokolle (z.B. ESP, IKE über UDP 500/4500), die in stark gefilterten Netzen oft geblockt werden.",
  },
  {
    difficulty: "medium",
    question: "Was bedeutet \"Split Tunneling\" bei einem Client-to-Site-VPN?",
    options: [
      "Nur der Datenverkehr zum Firmennetz läuft durch den VPN-Tunnel, der restliche Internetverkehr (z.B. normales Surfen) geht direkt und ungefiltert ans Internet",
      "Der VPN-Tunnel wird technisch in zwei separate Tunnel aufgeteilt, um schneller zu sein",
      "Zwei Nutzer teilen sich denselben VPN-Tunnel gleichzeitig",
    ],
    correctIndex: 0,
    explanation:
      "Beim Split Tunneling entscheidet der Client selbst, welcher Verkehr durch den VPN-Tunnel und welcher direkt ans normale Internet geht - das spart Bandbreite auf der Firmenseite, hat aber Sicherheits-Implikationen (siehe nächste Frage).",
  },
  {
    difficulty: "hard",
    question: "Welchen Sicherheitsnachteil hat Split Tunneling gegenüber Full Tunneling?",
    options: [
      "Der normale Internetverkehr des Nutzers läuft NICHT durch die Firmen-Sicherheitsmechanismen (Firewall, Web-Filter) - ein kompromittiertes Gerät kann so leichter als Brücke zwischen offenem Internet und dem (via VPN erreichbaren) Firmennetz missbraucht werden",
      "Split Tunneling ist grundsätzlich unverschlüsselt",
      "Split Tunneling funktioniert nur mit IPSec, nie mit SSL-VPN",
    ],
    correctIndex: 0,
    explanation:
      "Beim Full Tunneling läuft SÄMTLICHER Verkehr - auch normales Surfen - durch den Firmentunnel und damit durch die zentralen Sicherheitskontrollen. Bei Split Tunneling umgeht der \"private\" Verkehr diese Kontrollen komplett, was das Risiko erhöht, falls das Gerät kompromittiert wird.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Site-to-Site-VPN zwischen zwei Standorten fällt aus, nachdem an einem Standort der Internetprovider gewechselt wurde (neue öffentliche IP-Adresse). Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der VPN-Tunnel ist auf die öffentliche IP-Adresse der Gegenstelle (Peer-IP) konfiguriert - nach einem IP-Wechsel muss diese Konfiguration auf beiden Seiten aktualisiert werden, sonst erkennt der Tunnel-Partner die neue Adresse nicht",
      "VPN-Tunnel funktionieren generell nur für maximal 30 Tage",
      "Ein IP-Wechsel hat keinerlei Auswirkung auf bestehende VPN-Konfigurationen",
    ],
    correctIndex: 0,
    explanation:
      "Klassische Site-to-Site-VPNs werden oft mit der festen öffentlichen IP der Gegenstelle als \"Peer\" konfiguriert. Ändert sich diese IP (z.B. durch Providerwechsel oder DHCP-Neuvergabe beim ISP), muss die VPN-Konfiguration auf der anderen Seite angepasst werden - ansonsten versucht der Tunnel weiter, die alte (falsche) Adresse zu erreichen.",
  },
  {
    difficulty: "hard",
    question: "Warum arbeitet IPSec typischerweise mit zwei Phasen (IKE Phase 1 und Phase 2)?",
    options: [
      "Phase 1 baut einen sicheren, authentifizierten Kanal für den Schlüsselaustausch selbst auf (\"Verhandlung\"); Phase 2 nutzt diesen sicheren Kanal, um die eigentlichen Verschlüsselungsschlüssel für den Datenverkehr auszuhandeln",
      "Phase 1 und Phase 2 sind zwei komplett unabhängige, optionale VPN-Typen",
      "Phase 2 wird nur bei Client-to-Site-VPNs benötigt, nie bei Site-to-Site",
    ],
    correctIndex: 0,
    explanation:
      "IKE (Internet Key Exchange) trennt bewusst zwei Schritte: zuerst wird ein sicherer Kanal für die weitere Kommunikation der beiden VPN-Gateways selbst ausgehandelt (Phase 1), erst danach werden darüber die eigentlichen Sitzungsschlüssel für den Datenverkehr vereinbart (Phase 2) - so wird nie unverschlüsselt über Schlüssel verhandelt.",
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
      item.innerHTML = `<input type="radio" name="vpnq${qIdx}" /> <span>${opt}</span>`;
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
