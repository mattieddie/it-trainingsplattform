/*
 * dhcp-dns.js - Modul 2: DHCP/DNS-Troubleshooting-Szenarien
 * Alle Tool-Ausgaben (ipconfig, nslookup, ping, ...) sind fest hinterlegte
 * Text-Fixtures. Es wird nichts echtes ausgeführt oder abgefragt.
 */

const MODULE_ID = "dhcpdns";

const SCENARIOS = [
  {
    id: "apipa",
    difficulty: "easy",
    title: "Ticket #1042 - Kein Netzwerkzugriff",
    symptom:
      "Ein Nutzer meldet: 'Mein PC hat seit heute Morgen keine Internetverbindung mehr. Andere Kollegen im gleichen Büro haben keine Probleme.'",
    tools: [
      {
        id: "ipconfig",
        label: "ipconfig /all ausführen",
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
        label: "Kabel-/Link-Status prüfen",
        output:
`Netzwerkadapter-Status: Verbunden (Link up)
Übertragungsrate: 1 Gbps
Kabel: kein Fehler erkannt`,
      },
    ],
    question:
      "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der DHCP-Server ist nicht erreichbar oder der Adresspool ist erschöpft",
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
    difficulty: "easy",
    title: "Ticket #1055 - Webseiten laden nicht, Ping per IP funktioniert",
    symptom:
      "Ein Nutzer kann keine Webseiten mehr aufrufen. Er berichtet: 'Ich kann den Server per IP-Adresse anpingen, aber www.firma-intern.local erreiche ich nicht.'",
    tools: [
      {
        id: "ping-ip",
        label: "ping 10.0.5.20 ausführen",
        output:
`Ping wird ausgeführt für 10.0.5.20 mit 32 Bytes Daten:
Antwort von 10.0.5.20: Bytes=32 Zeit=1ms TTL=64
Antwort von 10.0.5.20: Bytes=32 Zeit=1ms TTL=64

Ping-Statistik für 10.0.5.20:
    Pakete: Gesendet = 2, Empfangen = 2, Verloren = 0 (0% Verlust)`,
      },
      {
        id: "ping-name",
        label: "ping www.firma-intern.local ausführen",
        output:
`Ping-Anforderung konnte Host "www.firma-intern.local" nicht finden.
Überprüfen Sie den Namen, und wiederholen Sie den Vorgang.`,
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
      "Ping per IP funktioniert - die grundlegende Netzwerkverbindung (Layer 3) steht also. Nur die Namensauflösung schlägt fehl, und nslookup zeigt 'Server failed'. Das zeigt klar auf ein Problem mit dem DNS-Server bzw. dessen Erreichbarkeit/Konfiguration.",
  },
  {
    id: "wrong-dns-result",
    difficulty: "medium",
    title: "Ticket #1061 - Falsche Webseite wird angezeigt",
    symptom:
      "Ein Nutzer ruft intranet.firma.local auf und landet auf einer völlig fremden Seite. Andere Dienste funktionieren normal.",
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
      "Der interne Webserver ist abgestürzt",
      "Die Subnetzmaske des Clients ist falsch",
      "Der DHCP-Server vergibt doppelte IP-Adressen",
    ],
    correctIndex: 0,
    explanation:
      "Der Client fragt einen externen DNS-Server (203.0.113.53) statt des internen Firmen-DNS (10.0.0.1) und bekommt dadurch für den internen Namen eine falsche, öffentliche IP-Adresse zurück. Lösung: korrekten internen DNS-Server (meist per DHCP) zuweisen.",
  },
  {
    id: "duplicate-ip",
    difficulty: "medium",
    title: "Ticket #1073 - Verbindung bricht immer wieder ab",
    symptom:
      "Ein Nutzer meldet sporadische Verbindungsabbrüche. Windows zeigt gelegentlich eine Meldung zu einem Adresskonflikt an.",
    tools: [
      {
        id: "popup",
        label: "Windows-Meldung anzeigen",
        output:
`Es besteht ein Adresskonflikt mit einem anderen System im Netzwerk.
Windows hat die IP-Adresse 10.0.5.44 deaktiviert, da diese bereits von
einem anderen Gerät (MAC 00-1A-2B-3C-4D-5E) im Netzwerk verwendet wird.`,
      },
      {
        id: "arp",
        label: "arp -a ausführen",
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
      "Windows meldet explizit einen Adresskonflikt: Zwei Geräte im Netz nutzen dieselbe IP-Adresse 10.0.5.44. Das passiert z.B. bei statisch vergebenen IPs, die sich mit dem DHCP-Pool überschneiden.",
  },
  {
    id: "wrong-gateway",
    difficulty: "medium",
    title: "Ticket #1080 - Internet geht nicht, lokales Netz schon",
    symptom:
      "Ein Nutzer kann Kollegen im lokalen Netz erreichen (Fileserver, Drucker), aber keine Internetseiten aufrufen.",
    tools: [
      {
        id: "ipconfig",
        label: "ipconfig ausführen",
        output:
`Ethernet-Adapter LAN-Verbindung:
   IPv4-Adresse. . . . . . . . . . . : 192.168.1.50
   Subnetzmaske. . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.2.1`,
      },
      {
        id: "ping-gw",
        label: "ping 192.168.2.1 (Gateway) ausführen",
        output:
`Ping wird ausgeführt für 192.168.2.1 mit 32 Bytes Daten:
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
      "Die Client-IP 192.168.1.50/24 liegt im Netz 192.168.1.0/24, das eingetragene Gateway 192.168.2.1 aber im Netz 192.168.2.0/24. Damit ist das Gateway aus Client-Sicht nicht erreichbar - lokale Kommunikation im eigenen Subnetz funktioniert trotzdem, das Internet (über das Gateway) aber nicht.",
  },
  {
    id: "stale-dns-cache",
    difficulty: "medium",
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
    Gültigkeitsdauer. . : 3218
    Datensatzlänge . . . : 4
    A (Host)-Datensatz . : 198.51.100.10   (alte IP)`,
      },
      {
        id: "nslookup",
        label: "nslookup www.beispiel-firma.ch 1.1.1.1 (öffentlicher DNS)",
        output:
`Server:  one.one.one.one
Address:  1.1.1.1

Name:    www.beispiel-firma.ch
Address: 203.0.113.200   (neue IP)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der lokale DNS-Cache enthält noch den alten Eintrag, dessen TTL noch nicht abgelaufen ist",
      "Der neue Server ist nicht erreichbar",
      "Der Nutzer hat die falsche URL eingegeben",
      "Ein Adresskonflikt verhindert den Zugriff auf den neuen Server",
    ],
    correctIndex: 0,
    explanation:
      "Ein öffentlicher DNS-Server liefert bereits die neue IP, der lokale Cache des Clients aber noch die alte - erkennbar an der TTL (Gültigkeitsdauer), die noch nicht abgelaufen ist. Lösung: Cache leeren (ipconfig /flushdns) oder auf Ablauf der TTL warten.",
  },
  {
    id: "rogue-dhcp",
    difficulty: "hard",
    title: "Ticket #1104 - Uneinheitliche Probleme im Grossraumbüro",
    symptom:
      "Im Grossraumbüro melden mehrere Nutzer unterschiedliche Probleme: Manche haben Internet, andere nicht; manche erreichen interne Server nicht, andere schon. Die Probleme traten auf, nachdem ein neuer Mitarbeiter seinen privaten WLAN-Router mitgebracht und per Kabel ans Netz angeschlossen hat.",
    tools: [
      {
        id: "ipconfig-a",
        label: "ipconfig /all - betroffener Client A",
        output:
`Ethernet-Adapter LAN-Verbindung:
   IPv4-Adresse. . . . . . . . . . . : 192.168.50.140
   Subnetzmaske. . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.50.1
   DHCP-Server . . . . . . . . . . . : 192.168.50.254
   DNS-Server. . . . . . . . . . . . : 192.168.50.254`,
      },
      {
        id: "ipconfig-b",
        label: "ipconfig /all - nicht betroffener Client B",
        output:
`Ethernet-Adapter LAN-Verbindung:
   IPv4-Adresse. . . . . . . . . . . : 192.168.50.87
   Subnetzmaske. . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.50.1
   DHCP-Server . . . . . . . . . . . : 192.168.50.10
   DNS-Server. . . . . . . . . . . . : 10.0.0.1`,
      },
      {
        id: "switch-stats",
        label: "Switch-Portstatistik prüfen",
        output:
`Port 03 (Client-Anschlüsse): normaler Traffic
Port 14 (neu angeschlossenes Gerät): stark erhöhter DHCP-Broadcast-Traffic
        (DHCPOFFER-Pakete von unbekanntem Absender 192.168.50.254)`,
      },
      {
        id: "asset-list",
        label: "Geräteliste: wem gehört 192.168.50.10?",
        output:
`Inventar-Datenbank:
192.168.50.10  -> offizieller DHCP-/DNS-Server (Server-Raum, dokumentiert)
192.168.50.254 -> kein Eintrag gefunden`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Ein nicht autorisierter (Rogue) DHCP-Server im Netz vergibt an einen Teil der Clients fehlerhafte Konfigurationen",
      "Der offizielle DHCP-Server 192.168.50.10 ist überlastet und antwortet nur noch teilweise",
      "Es liegt bei allen betroffenen Clients derselbe IP-Adresskonflikt vor",
      "Die Switch-Ports sind falsch auf verschiedene VLANs aufgeteilt",
      "Der DNS-Server 10.0.0.1 ist ausgefallen",
    ],
    correctIndex: 0,
    explanation:
      "Der mitgebrachte private Router beantwortet DHCP-Anfragen mit als eigener (nicht autorisierter) DHCP-Server unter 192.168.50.254 - inklusive falschem DNS-Server. Je nachdem, ob ein Client die Antwort des echten Servers (.10) oder des Rogue-Geräts (.254) zuerst erhält (DHCP-Race), bekommt er eine funktionierende oder eine fehlerhafte Konfiguration. Das erklärt die uneinheitlichen, scheinbar zufälligen Probleme. Lösung: Rogue-Gerät vom Netz trennen, ggf. DHCP-Snooping auf dem Switch aktivieren.",
  },
  {
    id: "split-horizon-dns",
    difficulty: "hard",
    title: "Ticket #1117 - Intranet nur im Büro erreichbar",
    symptom:
      "Ein Mitarbeiter im Homeoffice (VPN aktuell nicht verbunden) kann intranet.firma.ch nicht öffnen. Im Büro funktioniert derselbe Link für alle Kollegen einwandfrei.",
    tools: [
      {
        id: "nslookup-office",
        label: "nslookup intranet.firma.ch (Kollege im Büro)",
        output:
`Server:  dns-intern.firma.ch
Address:  10.0.0.1

Name:    intranet.firma.ch
Address: 10.0.5.20`,
      },
      {
        id: "nslookup-home",
        label: "nslookup intranet.firma.ch (Homeoffice, ohne VPN)",
        output:
`Server:  dns.provider-home.net
Address:  192.0.2.53

*** dns.provider-home.net kann intranet.firma.ch nicht finden: Non-existent domain`,
      },
      {
        id: "ping-home",
        label: "ping 10.0.5.20 (Homeoffice, ohne VPN)",
        output:
`Ping wird ausgeführt für 10.0.5.20 mit 32 Bytes Daten:
Zielhost nicht erreichbar.
Zielhost nicht erreichbar.`,
      },
      {
        id: "vpn-status",
        label: "VPN-Client-Status prüfen",
        output:
`VPN-Status: Getrennt
Letzte Verbindung: gestern, 18:42 Uhr`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der interne Name existiert nur in der internen (Split-Horizon-)DNS-Zone; ohne VPN wird der öffentliche DNS-Server befragt, der die Zone nicht kennt",
      "Der Mitarbeiter hat sein VPN-Passwort vergessen",
      "Der interne Webserver 10.0.5.20 ist ausgefallen",
      "Der Heimrouter blockiert ausgehende Verbindungen auf Port 443",
      "Die TTL des DNS-Eintrags ist gerade abgelaufen",
    ],
    correctIndex: 0,
    explanation:
      "Bei Split-Horizon- (bzw. Split-View-)DNS existieren für denselben Namen zwei getrennte Zonen: intern wird die private IP 10.0.5.20 geliefert, extern/öffentlich ist der Name gar nicht bekannt (Non-existent domain). Ohne aktive VPN-Verbindung befragt der Homeoffice-Client den DNS-Server des Heim-Providers statt des internen DNS-Servers - und selbst mit der IP wäre 10.0.5.20 von aussen ohnehin nicht direkt erreichbar (privates Netz). Lösung: VPN verbinden, bevor interne Ressourcen genutzt werden.",
  },
  {
    id: "missing-dhcp-relay",
    difficulty: "hard",
    title: "Ticket #1129 - Nach Router-Tausch keine IP-Adressen mehr in Zweigstelle B",
    symptom:
      "Nach dem Austausch des Routers in Zweigstelle B bekommt dort seit heute Morgen niemand mehr eine IP-Adresse per DHCP. Der DHCP-Server steht zentral in Zweigstelle A, in einem anderen Subnetz (10.0.1.0/24). Zweigstelle B nutzt 10.0.20.0/24.",
    tools: [
      {
        id: "ipconfig-b",
        label: "ipconfig - Client in Zweigstelle B",
        output:
`Ethernet-Adapter LAN-Verbindung:
   Autokonfigurations-IPv4-Adresse. : 169.254.12.9
   Subnetzmaske. . . . . . . . . . . : 255.255.0.0
   Standardgateway . . . . . . . . . :`,
      },
      {
        id: "router-config",
        label: "Router-Konfiguration Zweigstelle B (Ausschnitt, aktuell)",
        output:
`interface Vlan20
 ip address 10.0.20.1 255.255.255.0
! Hinweis: keine "ip helper-address" konfiguriert`,
      },
      {
        id: "router-config-old",
        label: "Router-Konfiguration Zweigstelle B (Backup vor dem Tausch)",
        output:
`interface Vlan20
 ip address 10.0.20.1 255.255.255.0
 ip helper-address 10.0.1.5`,
      },
      {
        id: "ping-dhcp",
        label: "Ping vom neuen Router zu 10.0.1.5 (DHCP-Server)",
        output:
`Ping wird ausgeführt für 10.0.1.5 mit 32 Bytes Daten:
Antwort von 10.0.1.5: Bytes=32 Zeit=8ms TTL=62
Antwort von 10.0.1.5: Bytes=32 Zeit=9ms TTL=62`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Dem neuen Router fehlt die DHCP-Relay-Konfiguration (IP-Helper), daher werden DHCP-Broadcasts nicht mehr an den zentralen DHCP-Server weitergeleitet",
      "Der zentrale DHCP-Server 10.0.1.5 hat keine freien Adressen mehr im Pool",
      "Die Subnetzmaske auf dem neuen Router wurde falsch eingetragen",
      "Der DNS-Server ist von Zweigstelle B aus nicht erreichbar",
      "In Zweigstelle B liegt ein Adresskonflikt vor",
    ],
    correctIndex: 0,
    explanation:
      "DHCP-Anfragen sind lokale Broadcasts und werden von Routern standardmässig NICHT in andere Subnetze weitergeleitet. Ein DHCP-Relay-Agent (IP-Helper-Adresse) leitet sie als Unicast an einen zentralen DHCP-Server weiter. Der Konfigurationsvergleich zeigt: Genau diese Zeile fehlt nach dem Router-Tausch. Da der Router den DHCP-Server aber grundsätzlich per Ping erreichen kann (Routing ist also in Ordnung), liegt das Problem konkret an der fehlenden Relay-Weiterleitung für DHCP-Broadcasts - nicht an Erreichbarkeit, Pool oder DNS.",
  },
  {
    id: "flaky-secondary-dns",
    difficulty: "hard",
    title: "Ticket #1136 - Namensauflösung funktioniert nur manchmal",
    symptom:
      "Ein Nutzer meldet, dass interne Anwendungen (z.B. intranet.firma.local) mal erreichbar sind und mal nicht - ohne erkennbares Muster. Ein Neustart des PCs hilft nur kurzzeitig.",
    tools: [
      {
        id: "ipconfig",
        label: "ipconfig /all (Ausschnitt DNS-Server)",
        output:
`DNS-Server. . . . . . . . . . . . : 10.0.0.1
                                     8.8.8.8`,
      },
      {
        id: "nslookup-primary",
        label: "nslookup intranet.firma.local 10.0.0.1",
        output:
`Server:  dns-intern.firma.local
Address:  10.0.0.1

Name:    intranet.firma.local
Address: 10.0.5.20`,
      },
      {
        id: "nslookup-secondary",
        label: "nslookup intranet.firma.local 8.8.8.8",
        output:
`Server:  dns.google
Address:  8.8.8.8

*** dns.google kann intranet.firma.local nicht finden: Server failed`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Als sekundärer DNS-Server ist ein öffentlicher DNS-Dienst eingetragen, der die interne Zone nicht kennt - wird er statt des internen Servers befragt, schlägt die Auflösung fehl",
      "Der DHCP-Server vergibt gelegentlich doppelte IP-Adressen",
      "Der interne DNS-Server 10.0.0.1 ist dauerhaft ausgefallen",
      "Die Netzwerkkarte des Clients hat einen Wackelkontakt",
      "Der Nutzer tippt den Namen gelegentlich falsch",
    ],
    correctIndex: 0,
    explanation:
      "Windows befragt konfigurierte DNS-Server nicht immer nur streng der Reihe nach - bei Verzögerungen oder Lastverteilung kann auch der sekundäre Server (hier: der öffentliche 8.8.8.8) drankommen. Ein öffentlicher DNS-Server kennt interne/private Zonen wie firma.local grundsätzlich nicht und liefert einen Fehler zurück. Das erklärt das 'mal geht's, mal nicht'-Verhalten. Lösung: als sekundären DNS-Server einen weiteren internen DNS-Server eintragen, keinen öffentlichen.",
  },
];

let currentScenario = null;
let selectedOptionIndex = null;

function loadSolvedSet() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solved) ? stored.solved : [];
}

function getSelectedDifficulty() {
  return document.getElementById("difficulty-select").value;
}

function scenariosForDifficulty(difficulty) {
  if (difficulty === "all") return SCENARIOS;
  return SCENARIOS.filter((s) => s.difficulty === difficulty);
}

function pickScenario() {
  const difficulty = getSelectedDifficulty();
  const candidates = scenariosForDifficulty(difficulty);
  const solved = loadSolvedSet();
  const unsolved = candidates.filter((s) => !solved.includes(s.id));
  const pool = unsolved.length > 0 ? unsolved : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderScenario() {
  currentScenario = pickScenario();
  selectedOptionIndex = null;

  document.getElementById("ticket-title").textContent = currentScenario.title;
  document.getElementById("ticket-symptom").textContent = currentScenario.symptom;

  const diffBadge = document.getElementById("ticket-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentScenario.difficulty];
  diffBadge.className = "badge difficulty-" + currentScenario.difficulty;

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
  const shuffledOrder = shuffleArray(currentScenario.options.map((_, i) => i));
  shuffledOrder.forEach((idx) => {
    const opt = currentScenario.options[idx];
    const item = document.createElement("div");
    item.className = "option-item";
    item.dataset.origIndex = String(idx);
    item.innerHTML = `<input type="radio" name="option" /> <span>${opt}</span>`;
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
  document.querySelectorAll(".option-item").forEach((el) => {
    const match = Number(el.dataset.origIndex) === idx;
    el.classList.toggle("selected", match);
    el.querySelector("input").checked = match;
  });
}

function checkAnswer() {
  if (selectedOptionIndex === null || !currentScenario) return;

  const correct = selectedOptionIndex === currentScenario.correctIndex;
  document.querySelectorAll(".option-item").forEach((el) => {
    const origIdx = Number(el.dataset.origIndex);
    if (origIdx === currentScenario.correctIndex) el.classList.add("correct-answer");
    if (origIdx === selectedOptionIndex && !correct) el.classList.add("wrong-answer");
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
  ).textContent = `Gelöst: ${solved.length} / ${SCENARIOS.length} Szenarien`;
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }
  renderScenario();

  document.getElementById("check-btn").addEventListener("click", checkAnswer);
  document.getElementById("next-btn").addEventListener("click", renderScenario);
  document
    .getElementById("difficulty-select")
    .addEventListener("change", renderScenario);
});
