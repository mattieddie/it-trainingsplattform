/*
 * pc-troubleshooting.js - Helpdesk-Ticket-Szenarien rund um PC-/Windows-
 * Grundlagen (Baukasten IT-Grundlagen). Alle Tool-Ausgaben sind fest
 * hinterlegte Text-Fixtures, es wird nichts echtes ausgeführt.
 */

const MODULE_ID = "pctickets";

const SCENARIOS = [
  {
    id: "boot-loop-update",
    difficulty: "easy",
    title: "Ticket #2011 - PC bleibt nach Update beim Logo hängen",
    symptom:
      "Ein Nutzer meldet: 'Seit dem gestrigen Windows-Update bleibt mein PC beim Windows-Logo hängen und startet nicht mehr normal.'",
    tools: [
      {
        id: "safemode",
        label: "Start im abgesicherten Modus versuchen",
        output: `Start im abgesicherten Modus erfolgreich - Desktop wird angezeigt, keine Fehlermeldungen.`,
      },
      {
        id: "updates",
        label: "Zuletzt installierte Updates prüfen",
        output: `KB5031XXX - installiert: gestern, 18:03 Uhr
Status: Erfolgreich installiert, Neustart erforderlich`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache und der sinnvolle nächste Schritt?",
    options: [
      "Das gestern installierte Update verursacht das Bootproblem - im abgesicherten Modus lässt es sich deinstallieren",
      "Die Festplatte ist physisch defekt und muss ersetzt werden",
      "Der Arbeitsspeicher (RAM) ist beschädigt",
      "Der Nutzer hat versehentlich das falsche Passwort eingegeben",
    ],
    correctIndex: 0,
    explanation:
      "Im abgesicherten Modus (lädt nur Kernkomponenten) startet der PC einwandfrei - das spricht gegen einen Hardwaredefekt. Der zeitliche Zusammenhang mit dem gestrigen Update ist ein starkes Indiz: das Update im abgesicherten Modus deinstallieren behebt in solchen Fällen meist das Problem.",
  },
  {
    id: "print-spooler-stopped",
    difficulty: "easy",
    title: "Ticket #2018 - Drucker druckt nicht mehr",
    symptom:
      "Ein Nutzer kann seit heute Morgen nichts mehr drucken. Druckaufträge bleiben in der Warteschlange stehen.",
    tools: [
      {
        id: "queue",
        label: "Druckwarteschlange prüfen",
        output: `Dokument1.pdf - Status: Fehler - wird nicht verarbeitet
Dokument2.docx - Status: In Warteschlange`,
      },
      {
        id: "spooler",
        label: "Status des Druckspooler-Dienstes prüfen",
        output: `Dienst: Druckwarteschlange (Print Spooler)
Status: Angehalten`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Druckspooler-Dienst ist angehalten und muss neu gestartet werden",
      "Dem Drucker ist das Papier ausgegangen",
      "Der Druckertreiber ist grundsätzlich falsch installiert",
      "Das Netzwerkkabel des Druckers ist defekt",
    ],
    correctIndex: 0,
    explanation:
      "Der Print-Spooler-Dienst verwaltet alle Druckaufträge - ist er angehalten, bleiben Aufträge stehen, unabhängig vom Drucker selbst. Neustart des Dienstes (services.msc oder net start spooler) behebt das Problem meist sofort.",
  },
  {
    id: "disk-full",
    difficulty: "easy",
    title: "Ticket #2024 - Programme lassen sich nicht mehr installieren",
    symptom:
      "Ein Nutzer bekommt beim Versuch, ein Programm zu installieren, die Meldung 'Nicht genügend Speicherplatz'.",
    tools: [
      {
        id: "diskspace",
        label: "Speicherplatz auf Laufwerk C: prüfen",
        output: `Laufwerk C: (Windows)
Gesamtgrösse: 256 GB
Belegt: 251 GB (98%)
Frei: 5 GB`,
      },
      {
        id: "largest",
        label: "Grösste Ordner anzeigen",
        output: `Downloads: 84 GB
AppData\\Local\\Temp: 22 GB
Videos: 60 GB`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Systemlaufwerk ist fast voll (98%) - nicht benötigte Dateien blockieren den nötigen Speicherplatz",
      "Der Arbeitsspeicher (RAM) reicht nicht für die Installation aus",
      "Der Grafikkartentreiber fehlt",
      "Die Installationsdatei ist beschädigt",
    ],
    correctIndex: 0,
    explanation:
      "98% Belegung auf C: bei nur 5 GB frei - die meisten Installationsprogramme benötigen deutlich mehr freien Platz für temporäre Dateien. Aufräumen (v.a. Downloads/Temp-Ordner) schafft in der Regel genug Platz.",
  },
  {
    id: "crash-outdated-app",
    difficulty: "medium",
    title: "Ticket #2031 - Anwendung stürzt wiederholt ab",
    symptom: "Eine Fachanwendung stürzt bei einem Nutzer mehrmals täglich beim Speichern ab.",
    tools: [
      {
        id: "eventlog",
        label: "Ereignisanzeige (Anwendungsfehler) prüfen",
        output: `Fehlerquelle: Anwendungsfehler
Faulting application: fachapp.exe, Version 3.2.0
Faulting module: fachapp.exe, Version 3.2.0
Ausnahmecode: 0xc0000005`,
      },
      {
        id: "version",
        label: "Installierte Version mit Hersteller-Webseite vergleichen",
        output: `Installierte Version: 3.2.0 (veröffentlicht vor 14 Monaten)
Aktuelle Herstellerversion: 3.6.2
Hersteller-Hinweis: 'Bekannter Absturz beim Speichern in Version 3.2.0 - behoben in 3.3.0'`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die installierte Version enthält einen bekannten, bereits behobenen Fehler - ein Update auf eine neuere Version behebt das Problem",
      "Der Nutzer speichert die Datei am falschen Ort",
      "Die Festplatte des PCs ist zu langsam",
      "Der Bildschirm ist falsch kalibriert",
    ],
    correctIndex: 0,
    explanation:
      "Der Hersteller bestätigt selbst einen bekannten Absturz-Fehler in genau der installierten Version, behoben ab einer neueren Version - ein Update auf mindestens 3.3.0 ist die naheliegende Lösung.",
  },
  {
    id: "bsod-new-ram",
    difficulty: "medium",
    title: "Ticket #2039 - Bluescreen nach RAM-Erweiterung",
    symptom:
      "Ein Nutzer hat letzte Woche zusätzlichen Arbeitsspeicher eingebaut. Seither treten mehrmals täglich Bluescreens auf.",
    tools: [
      {
        id: "bsod-code",
        label: "Letzten Bluescreen-Fehlercode prüfen",
        output: `Fehler: MEMORY_MANAGEMENT (0x0000001A)
Zeitpunkt: heute, 09:14 Uhr`,
      },
      {
        id: "memdiag",
        label: "Windows-Speicherdiagnose ausführen",
        output: `Windows-Speicherdiagnose - Ergebnis:
Modul 1 (vorhanden): keine Fehler
Modul 2 (neu eingebaut): Fehler erkannt - mehrere Bitfehler`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das neu eingebaute RAM-Modul ist defekt oder inkompatibel",
      "Die Festplatte ist fragmentiert",
      "Ein Virus hat das System befallen",
      "Das Netzteil liefert zu wenig Strom",
    ],
    correctIndex: 0,
    explanation:
      "Der zeitliche Zusammenhang mit dem RAM-Einbau UND die Windows-Speicherdiagnose, die konkret im NEUEN Modul Bitfehler findet, zeigen eindeutig auf ein defektes oder inkompatibles RAM-Riegel. Modul ausbauen/austauschen behebt das Problem meist sofort.",
  },
  {
    id: "malware-high-cpu",
    difficulty: "medium",
    title: "Ticket #2044 - PC seit Tagen extrem langsam",
    symptom: "Ein Nutzer meldet, sein PC sei seit einigen Tagen quälend langsam, auch bei einfachen Aufgaben.",
    tools: [
      {
        id: "taskmgr",
        label: "Task-Manager nach CPU-Auslastung sortieren",
        output: `Prozess              CPU
svch0st.exe          94%
explorer.exe          3%
chrome.exe             2%`,
      },
      {
        id: "avscan",
        label: "Antivirus-Schnellscan ausführen",
        output: `Scan abgeschlossen.
1 Bedrohung gefunden: Trojan.GenericKD.12345 (svch0st.exe)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Schadsoftware (getarnt als echter Systemprozess) verursacht die hohe CPU-Last",
      "Der PC hat schlicht zu wenig Arbeitsspeicher für den Alltagsgebrauch",
      "Die Festplatte ist stark fragmentiert",
      "Der Bildschirmtreiber ist veraltet",
    ],
    correctIndex: 0,
    explanation:
      '"svch0st.exe" ist ein klassischer Malware-Tarnname (echte Windows-Datei heisst "svchost.exe" - hier mit einer "0" statt "o"). Der Virenscan bestätigt den Fund. Bereinigung durch Antivirus-Software ist der nötige nächste Schritt.',
  },
  {
    id: "fleet-firmware-bug",
    difficulty: "hard",
    title: "Ticket #2058 - Mehrere baugleiche Geräte stürzen nach Firmware-Update zufällig ab",
    symptom:
      "Nach einem automatisch verteilten Firmware-Update melden mehrere Nutzer mit demselben Notebook-Modell zufällige Abstürze, andere Modelle sind nicht betroffen.",
    tools: [
      {
        id: "modellliste",
        label: "Betroffene Geräte nach Modell auflisten",
        output: `Betroffene Geräte: 6, alle Modell 'ProBook X340'
Nicht betroffen: alle anderen Modelle (versch. Hersteller/Modelle)`,
      },
      {
        id: "firmware",
        label: "Firmware-Version der betroffenen Geräte prüfen",
        output: `ProBook X340 - BIOS-Version: 2.14.0 (automatisch verteilt vor 3 Tagen)`,
      },
      {
        id: "bulletin",
        label: "Hersteller-Support-Bulletin abrufen",
        output: `Support-Bulletin ProBook X340:
'BIOS 2.14.0 verursacht bei intensiver Last zufällige Systemabstürze.
Fix verfügbar in BIOS 2.14.1. Rollback auf 2.13.x wird bis dahin empfohlen.'`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Ein bekannter Fehler in der neu verteilten BIOS/Firmware-Version dieses Modells verursacht die Abstürze",
      "Alle betroffenen Geräte haben zufällig defekten Arbeitsspeicher",
      "Ein Virus verbreitet sich gezielt nur auf diesem Modell",
      "Die Nutzer dieses Modells arbeiten alle mit derselben fehlerhaften Anwendung",
    ],
    correctIndex: 0,
    explanation:
      "Die Häufung auf genau EIN Modell mit identischer, kürzlich verteilter Firmware-Version, plus ein offizielles Herstellerbulletin, das genau dieses Verhalten bestätigt, zeigt eindeutig auf einen Firmware-Bug. Rollback auf die alte Version bzw. Einspielen des Fix-Updates behebt das Problem flächendeckend.",
  },
  {
    id: "broken-secure-channel",
    difficulty: "hard",
    title: "Ticket #2067 - Domain-Anmeldung schlägt fehl, lokales Konto funktioniert",
    symptom:
      "Ein Nutzer kann sich nicht mehr mit seinem Domain-Konto anmelden ('Die Vertrauensstellung zwischen dieser Arbeitsstation und der primären Domäne konnte nicht hergestellt werden'). Mit einem lokalen Administratorkonto klappt die Anmeldung.",
    tools: [
      {
        id: "ping-dc",
        label: "Domain-Controller anpingen",
        output: `Ping wird ausgeführt für dc01.firma.local mit 32 Bytes Daten:
Antwort von 10.0.0.5: Bytes=32 Zeit=2ms TTL=128`,
      },
      {
        id: "securechannel",
        label: "Sicheren Kanal zur Domäne testen (Test-ComputerSecureChannel)",
        output: `Test-ComputerSecureChannel
False`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Computerkonto hat die Vertrauensstellung (den 'sicheren Kanal') zur Domäne verloren, z.B. nach einem Image-Rücksetzen ohne erneuten Domain-Join",
      "Das Benutzerkonto des Nutzers wurde in AD gesperrt",
      "Das Passwort des Nutzers ist abgelaufen",
      "Der DNS-Server des Clients ist falsch konfiguriert",
    ],
    correctIndex: 0,
    explanation:
      "Der Domain-Controller ist erreichbar (Ping ok) - das Netzwerk ist also nicht das Problem. Test-ComputerSecureChannel liefert 'False': die kryptografische Vertrauensbeziehung zwischen PC und Domäne ist beschädigt, z.B. weil der PC aus einem älteren Backup/Image wiederhergestellt wurde, dessen Computerkonto-Passwort nicht mehr zum aktuellen AD-Eintrag passt. Lösung: den PC erneut der Domäne beitreten lassen (rejoin) oder den sicheren Kanal zurücksetzen (Reset-ComputerMachinePassword).",
  },
];

document.addEventListener("DOMContentLoaded", () => initTicketTrainer(SCENARIOS, MODULE_ID));
