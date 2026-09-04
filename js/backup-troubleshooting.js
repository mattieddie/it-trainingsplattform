/*
 * backup-troubleshooting.js - Helpdesk-/Betriebs-Ticket-Szenarien rund um
 * Backup, RAID und Notfallvorsorge (Baukasten Betrieb & Notfallvorsorge).
 * Alle Tool-Ausgaben sind fest hinterlegte Text-Fixtures.
 */

const MODULE_ID = "backuptickets";

const SCENARIOS = [
  {
    id: "backup-target-full",
    difficulty: "easy",
    title: "Ticket #6011 - Nächtliches Backup schlägt seit 3 Tagen fehl",
    symptom: "Das automatische Nacht-Backup des Fileservers meldet seit 3 Tagen einen Fehler.",
    tools: [
      {
        id: "backuplog",
        label: "Backup-Job-Log prüfen",
        output: `Backup-Job 'Fileserver-Nightly'
Status: Fehlgeschlagen
Fehler: Ziellaufwerk voll (0 Bytes frei)`,
      },
      {
        id: "targetspace",
        label: "Speicherplatz auf dem Backup-Ziel prüfen",
        output: `Backup-NAS - Belegung: 100% (0 GB frei)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Backup-Ziel ist voll - alte Sicherungen müssen gemäss Aufbewahrungsrichtlinie gelöscht oder der Speicher erweitert werden",
      "Der Fileserver selbst ist ausgefallen",
      "Das Backup-Programm ist abgelaufen (Lizenz)",
      "Ein Netzwerkkabel wurde versehentlich getrennt",
    ],
    correctIndex: 0,
    explanation:
      "0 GB frei auf dem Backup-Ziel erklärt den Fehler direkt. Lösung: alte Sicherungen gemäss GFS-Rotation (Grandfather-Father-Son) bereinigen oder den Speicherplatz erweitern - und künftig den Füllstand aktiv überwachen.",
  },
  {
    id: "long-incremental-restore",
    difficulty: "easy",
    title: "Ticket #6017 - Restore eines Ordners dauert ungewöhnlich lange",
    symptom: "Die Wiederherstellung eines einzelnen versehentlich gelöschten Ordners läuft bereits seit Stunden.",
    tools: [
      {
        id: "backuptype",
        label: "Verwendete Sicherungsstrategie prüfen",
        output: `Letzte Vollsicherung: vor 30 Tagen
Seitdem: 29 tägliche inkrementelle Sicherungen`,
      },
      {
        id: "restoreprogress",
        label: "Restore-Fortschritt prüfen",
        output: `Restore-Reihenfolge: Vollsicherung (Tag 0) -> inkrementell Tag 1 -> Tag 2 -> ... -> Tag 29
Aktueller Schritt: inkrementell Tag 17 von 29`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Bei inkrementellen Sicherungen müssen für ein Restore die Vollsicherung UND alle nachfolgenden inkrementellen Sicherungen der Reihe nach eingespielt werden - das ist hier normales, erwartetes Verhalten",
      "Die Backup-Infrastruktur ist defekt",
      "Der Zielordner ist beschädigt",
      "Es liegt ein Netzwerkfehler vor",
    ],
    correctIndex: 0,
    explanation:
      "Kein Fehler, sondern eine bekannte Eigenschaft inkrementeller Sicherungen: jede inkrementelle Sicherung enthält nur die Änderungen seit der letzten - ein vollständiger Restore-Stand ergibt sich erst aus Vollsicherung PLUS allen folgenden inkrementellen Sicherungen in der richtigen Reihenfolge. Das erklärt die lange Dauer bei 29 Zwischenschritten.",
  },
  {
    id: "raid-degraded",
    difficulty: "medium",
    title: "Ticket #6023 - RAID-Array meldet 'Degraded'",
    symptom: "Der RAID-Controller eines Servers zeigt den Status 'Degraded' an, der Server läuft aber weiter.",
    tools: [
      {
        id: "raidstatus",
        label: "RAID-Controller-Status prüfen",
        output: `Array: RAID 5, 4 Platten
Status: DEGRADED
Platte 2: FAILED
Platten 1, 3, 4: OK`,
      },
      {
        id: "smart",
        label: "S.M.A.R.T.-Werte der ausgefallenen Platte prüfen",
        output: `Platte 2 - Reallocated Sectors: 1840 (kritisch hoch)
Zustand: kurz vor Totalausfall`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache und der nötige nächste Schritt?",
    options: [
      "Eine physische Platte ist ausgefallen - RAID 5 läuft auf Basis der Parität der übrigen Platten weiter, die defekte Platte muss schnellstmöglich ersetzt werden",
      "Der Server sollte sofort komplett heruntergefahren werden, da alle Daten verloren sind",
      "Es handelt sich um einen reinen Software-Fehler ohne Handlungsbedarf",
      "Der RAID-Controller muss auf RAID 0 umgestellt werden",
    ],
    correctIndex: 0,
    explanation:
      "RAID 5 verkraftet den Ausfall EINER Platte dank verteilter Parität - der Verbund läuft im Degraded-Modus weiter, ist aber ab jetzt ohne Redundanz: fällt eine ZWEITE Platte aus, sind die Daten verloren. Die defekte Platte (S.M.A.R.T. bestätigt den bevorstehenden Totalausfall) muss daher umgehend ersetzt werden, damit der Rebuild starten kann.",
  },
  {
    id: "backup-corrupted-no-restore-test",
    difficulty: "medium",
    title: "Ticket #6029 - Restore-Test schlägt fehl, obwohl Backup als erfolgreich gemeldet wurde",
    symptom: "Ein routinemässiger Restore-Test zeigt, dass sich eine als 'erfolgreich' gemeldete Sicherung nicht wiederherstellen lässt.",
    tools: [
      {
        id: "backupstatus",
        label: "Backup-Job-Log prüfen",
        output: `Backup-Job 'DB-Server-Nightly'
Status: Erfolgreich abgeschlossen
Dauer: 42 Minuten`,
      },
      {
        id: "integrity",
        label: "Integritätsprüfung der Sicherungsdatei durchführen",
        output: `Prüfsummenvergleich: FEHLGESCHLAGEN
Datei ist beschädigt (Bit-Fehler in Block 8842)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache und was sollte künftig anders gemacht werden?",
    options: [
      "Die Sicherung wird zwar erfolgreich erstellt, ist aber beschädigt - ein Backup ohne regelmässige Restore-Tests gibt eine trügerische Sicherheit",
      "Der Restore-Test wurde falsch durchgeführt",
      "Der Datenbankserver war während des Tests offline",
      "Die Backup-Software-Lizenz ist abgelaufen",
    ],
    correctIndex: 0,
    explanation:
      "Ein 'erfolgreich' gemeldeter Backup-Job garantiert nur, dass der Schreibvorgang ohne Absturz durchgelaufen ist - nicht, dass die Datei im Ernstfall auch wiederherstellbar ist (hier: Bit-Fehler machen die Datei unbrauchbar). Genau deshalb gehören regelmässige, echte Restore-Tests zu jeder ernsthaften Backup-Strategie dazu.",
  },
  {
    id: "ransomware-hits-online-backup",
    difficulty: "medium",
    title: "Ticket #6034 - Ransomware-Verdacht betrifft auch das Backup-Ziel",
    symptom: "Auf dem Fileserver sind plötzlich viele Dateien mit neuer, unbekannter Endung versehen, dazu liegt eine Lösegeldforderung als Textdatei vor.",
    tools: [
      {
        id: "extensions",
        label: "Betroffene Dateien prüfen",
        output: `1.284 Dateien umbenannt in *.locked
Datei 'LIES_MICH.txt' in mehreren Ordnern vorhanden`,
      },
      {
        id: "backuptarget",
        label: "Backup-Ziel (NAS) prüfen",
        output: `Backup-NAS ist dauerhaft als Netzlaufwerk (Z:) eingebunden.
Auch auf dem NAS: mehrere Dateien mit Endung .locked gefunden`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache, dass auch die Sicherung betroffen ist?",
    options: [
      "Das Backup-Ziel war dauerhaft als Netzlaufwerk verbunden (kein Air-Gap/Offline-Schutz) - die Ransomware konnte es dadurch mitverschlüsseln",
      "Die Ransomware ist speziell auf NAS-Geräte spezialisiert und hätte sich ohnehin nicht verhindern lassen",
      "Das Backup-Programm selbst war infiziert",
      "Es handelt sich um einen reinen Zufall",
    ],
    correctIndex: 0,
    explanation:
      "Ein dauerhaft verbundenes Netzlaufwerk ist für Ransomware wie ein ganz normales, zusätzliches Laufwerk - sie verschlüsselt es einfach mit. Genau vor diesem Szenario soll die 3-2-1-Regel mit einer wirklich getrennten (offline/air-gapped) Kopie schützen. Lösung: Backup-Ziel nicht dauerhaft eingebunden lassen, sondern nur für die Dauer der Sicherung verbinden bzw. eine echte Offline-/Unveränderlich-Kopie (Immutable Backup) einsetzen.",
  },
  {
    id: "rto-exceeded-slow-link",
    difficulty: "hard",
    title: "Ticket #6041 - Vereinbartes RTO wird deutlich überschritten",
    symptom: "Ein grösserer Restore-Test zeigt, dass die im Notfallplan zugesagte Wiederherstellungszeit bei Weitem nicht eingehalten werden kann.",
    tools: [
      {
        id: "restoretest",
        label: "Protokoll des letzten Grosstests prüfen",
        output: `Getestete Datenmenge: 2 TB
Wiederherstellungsdauer: 14 Stunden
Verbindung zum Offsite-Speicher: 100 Mbit/s`,
      },
      {
        id: "rtoplan",
        label: "Vereinbartes RTO im Notfallplan nachsehen",
        output: `Vereinbartes RTO für den Fileserver: 4 Stunden`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Netzwerkanbindung zum Offsite-Speicher ist zu langsam, um die geforderte Restore-Geschwindigkeit für das vereinbarte RTO zu erreichen",
      "Die Sicherung selbst ist zu alt",
      "Der Fileserver hat zu wenig Arbeitsspeicher für den Restore-Vorgang",
      "Der Notfallplan wurde nie offiziell freigegeben",
    ],
    correctIndex: 0,
    explanation:
      "2 TB über eine 100-Mbit/s-Leitung ergeben rechnerisch bereits mehrere Stunden reine Übertragungszeit - das RTO von 4 Stunden ist mit dieser Anbindung unrealistisch. Lösung: schnellere Anbindung zum Offsite-Speicher, eine zusätzliche lokale Kopie für schnelle Restores, oder das vereinbarte RTO an die tatsächlich erreichbare Geschwindigkeit anpassen.",
  },
  {
    id: "second-disk-fails-during-rebuild",
    difficulty: "hard",
    title: "Ticket #6048 - RAID-Rebuild nach Plattentausch bricht mehrfach ab",
    symptom: "Nach dem Austausch einer defekten RAID-Platte durch eine neue bricht der Wiederaufbau (Rebuild) wiederholt vorzeitig ab.",
    tools: [
      {
        id: "rebuildlog",
        label: "RAID-Rebuild-Log prüfen",
        output: `Rebuild gestartet: Platte 2 (neu)
Fortschritt: 62% - Rebuild FEHLGESCHLAGEN
Grund: Lesefehler auf Platte 3 (vorhandene Platte im selben Array)`,
      },
      {
        id: "smart-others",
        label: "S.M.A.R.T.-Werte der übrigen Platten im Array prüfen",
        output: `Platte 1: OK
Platte 3: Reallocated Sectors stark erhöht, mehrere Lesefehler in letzter Woche
Platte 4: OK`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Eine zweite, bereits angeschlagene Platte im selben Array verursacht unter der zusätzlichen Belastung durch den Rebuild Lesefehler",
      "Die neue Ersatzplatte ist von Anfang an defekt",
      "Der RAID-Controller unterstützt die neue Plattengrösse nicht",
      "Ein Stromausfall während des Rebuilds hat den Vorgang unterbrochen",
    ],
    correctIndex: 0,
    explanation:
      "Ein Rebuild liest ALLE übrigen Platten des Arrays vollständig aus, um die neue Platte zu rekonstruieren - eine bereits angeschlagene Platte (hier: Platte 3 mit stark erhöhten Fehlerwerten) übersteht diese zusätzliche Belastung oft nicht. Das ist ein bekanntes Risiko bei gleichzeitig verbauten, gleich alten Platten. Lösung: auch die zweite angeschlagene Platte vorsorglich ersetzen, künftig S.M.A.R.T.-Werte aktiv überwachen, um solche Ausfälle vor einem kritischen Rebuild zu erkennen.",
  },
  {
    id: "failed-monthly-backup-unnoticed",
    difficulty: "hard",
    title: "Ticket #6055 - Wiederherstellungspunkt von vor 2 Monaten fehlt trotz korrekter Aufbewahrungsregel",
    symptom: "Für eine rechtliche Anfrage wird ein Datenstand von vor 2 Monaten benötigt - obwohl die Aufbewahrungsrichtlinie (GFS) das eigentlich abdecken sollte, ist kein passender Wiederherstellungspunkt vorhanden.",
    tools: [
      {
        id: "gfspolicy",
        label: "Aufbewahrungsrichtlinie (GFS) prüfen",
        output: `Täglich: 14 Tage
Wöchentlich: 8 Wochen
Monatlich: 12 Monate`,
      },
      {
        id: "jobhistory",
        label: "Backup-Job-Historie des betreffenden Monats prüfen",
        output: `Monatliche Sicherung vom [vor 2 Monaten]: FEHLGESCHLAGEN
Alarmierung bei Fehlschlag: nicht konfiguriert`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die monatliche Sicherung dieses Monats war fehlgeschlagen und wurde mangels Alarmierung nie bemerkt - die GFS-Regel selbst war korrekt, half aber ohne erfolgreiche Ausführung nichts",
      "Die GFS-Richtlinie deckt grundsätzlich keine 2 Monate ab",
      "Der Wiederherstellungspunkt wurde absichtlich gelöscht",
      "Rechtliche Anfragen werden von der Backup-Software generell nicht unterstützt",
    ],
    correctIndex: 0,
    explanation:
      "Eine korrekt konfigurierte Aufbewahrungsregel nützt nichts, wenn der zugrunde liegende Backup-Lauf fehlschlägt - und genau das ist hier passiert, unbemerkt, weil keine Alarmierung bei Fehlschlägen eingerichtet war. Lösung: Backup-Erfolg aktiv überwachen und bei Fehlschlägen automatisch alarmieren, statt sich allein auf die Rotationsregel zu verlassen.",
  },
];

document.addEventListener("DOMContentLoaded", () => initTicketTrainer(SCENARIOS, MODULE_ID));
