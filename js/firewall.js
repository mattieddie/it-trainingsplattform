/*
 * firewall.js - Modul 3: Firewall-Regel-Puzzle
 *
 * Drei Aufgaben-Modi:
 *  - "reorder": eine feste Menge an Regeln ist vorgegeben, der Nutzer bringt
 *    sie nur in die richtige Reihenfolge.
 *  - "build": es gibt anfangs KEINE Regeln fuer EINE Firewall. Der Nutzer
 *    muss die Regeln (Quelle/Ziel/Port/Aktion) selbst entwerfen UND in die
 *    richtige Reihenfolge bringen.
 *  - "topology": komplexe Umgebung mit MEHREREN Firewalls (Perimeter,
 *    interne Firewall, ...) zwischen mehreren Netzsegmenten/Zonen (Internet,
 *    VPN-Zweigstelle, DMZ, LAN). Der Nutzer konfiguriert jede Firewall
 *    separat. Ein Testpaket muss JEDE Firewall auf seinem Weg passieren -
 *    erst wenn alle beteiligten Firewalls es erlauben, kommt es an.
 *
 * In allen Faellen wird nicht gegen eine "einzig richtige" Loesung
 * geprueft, sondern indem simulierte Testpakete durch die aktuellen Regeln
 * laufen ("erste passende Regel gewinnt", pro Firewall unabhaengig
 * ausgewertet) und das Ergebnis mit dem erwarteten Verhalten verglichen
 * wird. Das erlaubt mehrere gueltige Loesungen, solange das resultierende
 * Verhalten stimmt.
 */

const MODULE_ID = "firewall";

