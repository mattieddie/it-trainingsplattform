/*
 * terminal.js - Modul 6: CMD & PowerShell Terminal-Trainer
 * Simuliertes Terminal: es wird NICHTS echtes ausgeführt. Eingetippte
 * Befehle werden nur gegen Muster (RegExp) geprüft; bei Treffer wird ein
 * fest hinterlegter, realistisch wirkender Beispiel-Output angezeigt.
 */

const MODULE_ID = "terminal";
const MAX_WRONG_BEFORE_HINT = 2;

const CHALLENGES = [
  {
    id: "ipconfig",
    shell: "cmd",
    difficulty: "easy",
    task: "Zeige deine aktuelle IP-Konfiguration an (CMD).",
    accept: [/^ipconfig(\s+\/all)?$/i],
    output:
`Windows-IP-Konfiguration

Ethernet-Adapter LAN-Verbindung:
   Verbindungsspezifisches DNS-Suffix: firma.local
   IPv4-Adresse. . . . . . . . . . . : 192.168.1.45
   Subnetzmaske. . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.1.1`,
    hint: "Der klassische CMD-Befehl für die Netzwerkkonfiguration lautet schlicht \"ipconfig\".",
    explanation: "\"ipconfig\" zeigt die IP-Konfiguration aller Netzwerkadapter. Mit \"/all\" gibt es zusätzlich MAC-Adresse, DHCP- und DNS-Server aus.",
  },
  {
    id: "ping",
    shell: "cmd",
    difficulty: "easy",
    task: "Prüfe per CMD, ob der Host 8.8.8.8 erreichbar ist.",
    accept: [/^ping\s+8\.8\.8\.8(\s+-n\s*\d+)?$/i],
    output:
`Ping wird ausgeführt für 8.8.8.8 mit 32 Bytes Daten:
Antwort von 8.8.8.8: Bytes=32 Zeit=14ms TTL=115
Antwort von 8.8.8.8: Bytes=32 Zeit=13ms TTL=115

Ping-Statistik für 8.8.8.8:
    Pakete: Gesendet = 2, Empfangen = 2, Verloren = 0 (0% Verlust)`,
    hint: "Erreichbarkeit prüft man mit \"ping\" gefolgt von der Zieladresse.",
    explanation: "\"ping\" sendet ICMP-Echo-Requests an die angegebene Adresse und misst, ob und wie schnell geantwortet wird.",
  },
  {
    id: "tasklist",
    shell: "cmd",
    difficulty: "easy",
    task: "Zeige alle laufenden Prozesse in der CMD an.",
    accept: [/^tasklist$/i],
    output:
`Systemprozessname                Sitzungsname        PID  Speichern
========================= ================ ======== ===========
System Idle Process              Services              0        8 K
svchost.exe                      Services            812    9.876 K
explorer.exe                     Console            2140   64.320 K
notepad.exe                      Console            5544   11.204 K`,
    hint: "In der CMD heisst der Befehl für die Prozessliste \"tasklist\".",
    explanation: "\"tasklist\" listet alle laufenden Prozesse mit PID und Speicherverbrauch auf - das CMD-Pendant zum Task-Manager.",
  },
  {
    id: "dir",
    shell: "cmd",
    difficulty: "easy",
    task: "Liste den Inhalt des aktuellen Verzeichnisses per CMD auf.",
    accept: [/^dir$/i],
    output:
`Datenträger in Laufwerk C: ist Windows
 Verzeichnis von C:\\Users\\azubi

03.09.2026  09:12    <DIR>          Desktop
03.09.2026  09:12    <DIR>          Dokumente
03.09.2026  08:47             1'024 notizen.txt
               1 Datei(en),      1'024 Bytes`,
    hint: "Der klassische CMD-Befehl für eine Verzeichnisliste ist \"dir\".",
    explanation: "\"dir\" zeigt Dateien und Unterordner des aktuellen Verzeichnisses inkl. Datum und Grösse.",
  },
  {
    id: "get-process",
    shell: "powershell",
    difficulty: "easy",
    task: "Zeige alle laufenden Prozesse mit PowerShell an.",
    accept: [/^get-process$/i],
    output:
`Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  ProcessName
-------  ------    -----      -----     ------     --  -----------
    412      22    41200      68900       4.20   2140  explorer
    180      14    18500      22100       0.55   5544  notepad
    650      35    62000      88400      12.10    812  svchost`,
    hint: "Das PowerShell-Cmdlet für die Prozessliste heisst \"Get-Process\".",
    explanation: "\"Get-Process\" liefert (im Gegensatz zu tasklist) ein strukturiertes .NET-Objekt pro Prozess - dadurch lässt es sich leicht filtern und weiterverarbeiten, z.B. mit \"| Where-Object\".",
  },
  {
    id: "get-service",
    shell: "powershell",
    difficulty: "easy",
    task: "Zeige alle Dienste (Services) mit PowerShell an.",
    accept: [/^get-service$/i],
    output:
`Status   Name               DisplayName
------   ----               -----------
Running  Spooler            Druckwarteschlange
Running  W32Time            Windows-Zeitgeber
Stopped  Fax                Fax`,
    hint: "Das PowerShell-Cmdlet für Dienste heisst \"Get-Service\".",
    explanation: "\"Get-Service\" zeigt alle registrierten Windows-Dienste mit ihrem aktuellen Status (Running/Stopped).",
  },
  {
    id: "tracert",
    shell: "cmd",
    difficulty: "medium",
    task: "Zeige per CMD alle Zwischenstationen (Hops) auf dem Weg zu google.com an.",
    accept: [/^tracert\s+google\.com$/i],
    output:
`Routenverfolgung zu google.com [142.250.185.78]
über maximal 30 Abschnitte:

  1     1 ms     1 ms     1 ms  192.168.1.1
  2     8 ms     7 ms     8 ms  10.10.0.1
  3    14 ms    13 ms    14 ms  provider-core-1.net
  4    15 ms    14 ms    15 ms  142.250.185.78

Ablaufverfolgung beendet.`,
    hint: "Der CMD-Befehl für die Routenverfolgung heisst \"tracert\" (traceroute).",
    explanation: "\"tracert\" zeigt jede Zwischenstation (Router-Hop) auf dem Weg zum Ziel inkl. Latenz - hilfreich, um zu sehen, wo genau eine Verbindung ins Stocken gerät.",
  },
  {
    id: "netstat",
    shell: "cmd",
    difficulty: "medium",
    task: "Zeige per CMD alle aktiven Verbindungen und lauschenden Ports an.",
    accept: [/^netstat\s+-an$/i, /^netstat$/i],
    output:
`Aktive Verbindungen

  Proto  Lokale Adresse        Remoteadresse         Status
  TCP    0.0.0.0:135           0.0.0.0:0             ABHOEREN
  TCP    192.168.1.45:52344    142.250.185.78:443    HERGESTELLT
  TCP    0.0.0.0:445           0.0.0.0:0             ABHOEREN`,
    hint: "Für Netzwerkverbindungen/Ports in der CMD: \"netstat\" (am besten mit \"-an\" für numerische Ausgabe aller Verbindungen).",
    explanation: "\"netstat -an\" zeigt alle TCP/UDP-Verbindungen und lauschenden Ports numerisch an - nützlich, um offene Ports oder verdächtige Verbindungen zu finden.",
  },
  {
    id: "nslookup",
    shell: "cmd",
    difficulty: "medium",
    task: "Löse den Hostnamen google.com per CMD in eine IP-Adresse auf.",
    accept: [/^nslookup\s+google\.com$/i],
    output:
`Server:  dns-intern.firma.local
Address:  10.0.0.1

Nicht autorisierte Antwort:
Name:    google.com
Address: 142.250.185.78`,
    hint: "DNS-Auflösung in der CMD: \"nslookup\" gefolgt vom Hostnamen.",
    explanation: "\"nslookup\" fragt einen DNS-Server direkt ab und zeigt, welche IP-Adresse für einen Namen zurückgegeben wird.",
  },
  {
    id: "test-netconnection",
    shell: "powershell",
    difficulty: "medium",
    task: "Teste mit PowerShell, ob google.com erreichbar ist.",
    accept: [/^test-netconnection\s+google\.com$/i, /^test-connection\s+google\.com$/i],
    output:
`ComputerName           : google.com
RemoteAddress          : 142.250.185.78
TcpTestSucceeded       : True
PingSucceeded          : True
PingReplyDetails (RTT) : 14 ms`,
    hint: "Das modernere PowerShell-Pendant zu ping heisst \"Test-NetConnection\" (oder \"Test-Connection\").",
    explanation: "\"Test-NetConnection\" liefert - anders als ping - strukturierte Zusatzinfos wie TCP-Testergebnis und Route, was es für Skripte deutlich praktischer macht.",
  },
  {
    id: "get-netipconfiguration",
    shell: "powershell",
    difficulty: "medium",
    task: "Zeige die IP-Konfiguration aller Netzwerkadapter mit PowerShell an.",
    accept: [/^get-netipconfiguration$/i],
    output:
`InterfaceAlias       : Ethernet
IPv4Address          : 192.168.1.45
IPv4DefaultGateway    : 192.168.1.1
DNSServer             : 10.0.0.1`,
    hint: "Das PowerShell-Pendant zu \"ipconfig\" heisst \"Get-NetIPConfiguration\".",
    explanation: "\"Get-NetIPConfiguration\" liefert dieselben Informationen wie \"ipconfig\", aber als durchsuchbares/filterbares PowerShell-Objekt statt reinem Text.",
  },
  {
    id: "restart-service",
    shell: "powershell",
    difficulty: "medium",
    task: "Starte den Dienst \"Spooler\" (Druckwarteschlange) mit PowerShell neu.",
    accept: [/^restart-service\s+(-name\s+)?"?spooler"?$/i],
    output:
`WARNUNG: Warte auf Dienst 'Print Spooler (Spooler)', um den Status "Gestoppt" zu erreichen...
Dienst "Spooler" wurde erfolgreich neu gestartet.`,
    hint: "Dienste startet man mit PowerShell per \"Restart-Service <Dienstname>\" neu.",
    explanation: "\"Restart-Service\" stoppt und startet einen Windows-Dienst - klassischer Fix bei hängenden Diensten wie dem Druckerspooler.",
  },
  {
    id: "systeminfo",
    shell: "cmd",
    difficulty: "hard",
    task: "Zeige per CMD detaillierte Systeminformationen an (OS-Version, installierte Hotfixes usw.).",
    accept: [/^systeminfo$/i],
    output:
`Hostname:                  PC-AZUBI-05
Betriebssystemname:        Microsoft Windows 11 Enterprise
Systemtyp:                 x64-basierter PC
Installierte Hotfixes:     [15]: KB5034123, KB5031354, ...
Gesamter phys. Speicher:   16'384 MB`,
    hint: "Ausführliche Systeminfos liefert in der CMD der Befehl \"systeminfo\" (ohne Parameter).",
    explanation: "\"systeminfo\" fasst OS-Version, Hardware, Domänenzugehörigkeit und installierte Patches in einer Übersicht zusammen - nützlich für Inventarisierung und Patch-Kontrolle.",
  },
  {
    id: "taskkill",
    shell: "cmd",
    difficulty: "hard",
    task: "Beende den Prozess \"notepad.exe\" zwangsweise per CMD.",
    accept: [/^taskkill\s+\/im\s+notepad\.exe\s+\/f$/i, /^taskkill\s+\/f\s+\/im\s+notepad\.exe$/i],
    output:
`ERFOLGREICH: Der Prozess "notepad.exe" mit PID 5544 wurde beendet.`,
    hint: "Prozesse beendet man in der CMD mit \"taskkill /IM <prozessname> /F\" (F = erzwingen).",
    explanation: "\"taskkill /IM notepad.exe /F\" beendet den Prozess anhand seines Namens (Image Name) zwangsweise (\"/F\") - Alternative: \"/PID <nummer>\" für einen bestimmten Prozess.",
  },
  {
    id: "get-eventlog",
    shell: "powershell",
    difficulty: "hard",
    task: "Zeige die 10 neuesten Einträge aus dem System-Ereignisprotokoll mit PowerShell an.",
    accept: [/^get-eventlog\s+-logname\s+system\s+-newest\s+10$/i, /^get-winevent\s+-logname\s+system\s+-maxevents\s+10$/i],
    output:
`Index Time          EntryType  Source          Message
----- ----          ---------  ------          -------
41822 09:11:03       Information  Service Control  Der Dienst "Spooler" wurde gestartet.
41821 08:59:47       Warning      Kernel-Power     Das System ist aus dem Standbymodus erwacht.
41820 08:47:15       Information  Service Control  Der Dienst "W32Time" wurde gestartet.`,
    hint: "Ereignisprotokolle liest man mit \"Get-EventLog -LogName System -Newest 10\" (oder dem neueren \"Get-WinEvent\").",
    explanation: "\"Get-EventLog\" (klassisch) bzw. \"Get-WinEvent\" (moderner, schneller) lesen Windows-Ereignisprotokolle aus - essenziell für Fehlersuche und Sicherheitsanalyse.",
  },
  {
    id: "set-executionpolicy",
    shell: "powershell",
    difficulty: "hard",
    task: "Setze die PowerShell-Ausführungsrichtlinie (Execution Policy) für den aktuellen Benutzer auf \"RemoteSigned\".",
    accept: [/^set-executionpolicy\s+(-scope\s+currentuser\s+)?remotesigned(\s+-scope\s+currentuser)?$/i],
    output:
`Ausführungsrichtlinie geändert.
Die Ausführungsrichtlinie hilft, Sie vor Skripts zu schützen, denen Sie nicht vertrauen.
Möchten Sie die Ausführungsrichtlinie ändern? [J] Ja  [N] Nein: J`,
    hint: "Der Befehl lautet \"Set-ExecutionPolicy RemoteSigned\" (optional mit \"-Scope CurrentUser\").",
    explanation: "\"RemoteSigned\" erlaubt lokal erstellte Skripte ohne Signatur, verlangt aber eine gültige digitale Signatur für aus dem Internet heruntergeladene Skripte - ein gängiger Mittelweg zwischen \"Restricted\" und \"Unrestricted\".",
  },
];

