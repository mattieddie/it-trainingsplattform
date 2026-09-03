/*
 * dhcp-dns.js - Modul 2: DHCP/DNS-Troubleshooting-Szenarien
 * Alle Tool-Ausgaben (ipconfig, nslookup, ping, ...) sind fest hinterlegte
 * Text-Fixtures. Es wird nichts echtes ausgefuehrt oder abgefragt.
 */

const MODULE_ID = "dhcpdns";

const SCENARIOS = [
  {
    id: "apipa",
    title: "Ticket #1042 - Kein Netzwerkzugriff",
    symptom:
      "Ein Nutzer meldet: 'Mein PC hat seit heute Morgen keine Internetverbindung mehr. Andere Kollegen im gleichen Buero haben keine Probleme.'",
    tools: [
      {
        id: "ipconfig",
        label: "ipconfig /all ausfuehren",
        output:
`Ethernet-Adapter LAN-Verbindung:

   Verbindungsspezifisches DNS-Suffix:
   Beschreibung. . . . . . . . . . . : Realtek PCIe GbE Family Controller
   DHCP aktiviert. . . . . . . . . . : Ja
   Autokonfiguration aktiviert . . . : Ja
   Autokonfigurations-IPv4-Adresse. : 169.254.83.12
   Subnetzmaske. . . . . . . . . . . : 255.255.0.0
   Standardgateway . . . . . . . . . :
   DHCP-Server . . . . . . . . . . . :`,
      },
      {
        id: "kabeltest",
        label: "Kabel-/Link-Status pruefen",
        output:
`Netzwerkadapter-Status: Verbunden (Link up)
Uebertragungsrate: 1 Gbps
Kabel: kein Fehler erkannt`,
      },
    ],
    question:
      "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der DHCP-Server ist nicht erreichbar oder der Adresspool ist erschoepft",
      "Der DNS-Server des Nutzers ist falsch konfiguriert",
      "Eine Firewall-Regel blockiert Port 443",
      "Die Netzwerkkarte des PCs ist defekt",
    ],
    correctIndex: 0,
    explanation:
      "169.254.x.x ist eine APIPA-Adresse (Automatic Private IP Addressing). Windows vergibt sie sich selbst, wenn per DHCP keine Antwort ankommt - z.B. weil der DHCP-Server ausgefallen ist oder der Adresspool (Scope) leer ist. Da Kabel/Link in Ordnung sind, liegt es nicht an der Hardware.",
  },
  {
    id: "ping-name-fails",
    title: "Ticket #1055 - Webseiten laden nicht, Ping per IP funktioniert",
    symptom:
      "Ein Nutzer kann keine Webseiten mehr aufrufen. Er berichtet: 'Ich kann den Server per IP-Adresse anpingen, aber www.firma-intern.local erreiche ich nicht.'",
    tools: [
      {
        id: "ping-ip",
        label: "ping 10.0.5.20 ausfuehren",
        output:
`Ping wird ausgefuehrt fuer 10.0.5.20 mit 32 Bytes Daten:
Antwort von 10.0.5.20: Bytes=32 Zeit=1ms TTL=64
Antwort von 10.0.5.20: Bytes=32 Zeit=1ms TTL=64

Ping-Statistik fuer 10.0.5.20:
    Pakete: Gesendet = 2, Empfangen = 2, Verloren = 0 (0% Verlust)`,
      },
      {
        id: "ping-name",
        label: "ping www.firma-intern.local ausfuehren",
        output:
`Ping-Anforderung konnte Host "www.firma-intern.local" nicht finden.
Ueberpruefen Sie den Namen, und wiederholen Sie den Vorgang.`,
      },
      {
        id: "nslookup",
        label: "nslookup www.firma-intern.local",
        output:
`Server:  UnKnown
Address:  10.0.0.1

*** UnKnown kann www.firma-intern.local nicht finden: Server failed`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der DNS-Server ist nicht erreichbar oder falsch konfiguriert",
      "Das Netzwerkkabel ist defekt",
      "Der Standardgateway fehlt",
      "Die IP-Adresse des Clients ist doppelt vergeben",
    ],
    correctIndex: 0,
    explanation:
      "Ping per IP funktioniert - die grundlegende Netzwerkverbindung (Layer 3) steht also. Nur die Namensaufloesung schlaegt fehl, und nslookup zeigt 'Server failed'. Das zeigt klar auf ein Problem mit dem DNS-Server bzw. dessen Erreichbarkeit/Konfiguration.",
  },
  {
    id: "wrong-dns-result",
    title: "Ticket #1061 - Falsche Webseite wird angezeigt",
    symptom:
      "Ein Nutzer ruft intranet.firma.local auf und landet auf einer voellig fremden Seite. Andere Dienste funktionieren normal.",
    tools: [
      {
        id: "nslookup",
        label: "nslookup intranet.firma.local",
        output:
`Server:  ext-dns.beispiel-provider.net
Address:  203.0.113.53

Name:    intranet.firma.local
Address: 203.0.113.77`,
      },
      {
        id: "ipconfig",
        label: "ipconfig /all (Ausschnitt DNS-Server)",
        output:
`DNS-Server . . . . . . . . . . . : 203.0.113.53
                                    (nicht der interne Firmen-DNS 10.0.0.1!)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Client nutzt einen falschen/fremden DNS-Server statt des internen Firmen-DNS",
      "Der interne Webserver ist abgestuerzt",
      "Die Subnetzmaske des Clients ist falsch",
      "Der DHCP-Server vergibt doppelte IP-Adressen",
    ],
    correctIndex: 0,
    explanation:
      "Der Client fragt einen externen DNS-Server (203.0.113.53) statt des internen Firmen-DNS (10.0.0.1) und bekommt dadurch fuer den internen Namen eine falsche, oeffentliche IP-Adresse zurueck. Loesung: korrekten internen DNS-Server (meist per DHCP) zuweisen.",
  },
  {
    id: "duplicate-ip",
    title: "Ticket #1073 - Verbindung bricht immer wieder ab",
    symptom:
      "Ein Nutzer meldet sporadische Verbindungsabbrueche. Windows zeigt gelegentlich eine Meldung zu einem Adresskonflikt an.",
    tools: [
      {
        id: "popup",
        label: "Windows-Meldung anzeigen",
        output:
`Es besteht ein Adresskonflikt mit einem anderen System im Netzwerk.
Windows hat die IP-Adresse 10.0.5.44 deaktiviert, da diese bereits von
einem anderen Geraet (MAC 00-1A-2B-3C-4D-5E) im Netzwerk verwendet wird.`,
      },
      {
        id: "arp",
        label: "arp -a ausfuehren",
        output:
`Schnittstelle: 10.0.5.44 --- 0xb
  Internetadresse      Physikal. Adresse     Typ
  10.0.5.44             00-1a-2b-3c-4d-5e     dynamisch
  10.0.5.1              aa-bb-cc-dd-ee-ff     dynamisch`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Ein Adresskonflikt: die IP-Adresse ist doppelt im Netzwerk vergeben",
      "Der DNS-Cache ist veraltet",
      "Der Nutzer hat die falsche Subnetzmaske eingetragen",
      "Der DHCP-Server ist komplett ausgefallen",
    ],
    correctIndex: 0,
    explanation:
      "Windows meldet explizit einen Adresskonflikt: Zwei Geraete im Netz nutzen dieselbe IP-Adresse 10.0.5.44. Das passiert z.B. bei statisch vergebenen IPs, die sich mit dem DHCP-Pool ueberschneiden.",
  },
  {
    id: "wrong-gateway",
    title: "Ticket #1080 - Internet geht nicht, lokales Netz schon",
    symptom:
      "Ein Nutzer kann Kollegen im lokalen Netz erreichen (Fileserver, Drucker), aber keine Internetseiten aufrufen.",
    tools: [
      {
        id: "ipconfig",
        label: "ipconfig ausfuehren",
        output:
`Ethernet-Adapter LAN-Verbindung:
   IPv4-Adresse. . . . . . . . . . . : 192.168.1.50
   Subnetzmaske. . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.2.1`,
      },
      {
        id: "ping-gw",
        label: "ping 192.168.2.1 (Gateway) ausfuehren",
        output:
`Ping wird ausgefuehrt fuer 192.168.2.1 mit 32 Bytes Daten:
Zielhost nicht erreichbar.
Zielhost nicht erreichbar.`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Standardgateway liegt in einem anderen Subnetz als die Client-IP",
      "Der DNS-Server ist falsch eingetragen",
      "Die IP-Adresse ist doppelt vergeben",
      "Der DHCP-Lease ist abgelaufen",
    ],
    correctIndex: 0,
    explanation:
      "Die Client-IP 192.168.1.50/24 liegt im Netz 192.168.1.0/24, das eingetragene Gateway 192.168.2.1 aber im Netz 192.168.2.0/24. Damit ist das Gateway aus Client-Sicht nicht erreichbar - lokale Kommunikation im eigenen Subnetz funktioniert trotzdem, das Internet (ueber das Gateway) aber nicht.",
  },
  {
    id: "stale-dns-cache",
    title: "Ticket #1091 - Alte Webseite wird trotz Umzug angezeigt",
    symptom:
      "Die Firmenseite www.beispiel-firma.ch wurde gestern auf einen neuen Server mit neuer IP umgezogen. Ein Nutzer sieht weiterhin die alte Version der Seite.",
    tools: [
      {
        id: "displaydns",
        label: "ipconfig /displaydns (Ausschnitt)",
        output:
`www.beispiel-firma.ch
----------------------------------------
    Eintragsname. . . . . : www.beispiel-firma.ch
    Eintragstyp . . . . . : 1
    Gueltigkeitsdauer. . : 3218
    Datensatzlaenge . . . : 4
    A (Host)-Datensatz . : 198.51.100.10   (alte IP)`,
      },
      {
        id: "nslookup",
        label: "nslookup www.beispiel-firma.ch 1.1.1.1 (oeffentlicher DNS)",
        output:
`Server:  one.one.one.one
Address:  1.1.1.1

Name:    www.beispiel-firma.ch
Address: 203.0.113.200   (neue IP)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der lokale DNS-Cache enthaelt noch den alten Eintrag, dessen TTL noch nicht abgelaufen ist",
      "Der neue Server ist nicht erreichbar",
      "Der Nutzer hat die falsche URL eingegeben",
      "Ein Adresskonflikt verhindert den Zugriff auf den neuen Server",
    ],
    correctIndex: 0,
    explanation:
      "Ein oeffentlicher DNS-Server liefert bereits die neue IP, der lokale Cache des Clients aber noch die alte - erkennbar an der TTL (Gueltigkeitsdauer), die noch nicht abgelaufen ist. Loesung: Cache leeren (ipconfig /flushdns) oder auf Ablauf der TTL warten.",
  },
];

let currentScenario = null;
let selectedOptionIndex = null;

function loadSolvedSet() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solved) ? stored.solved : [];
}