const PUZZLES = [
  {
    id: "puzzle-easy",
    mode: "reorder",
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
    mode: "reorder",
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
    mode: "reorder",
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
  {
    id: "puzzle-build-medium",
    mode: "build",
    difficulty: "medium",
    title: "🛠️ Selbst konfigurieren: Kleines Buero-Netzwerk",
    goal:
      "Es gibt noch keine einzige Regel - du musst sie komplett selbst anlegen (Quelle, Ziel, Port, Aktion) und richtig anordnen. Anforderungen:\n" +
      "• Das interne Netz 192.168.20.0/24 darf uneingeschraenkt ins Internet (jedes Ziel, jeder Port).\n" +
      "• Der Server 192.168.20.10 bietet auf Port 8080 einen Webdienst an, der von ueberall (auch aus dem Internet) erreichbar sein muss.\n" +
      "• SSH (Port 22) auf den Server 192.168.20.10 darf NUR vom Admin-PC 192.168.20.50 aus erfolgen - auch nicht von anderen internen Rechnern.\n" +
      "• Alles andere auf den Server ist zu blocken.",
    rules: [],
    tests: [
      { desc: "Admin-PC via SSH zum Server", source: "192.168.20.50", destination: "192.168.20.10", port: 22, expected: "Allow" },
      { desc: "Anderer interner PC via SSH zum Server", source: "192.168.20.77", destination: "192.168.20.10", port: 22, expected: "Deny" },
      { desc: "Externer Host via SSH zum Server", source: "8.8.8.8", destination: "192.168.20.10", port: 22, expected: "Deny" },
      { desc: "Interner PC surft ins Internet", source: "192.168.20.77", destination: "8.8.8.8", port: 443, expected: "Allow" },
      { desc: "Externer Host via Webdienst (8080)", source: "8.8.8.8", destination: "192.168.20.10", port: 8080, expected: "Allow" },
      { desc: "Interner PC via Webdienst (8080)", source: "192.168.20.77", destination: "192.168.20.10", port: 8080, expected: "Allow" },
      { desc: "Externer Host via RDP (3389) zum Server", source: "8.8.8.8", destination: "192.168.20.10", port: 3389, expected: "Deny" },
    ],
    sampleSolution: [
      { source: "192.168.20.50", destination: "192.168.20.10", port: "22", action: "Allow" },
      { source: "any", destination: "192.168.20.10", port: "22", action: "Deny" },
      { source: "192.168.20.0/24", destination: "any", port: "any", action: "Allow" },
      { source: "any", destination: "192.168.20.10", port: "8080", action: "Allow" },
    ],
    sampleSolutionNote:
      "Wichtig: Die beiden SSH-Regeln (Allow fuer den Admin-PC, danach Deny fuer alle anderen) muessen VOR der breiten 'internes Netz darf alles'-Regel stehen - sonst wuerden auch andere interne Rechner per SSH durchkommen.",
  },
  {
    id: "puzzle-build-hard",
    mode: "build",
    difficulty: "hard",
    title: "🛠️ Selbst konfigurieren: VPN, App-Server & Datenbank",
    goal:
      "Wieder komplett leer - alle Regeln selbst entwerfen. Anforderungen:\n" +
      "• Der Datenbankserver 10.0.30.5 ist besonders sensibel: NUR der Applikationsserver 10.0.20.5 darf ihn erreichen, und zwar ausschliesslich auf Port 5432 (PostgreSQL). Das gilt ausnahmslos - auch das VPN-Management darf hier nicht durch.\n" +
      "• Das VPN-Gateway 10.0.0.1 darf ansonsten auf alles zugreifen (Management-Zugriff).\n" +
      "• Der Applikationsserver 10.0.20.5 nimmt auf Port 443 Verbindungen von ueberall entgegen.\n" +
      "• Das interne Buero-Netz 10.0.10.0/24 darf den Applikationsserver zusaetzlich per SSH (22) verwalten.\n" +
      "• Alles andere ist zu blocken.",
    rules: [],
    tests: [
      { desc: "App-Server via PostgreSQL zur DB", source: "10.0.20.5", destination: "10.0.30.5", port: 5432, expected: "Allow" },
      { desc: "App-Server auf falschem Port zur DB", source: "10.0.20.5", destination: "10.0.30.5", port: 5433, expected: "Deny" },
      { desc: "VPN-Gateway versucht Zugriff auf DB", source: "10.0.0.1", destination: "10.0.30.5", port: 5432, expected: "Deny" },
      { desc: "Buero-Netz versucht Zugriff auf DB", source: "10.0.10.7", destination: "10.0.30.5", port: 5432, expected: "Deny" },
      { desc: "VPN-Gateway zum App-Server (beliebiger Port)", source: "10.0.0.1", destination: "10.0.20.5", port: 9999, expected: "Allow" },
      { desc: "Beliebiger Host via HTTPS zum App-Server", source: "8.8.8.8", destination: "10.0.20.5", port: 443, expected: "Allow" },
      { desc: "Buero-Netz via SSH zum App-Server", source: "10.0.10.7", destination: "10.0.20.5", port: 22, expected: "Allow" },
      { desc: "Externer Host via SSH zum App-Server", source: "8.8.8.8", destination: "10.0.20.5", port: 22, expected: "Deny" },
      { desc: "Externer Host zu einem Buero-PC", source: "8.8.8.8", destination: "10.0.10.50", port: 80, expected: "Deny" },
    ],
    sampleSolution: [
      { source: "10.0.20.5", destination: "10.0.30.5", port: "5432", action: "Allow" },
      { source: "any", destination: "10.0.30.5", port: "any", action: "Deny" },
      { source: "10.0.0.1", destination: "any", port: "any", action: "Allow" },
      { source: "any", destination: "10.0.20.5", port: "443", action: "Allow" },
      { source: "10.0.10.0/24", destination: "10.0.20.5", port: "22", action: "Allow" },
    ],
    sampleSolutionNote:
      "Entscheidend: die Deny-Regel fuer den Datenbankserver muss NACH der spezifischen App-Server-Erlaubnis, aber VOR der breiten VPN-Allow-Regel stehen. Sonst wuerde das VPN-Gateway die DB trotz 'ausnahmslos' erreichen koennen, weil seine Allow-alles-Regel zuerst greifen wuerde.",
  },
  {
    id: "puzzle-topo-dmz",
    mode: "topology",
    difficulty: "expert",
    title: "🏢 Komplexe Umgebung: Zwei Firewalls mit DMZ",
    topologyDiagram:
      "Internet\n" +
      "   │\n" +
      "[ Perimeter-Firewall ]\n" +
      "   │\n" +
      " DMZ  (172.16.0.0/24)  -  Web: .10   Mail: .25\n" +
      "   │\n" +
      "[ Interne Firewall ]\n" +
      "   │\n" +
      " LAN  (10.10.0.0/16)  -  Mail-Relay: 10.10.50.30   Mgmt-Netz: 10.10.99.0/24",
    goal:
      "Klassische Architektur mit zwei Firewalls in Reihe: Internet ↔ [Perimeter-FW] ↔ DMZ ↔ [Interne-FW] ↔ LAN. Konfiguriere BEIDE Firewalls unten (Reiter wechseln!). Anforderungen:\n" +
      "• Der DMZ-Webserver 172.16.0.10 ist aus dem Internet per HTTPS (443) erreichbar.\n" +
      "• Der DMZ-Mailserver 172.16.0.25 nimmt aus dem Internet SMTP (25) entgegen.\n" +
      "• NUR der interne Mail-Relay-Server 10.10.50.30 darf aus dem LAN auf den DMZ-Mailserver zugreifen (Port 25) - sonst darf niemand aus dem LAN in die DMZ.\n" +
      "• Administratoren im Management-Netz 10.10.99.0/24 duerfen den DMZ-Webserver zusaetzlich per SSH (22) verwalten.\n" +
      "• Aus dem Internet darf NIEMAND direkt auf das LAN zugreifen.\n" +
      "• Das LAN darf uneingeschraenkt ins Internet.",
    firewalls: [
      { id: "perimeter", label: "Perimeter-Firewall (Internet ↔ DMZ)" },
      { id: "internal", label: "Interne Firewall (DMZ ↔ LAN)" },
    ],
    tests: [
      { desc: "Internet → DMZ-Webserver (HTTPS)", source: "8.8.8.8", destination: "172.16.0.10", port: 443, expected: "Allow", path: ["perimeter"] },
      { desc: "Internet → DMZ-Mailserver (SMTP)", source: "8.8.8.8", destination: "172.16.0.25", port: 25, expected: "Allow", path: ["perimeter"] },
      { desc: "Internet → DMZ-Webserver, falscher Port (SSH)", source: "8.8.8.8", destination: "172.16.0.10", port: 22, expected: "Deny", path: ["perimeter"] },
      { desc: "Internet → LAN direkt", source: "8.8.8.8", destination: "10.10.5.7", port: 80, expected: "Deny", path: ["perimeter", "internal"] },
      { desc: "Mail-Relay (LAN) → DMZ-Mailserver", source: "10.10.50.30", destination: "172.16.0.25", port: 25, expected: "Allow", path: ["internal"] },
      { desc: "Normaler LAN-Host → DMZ-Mailserver", source: "10.10.5.7", destination: "172.16.0.25", port: 25, expected: "Deny", path: ["internal"] },
      { desc: "Admin (Mgmt-Netz) → DMZ-Webserver (SSH)", source: "10.10.99.5", destination: "172.16.0.10", port: 22, expected: "Allow", path: ["internal"] },
      { desc: "Normaler LAN-Host → DMZ-Webserver (SSH)", source: "10.10.5.7", destination: "172.16.0.10", port: 22, expected: "Deny", path: ["internal"] },
      { desc: "LAN-Host → Internet (HTTPS)", source: "10.10.5.7", destination: "8.8.8.8", port: 443, expected: "Allow", path: ["internal", "perimeter"] },
      { desc: "DMZ-Webserver → LAN-Host (unaufgefordert)", source: "172.16.0.10", destination: "10.10.5.7", port: 80, expected: "Deny", path: ["internal"] },
    ],
    sampleSolution: {
      perimeter: [
        { source: "any", destination: "172.16.0.10", port: "443", action: "Allow" },
        { source: "any", destination: "172.16.0.25", port: "25", action: "Allow" },
        { source: "10.10.0.0/16", destination: "any", port: "any", action: "Allow" },
      ],
      internal: [
        { source: "10.10.50.30", destination: "172.16.0.25", port: "25", action: "Allow" },
        { source: "10.10.99.0/24", destination: "172.16.0.10", port: "22", action: "Allow" },
        { source: "10.10.0.0/16", destination: "172.16.0.0/24", port: "any", action: "Deny" },
        { source: "10.10.0.0/16", destination: "any", port: "any", action: "Allow" },
      ],
    },
    sampleSolutionNote:
      "Ein Paket muss auf seinem gesamten Weg von JEDER Firewall erlaubt werden. Wichtig auf der internen Firewall: die beiden spezifischen Allow-Ausnahmen (Mail-Relay, Admin-SSH) muessen VOR der Deny-Regel fuer 'Rest vom LAN in die DMZ' stehen, und diese Deny-Regel wiederum VOR der breiten 'LAN darf alles'-Regel - sonst wuerde Letztere versehentlich auch Zugriffe auf die DMZ erlauben.",
  },
  {
    id: "puzzle-topo-vpn",
    mode: "topology",
    difficulty: "expert",
    title: "🌍 Komplexe Umgebung: VPN-Zweigstelle + DMZ + zwei Firewalls",
    topologyDiagram:
      "Internet          VPN-Zweigstelle (10.50.0.0/16)\n" +
      "     \\                /   (Site-to-Site-Tunnel, terminiert an Perimeter-FW)\n" +
      "      [   Perimeter-Firewall   ]\n" +
      "                │\n" +
      "     DMZ (172.16.0.0/24) - Web: .10\n" +
      "                │\n" +
      "      [   Interne Firewall     ]\n" +
      "                │\n" +
      "     Hauptsitz-LAN (10.10.0.0/16) - Datei-Server: 10.10.60.5",
    goal:
      "Zweigstelle B ist per Site-to-Site-VPN angebunden; der Tunnel terminiert direkt an der Perimeter-Firewall. Konfiguriere BEIDE Firewalls (Reiter wechseln!). Anforderungen:\n" +
      "• Der DMZ-Webserver 172.16.0.10 ist sowohl aus dem Internet als auch aus der VPN-Zweigstelle (10.50.0.0/16) per HTTPS (443) erreichbar.\n" +
      "• Die VPN-Zweigstelle darf zusaetzlich auf den Datei-Server im Hauptsitz-LAN 10.10.60.5 per SMB (Port 445) zugreifen - sonst auf NICHTS im Hauptsitz-LAN.\n" +
      "• Aus dem oeffentlichen Internet darf NIEMAND auf das Hauptsitz-LAN zugreifen - auch nicht auf den Datei-Server.\n" +
      "• Das Hauptsitz-LAN darf uneingeschraenkt ins Internet UND auf die VPN-Zweigstelle zugreifen.\n" +
      "• Alles andere ist zu blocken.",
    firewalls: [
      { id: "perimeter", label: "Perimeter-Firewall (Internet/VPN ↔ DMZ)" },
      { id: "internal", label: "Interne Firewall (DMZ ↔ Hauptsitz-LAN)" },
    ],
    tests: [
      { desc: "Internet → DMZ-Webserver (HTTPS)", source: "8.8.8.8", destination: "172.16.0.10", port: 443, expected: "Allow", path: ["perimeter"] },
      { desc: "VPN-Zweigstelle → DMZ-Webserver (HTTPS)", source: "10.50.5.10", destination: "172.16.0.10", port: 443, expected: "Allow", path: ["perimeter"] },
      { desc: "Internet → DMZ-Webserver, falscher Port", source: "8.8.8.8", destination: "172.16.0.10", port: 8080, expected: "Deny", path: ["perimeter"] },
      { desc: "VPN-Zweigstelle → Datei-Server (SMB)", source: "10.50.5.10", destination: "10.10.60.5", port: 445, expected: "Allow", path: ["perimeter", "internal"] },
      { desc: "VPN-Zweigstelle → anderer LAN-Host (SMB)", source: "10.50.5.10", destination: "10.10.5.7", port: 445, expected: "Deny", path: ["perimeter", "internal"] },
      { desc: "Internet → Datei-Server direkt", source: "8.8.8.8", destination: "10.10.60.5", port: 445, expected: "Deny", path: ["perimeter", "internal"] },
      { desc: "Internet → beliebiger LAN-Host", source: "8.8.8.8", destination: "10.10.5.7", port: 80, expected: "Deny", path: ["perimeter", "internal"] },
      { desc: "LAN-Host → Internet (HTTPS)", source: "10.10.5.7", destination: "8.8.8.8", port: 443, expected: "Allow", path: ["internal", "perimeter"] },
      { desc: "LAN-Host → VPN-Zweigstelle (RDP)", source: "10.10.5.7", destination: "10.50.5.10", port: 3389, expected: "Allow", path: ["internal", "perimeter"] },
      { desc: "DMZ-Webserver → LAN-Host (unaufgefordert)", source: "172.16.0.10", destination: "10.10.5.7", port: 80, expected: "Deny", path: ["internal"] },
    ],
    sampleSolution: {
      perimeter: [
        { source: "any", destination: "172.16.0.10", port: "443", action: "Allow" },
        { source: "10.50.0.0/16", destination: "10.10.60.5", port: "445", action: "Allow" },
        { source: "10.10.0.0/16", destination: "any", port: "any", action: "Allow" },
      ],
      internal: [
        { source: "10.50.0.0/16", destination: "10.10.60.5", port: "445", action: "Allow" },
        { source: "10.50.0.0/16", destination: "10.10.0.0/16", port: "any", action: "Deny" },
        { source: "10.10.0.0/16", destination: "any", port: "any", action: "Allow" },
      ],
    },
    sampleSolutionNote:
      "Die SMB-Ausnahme fuer die VPN-Zweigstelle muss auf BEIDEN Firewalls stehen, da der Verkehr beide Hops durchqueren muss. Auf der internen Firewall muss diese Ausnahme VOR der Deny-Regel fuer 'Rest der Zweigstelle ins LAN' stehen, und diese wiederum VOR der breiten 'LAN darf alles'-Regel. Da der DMZ-Webserver direkt am Perimeter haengt, braucht die interne Firewall dafuer keine eigene Regel.",
  },
];

let currentPuzzle = null;
let currentOrder = []; // Array von Rule-Objekten in aktueller Reihenfolge (aktive Firewall bei Topologie-Puzzles)
let dragFromIndex = null;

// Nur fuer mode "topology": Regeln pro Firewall-ID, plus welche Firewall gerade bearbeitet wird.
let topologyState = {};
let activeFirewallId = null;

/* ---------------- IP/CIDR-Matching (einfache Teilmenge) ---------------- */

function ipToInt(ip) {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function isValidIpLiteral(value) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) &&
    value.split(".").every((o) => Number(o) >= 0 && Number(o) <= 255);
}