let currentChallenge = null;
let wrongAttempts = 0;
let terminalLines = [];

function loadSolvedSet() {
  const progress = loadProgress();
  const stored = progress[MODULE_ID];
  return stored && Array.isArray(stored.solved) ? stored.solved : [];
}

function getSelectedDifficulty() {
  return document.getElementById("difficulty-select").value;
}

function getSelectedShell() {
  return document.getElementById("shell-select").value;
}

function candidatePool() {
  const difficulty = getSelectedDifficulty();
  const shell = getSelectedShell();
  return CHALLENGES.filter(
    (c) =>
      (difficulty === "all" || c.difficulty === difficulty) &&
      (shell === "all" || c.shell === shell)
  );
}

function pickChallenge() {
  const candidates = candidatePool();
  const solved = loadSolvedSet();
  const unsolved = candidates.filter((c) => !solved.includes(c.id));
  const pool = unsolved.length > 0 ? unsolved : candidates;
  return pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : null;
}

function promptPrefix(shell) {
  return shell === "powershell" ? "PS C:\\Users\\azubi>" : "C:\\Users\\azubi>";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTerminal() {
  const el = document.getElementById("terminal-screen");
  el.innerHTML = terminalLines
    .map((line) => {
      if (line.type === "cmd") {
        return `<div>${escapeHtml(line.prompt)} <span style="color:#fff;">${escapeHtml(line.text)}</span></div>`;
      }
      if (line.type === "output") {
        return `<div style="white-space:pre-wrap; margin:4px 0 10px;">${escapeHtml(line.text)}</div>`;
      }
      return `<div style="color:#ff8a8a; margin-bottom:6px;">${escapeHtml(line.text)}</div>`;
    })
    .join("");
  el.scrollTop = el.scrollHeight;
}

function renderChallenge() {
  currentChallenge = pickChallenge();
  wrongAttempts = 0;
  terminalLines = [];

  const fb = document.getElementById("feedback");
  fb.className = "feedback-box hidden";
  fb.innerHTML = "";
  document.getElementById("hint-box").classList.add("hidden");

  if (!currentChallenge) {
    document.getElementById("task-text").textContent =
      "Keine Aufgaben für diese Filterkombination gefunden - wähle andere Filter.";
    document.getElementById("cmd-input").disabled = true;
    renderTerminal();
    return;
  }

  document.getElementById("cmd-input").disabled = false;
  document.getElementById("cmd-input").value = "";
  document.getElementById("cmd-input").focus();

  document.getElementById("task-text").textContent = currentChallenge.task;

  const shellBadge = document.getElementById("shell-badge");
  shellBadge.textContent = currentChallenge.shell === "powershell" ? "PowerShell" : "CMD";
  shellBadge.className =
    "badge " + (currentChallenge.shell === "powershell" ? "status-progress" : "status-none");

  const diffBadge = document.getElementById("challenge-difficulty-badge");
  diffBadge.textContent =
    { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[currentChallenge.difficulty];
  diffBadge.className = "badge difficulty-" + currentChallenge.difficulty;

  document.getElementById("prompt-prefix").textContent = promptPrefix(currentChallenge.shell);

  renderTerminal();
  updateScorePill();
}

function submitCommand() {
  if (!currentChallenge) return;
  const input = document.getElementById("cmd-input");
  const raw = input.value;
  if (!raw.trim()) return;

  const normalized = raw.trim().replace(/\s+/g, " ");
  const prompt = promptPrefix(currentChallenge.shell);
  terminalLines.push({ type: "cmd", prompt, text: raw });

  const isCorrect = currentChallenge.accept.some((pattern) => pattern.test(normalized));

  if (isCorrect) {
    terminalLines.push({ type: "output", text: currentChallenge.output });
    renderTerminal();
    input.value = "";
    input.disabled = true;

    const fb = document.getElementById("feedback");
    fb.className = "feedback-box correct";
    fb.innerHTML = `<strong>Richtig!</strong> ${currentChallenge.explanation}`;

    markSolved(currentChallenge.id);
  } else {
    wrongAttempts++;
    terminalLines.push({
      type: "error",
      text: "Befehl nicht erkannt oder für diese Aufgabe nicht zutreffend.",
    });
    renderTerminal();
    input.value = "";

    if (wrongAttempts >= MAX_WRONG_BEFORE_HINT) {
      const hintBox = document.getElementById("hint-box");
      hintBox.classList.remove("hidden");
      hintBox.innerHTML = `💡 <strong>Tipp:</strong> ${currentChallenge.hint}`;
    }
  }
}

function markSolved(id) {
  const progress = loadProgress();
  const stored = progress[MODULE_ID] || {};
  const solved = new Set(stored.solved || []);
  solved.add(id);
  const solvedArr = Array.from(solved);
  const status = solvedArr.length >= CHALLENGES.length ? "done" : "progress";
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
  ).textContent = `Gelöst: ${solved.length} / ${CHALLENGES.length} Aufgaben`;
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  renderChallenge();

  document.getElementById("run-btn").addEventListener("click", submitCommand);
  document.getElementById("cmd-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitCommand();
  });
  document.getElementById("next-btn").addEventListener("click", renderChallenge);
  document
    .getElementById("difficulty-select")
    .addEventListener("change", renderChallenge);
  document.getElementById("shell-select").addEventListener("change", renderChallenge);
});