function pickScenario() {
  const solved = loadSolvedSet();
  const unsolved = SCENARIOS.filter((s) => !solved.includes(s.id));
  const pool = unsolved.length > 0 ? unsolved : SCENARIOS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderScenario() {
  currentScenario = pickScenario();
  selectedOptionIndex = null;

  document.getElementById("ticket-title").textContent = currentScenario.title;
  document.getElementById("ticket-symptom").textContent = currentScenario.symptom;

  const toolsEl = document.getElementById("tool-buttons");
  toolsEl.innerHTML = "";
  currentScenario.tools.forEach((tool) => {
    const btn = document.createElement("button");
    btn.className = "btn small";
    btn.textContent = "▶ " + tool.label;
    btn.addEventListener("click", () => toggleToolOutput(tool, btn));
    toolsEl.appendChild(btn);
  });

  document.getElementById("tool-outputs").innerHTML = "";

  document.getElementById("question-text").textContent = currentScenario.question;
  const optionsEl = document.getElementById("options-list");
  optionsEl.innerHTML = "";
  currentScenario.options.forEach((opt, idx) => {
    const item = document.createElement("div");
    item.className = "option-item";
    item.innerHTML = `<input type="radio" name="option" ${
      idx === 0 ? "" : ""
    } /> <span>${opt}</span>`;
    item.addEventListener("click", () => selectOption(idx));
    optionsEl.appendChild(item);
  });

  const fb = document.getElementById("feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";
  document.getElementById("check-btn").disabled = false;

  updateScorePill();
}

function toggleToolOutput(tool, btn) {
  const outputsEl = document.getElementById("tool-outputs");
  const existing = document.getElementById("output-" + tool.id);
  if (existing) {
    existing.remove();
    return;
  }
  const block = document.createElement("div");
  block.id = "output-" + tool.id;
  block.innerHTML = `<div class="terminal-output">${escapeHtml(tool.output)}</div>`;
  outputsEl.appendChild(block);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function selectOption(idx) {
  selectedOptionIndex = idx;
  document.querySelectorAll(".option-item").forEach((el, i) => {
    el.classList.toggle("selected", i === idx);
    el.querySelector("input").checked = i === idx;
  });
}

function checkAnswer() {
  if (selectedOptionIndex === null || !currentScenario) return;

  const correct = selectedOptionIndex === currentScenario.correctIndex;
  document.querySelectorAll(".option-item").forEach((el, i) => {
    if (i === currentScenario.correctIndex) el.classList.add("correct-answer");
    if (i === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
  });

  const fb = document.getElementById("feedback");
  fb.classList.remove("hidden");
  fb.className = "feedback-box " + (correct ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correct ? "Richtig!" : "Nicht ganz."}</strong> ${
    currentScenario.explanation
  }`;

  document.getElementById("check-btn").disabled = true;

  if (correct) {
    markSolved(currentScenario.id);
  }
}

function markSolved(id) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solved || []);
  solved.add(id);
  const solvedArr = Array.from(solved);
  const status = solvedArr.length >= SCENARIOS.length ? "done" : "progress";
  const wasDone = stored.status === "done";
  setModuleStatus(MODULE_ID, status, { solved: solvedArr });
  updateScorePill();
  if (status === "done" && !wasDone) {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
}

function updateScorePill() {
  const solved = loadSolvedSet();
  document.getElementById(
    "score-pill"
  ).textContent = `Geloest: ${solved.length} / ${SCENARIOS.length} Szenarien`;
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
  renderScenario();

  document.getElementById("check-btn").addEventListener("click", checkAnswer);
  document.getElementById("next-btn").addEventListener("click", renderScenario);
});