function fieldMatches(fieldValue, actualIp) {
  const value = (fieldValue || "").trim();
  if (value === "" || value.toLowerCase() === "any") return true;
  if (value.includes("/")) {
    const [base, bitsStr] = value.split("/");
    const bits = Number(bitsStr);
    if (!isValidIpLiteral(base) || Number.isNaN(bits)) return false;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ipToInt(base) & mask) === (ipToInt(actualIp) & mask);
  }
  return value === actualIp;
}

function portMatches(fieldValue, actualPort) {
  const value = (fieldValue || "").trim();
  if (value === "" || value.toLowerCase() === "any") return true;
  return Number(value) === Number(actualPort);
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

/** Ein Paket muss JEDE Firewall auf seinem Weg passieren - die erste, die es
 * ablehnt (oder gar keine Regel dafuer hat), stoppt es. */
function simulateTopologyPacket(rulesByFirewall, path, packet) {
  for (const fwId of path) {
    const rules = rulesByFirewall[fwId] || [];
    if (simulatePacket(rules, packet) !== "Allow") {
      return "Deny";
    }
  }
  return "Allow";
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderPuzzle(puzzleId) {
  currentPuzzle = PUZZLES.find((p) => p.id === puzzleId) || PUZZLES[0];
  const mode = currentPuzzle.mode;

  document.getElementById("puzzle-title").textContent = currentPuzzle.title;
  document.getElementById("puzzle-goal").innerHTML = escapeHtml(
    currentPuzzle.goal
  ).replace(/\n/g, "<br>");

  const diffBadge = document.getElementById("puzzle-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer", expert: "Experte" }[
      currentPuzzle.difficulty
    ];
  diffBadge.className = "badge difficulty-" + currentPuzzle.difficulty;

  const modeBadge = document.getElementById("puzzle-mode-badge");
  const modeLabels = {
    reorder: "Reihenfolge-Puzzle",
    build: "Regeln selbst erstellen",
    topology: "Mehrere Firewalls konfigurieren",
  };
  modeBadge.textContent = modeLabels[mode];
  modeBadge.className = "badge " + (mode === "reorder" ? "status-none" : "status-progress");

  const diagramEl = document.getElementById("topology-diagram");
  if (mode === "topology" && currentPuzzle.topologyDiagram) {
    diagramEl.textContent = currentPuzzle.topologyDiagram;
    diagramEl.classList.remove("hidden");
  } else {
    diagramEl.classList.add("hidden");
  }

  const subtabsEl = document.getElementById("firewall-subtabs");
  subtabsEl.innerHTML = "";
  if (mode === "topology") {
    subtabsEl.classList.remove("hidden");
    topologyState = {};
    currentPuzzle.firewalls.forEach((fw) => {
      topologyState[fw.id] = [];
    });
    activeFirewallId = currentPuzzle.firewalls[0].id;
    renderFirewallSubtabs();
    currentOrder = topologyState[activeFirewallId];
  } else {
    subtabsEl.classList.add("hidden");
    currentOrder = mode === "build" ? [] : shuffle(currentPuzzle.rules);
  }

  const isEditable = mode === "build" || mode === "topology";
  document.getElementById("add-rule-btn").classList.toggle("hidden", !isEditable);
  document.getElementById("clear-rules-btn").classList.toggle("hidden", !isEditable);
  document.getElementById("shuffle-btn").classList.toggle("hidden", isEditable);

  renderSampleSolution();
  renderRuleList();
  document.getElementById("test-results").innerHTML = "";
  updateSolvedBadge();
}

function renderFirewallSubtabs() {
  const subtabsEl = document.getElementById("firewall-subtabs");
  subtabsEl.innerHTML = "";
  currentPuzzle.firewalls.forEach((fw) => {
    const btn = document.createElement("button");
    btn.className = "btn small" + (fw.id === activeFirewallId ? " active" : "");
    const count = topologyState[fw.id] ? topologyState[fw.id].length : 0;
    btn.textContent = `🧱 ${fw.label} (${count})`;
    btn.addEventListener("click", () => {
      activeFirewallId = fw.id;
      currentOrder = topologyState[activeFirewallId];
      renderFirewallSubtabs();
      renderRuleList();
    });
    subtabsEl.appendChild(btn);
  });
}

function renderSampleSolution() {
  const sampleBox = document.getElementById("sample-solution");
  const mode = currentPuzzle.mode;

  if (mode === "build" && currentPuzzle.sampleSolution) {
    sampleBox.classList.remove("hidden");
    sampleBox.innerHTML = `
      <summary>🔎 Musterloesung anzeigen (erst versuchen!)</summary>
      ${renderSampleRuleTable(currentPuzzle.sampleSolution)}
      ${
        currentPuzzle.sampleSolutionNote
          ? `<p class="text-muted" style="margin-top:8px;">${currentPuzzle.sampleSolutionNote}</p>`
          : ""
      }
    `;
  } else if (mode === "topology" && currentPuzzle.sampleSolution) {
    sampleBox.classList.remove("hidden");
    sampleBox.innerHTML = `
      <summary>🔎 Musterloesung anzeigen (erst versuchen!)</summary>
      ${currentPuzzle.firewalls
        .map(
          (fw) => `
        <p style="margin:10px 0 4px; font-weight:600;">${fw.label}</p>
        ${renderSampleRuleTable(currentPuzzle.sampleSolution[fw.id] || [])}
      `
        )
        .join("")}
      ${
        currentPuzzle.sampleSolutionNote
          ? `<p class="text-muted" style="margin-top:8px;">${currentPuzzle.sampleSolutionNote}</p>`
          : ""
      }
    `;
  } else {
    sampleBox.classList.add("hidden");
    sampleBox.innerHTML = "";
  }
}

function renderSampleRuleTable(rules) {
  return `
    <ul class="rule-list" style="margin-top:6px;">
      ${rules
        .map(
          (r, i) => `<li class="rule-item" style="cursor:default;">
            <div class="rule-index">${i + 1}</div>
            <div><span class="rule-field-label">Quelle</span>${r.source}</div>
            <div><span class="rule-field-label">Ziel</span>${r.destination}</div>
            <div><span class="rule-field-label">Port</span>${r.port}</div>
            <div><span class="rule-field-label">Aktion</span>
              <span class="${r.action === "Allow" ? "action-allow" : "action-deny"}">${r.action}</span>
            </div>
            <div></div>
          </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderRuleList() {
  const list = document.getElementById("rule-list");
  list.innerHTML = "";
  const isEditable = currentPuzzle.mode === "build" || currentPuzzle.mode === "topology";

  if (isEditable && currentOrder.length === 0) {
    const empty = document.createElement("li");
    empty.className = "text-muted";
    empty.style.padding = "10px 4px";
    empty.textContent =
      "Noch keine Regeln - klicke auf \"Regel hinzufuegen\", um zu starten.";
    list.appendChild(empty);
    return;
  }

  currentOrder.forEach((rule, idx) => {
    const li = document.createElement("li");
    li.className = "rule-item";
    li.draggable = true;
    li.dataset.index = String(idx);

    const fieldsHtml = isEditable
      ? `
        <div>
          <span class="rule-field-label">Quelle</span>
          <input class="rule-field-input" data-field="source" value="${rule.source}" placeholder="any / IP / CIDR" />
        </div>
        <div>
          <span class="rule-field-label">Ziel</span>
          <input class="rule-field-input" data-field="destination" value="${rule.destination}" placeholder="any / IP / CIDR" />
        </div>
        <div>
          <span class="rule-field-label">Port</span>
          <input class="rule-field-input" data-field="port" value="${rule.port}" placeholder="any / Zahl" />
        </div>
        <div>
          <span class="rule-field-label">Aktion</span>
          <select class="rule-field-input" data-field="action">
            <option value="Allow" ${rule.action === "Allow" ? "selected" : ""}>Allow</option>
            <option value="Deny" ${rule.action === "Deny" ? "selected" : ""}>Deny</option>
          </select>
        </div>
      `
      : `
        <div><span class="rule-field-label">Quelle</span>${rule.source}</div>
        <div><span class="rule-field-label">Ziel</span>${rule.destination}</div>
        <div><span class="rule-field-label">Port</span>${rule.port}</div>
        <div><span class="rule-field-label">Aktion</span>
          <span class="${rule.action === "Allow" ? "action-allow" : "action-deny"}">${rule.action}</span>
        </div>
      `;

    li.innerHTML = `
      <div class="rule-index">${idx + 1}</div>
      ${fieldsHtml}
      <div class="reorder-btns">
        <button class="btn small" data-move="up" title="Nach oben">↑</button>
        <button class="btn small" data-move="down" title="Nach unten">↓</button>
        ${isEditable ? '<button class="btn small" data-move="delete" title="Regel loeschen">🗑</button>' : ""}
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
    const deleteBtn = li.querySelector('[data-move="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteRule(idx));
    }

    if (isEditable) {
      li.querySelectorAll(".rule-field-input").forEach((input) => {
        const eventName = input.tagName === "SELECT" ? "change" : "input";
        input.addEventListener(eventName, () => {
          currentOrder[idx][input.dataset.field] = input.value;
        });
      });
    }

    list.appendChild(li);
  });
}

function moveRule(fromIdx, toIdx) {
  const [moved] = currentOrder.splice(fromIdx, 1);
  currentOrder.splice(toIdx, 0, moved);
  dragFromIndex = null;
  renderRuleList();
}

function deleteRule(idx) {
  currentOrder.splice(idx, 1);
  renderRuleList();
  if (currentPuzzle.mode === "topology") renderFirewallSubtabs();
}

function addRule() {
  currentOrder.push({ source: "any", destination: "any", port: "any", action: "Deny" });
  renderRuleList();
  if (currentPuzzle.mode === "topology") renderFirewallSubtabs();
}

function runTests() {
  if (!currentPuzzle) return;
  const isTopology = currentPuzzle.mode === "topology";

  const results = currentPuzzle.tests.map((test) => {
    const actual = isTopology
      ? simulateTopologyPacket(topologyState, test.path, test)
      : simulatePacket(currentOrder, test);
    return { ...test, actual, pass: actual === test.expected };
  });

  const pathLabel = (test) => {
    if (!isTopology) return "";
    const labels = test.path.map(
      (fwId) => currentPuzzle.firewalls.find((f) => f.id === fwId)?.label || fwId
    );
    return ` [via ${labels.join(" → ")}]`;
  };

  const resultsEl = document.getElementById("test-results");
  resultsEl.innerHTML = `<div class="test-result-list">${results
    .map(
      (r) => `
      <div class="test-result-item ${r.pass ? "pass" : "fail"}">
        <span>${r.pass ? "✅" : "❌"} ${r.desc} (${r.source} → ${r.destination}:${r.port})${pathLabel(r)}</span>
        <span>erwartet <strong>${r.expected}</strong>, erhalten <strong>${r.actual}</strong></span>
      </div>`
    )
    .join("")}</div>`;

  const allPass = results.every((r) => r.pass);
  const summary = document.createElement("div");
  summary.className = "feedback-box " + (allPass ? "correct" : "incorrect");
  summary.innerHTML = allPass
    ? "<strong>Alle Tests bestanden!</strong> Diese Regeln erzeugen das gewuenschte Verhalten."
    : `<strong>${results.filter((r) => r.pass).length} / ${results.length} Tests bestanden.</strong> Ueberlege, welche Regel zuerst greifen sollte ("erste passende Regel gewinnt") und passe Regeln bzw. Reihenfolge an${
        isTopology ? " - denke daran, dass JEDE Firewall auf dem Weg zustimmen muss" : ""
      }.`;
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
  document.getElementById("add-rule-btn").addEventListener("click", addRule);
  document.getElementById("clear-rules-btn").addEventListener("click", () => {
    if (currentOrder.length === 0) return;
    const label =
      currentPuzzle.mode === "topology"
        ? `alle Regeln der aktuell ausgewaehlten Firewall`
        : "alle eigenen Regeln in diesem Puzzle";
    if (confirm(`Wirklich ${label} loeschen?`)) {
      currentOrder.length = 0;
      renderRuleList();
      document.getElementById("test-results").innerHTML = "";
      if (currentPuzzle.mode === "topology") renderFirewallSubtabs();
    }
  });
});
