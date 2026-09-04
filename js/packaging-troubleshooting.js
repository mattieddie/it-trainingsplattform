/*
 * packaging-troubleshooting.js - Helpdesk-Ticket-Szenarien rund um
 * Software-Paketierung/-Verteilung (Baukasten Softwareverteilung &
 * Paketierung). Alle Tool-Ausgaben sind fest hinterlegte Text-Fixtures.
 */

const MODULE_ID = "packagingtickets";

const SCENARIOS = [
  {
    id: "wrong-silent-param",
    difficulty: "easy",
    title: "Ticket #4011 - Silent-Installation zeigt trotzdem ein Fenster",
    symptom: "Ein per Skript verteilter Installer soll unbeaufsichtigt laufen, zeigt aber ein Setup-Fenster an.",
    tools: [
      {
        id: "usedcommand",
        label: "Verwendeten Installationsbefehl prüfen",
        output: `setup.exe /SILENT`,
      },
      {
        id: "vendordoc",
        label: "Hersteller-Dokumentation zu den Kommandozeilenparametern prüfen",
        output: `/SILENT       - reduzierte Oberfläche (Fortschrittsbalken bleibt sichtbar)
/VERYSILENT   - komplett unbeaufsichtigt, keine Anzeige`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Es wurde der falsche Parameter verwendet - /SILENT zeigt laut Dokumentation weiterhin eine reduzierte Oberfläche, nötig wäre /VERYSILENT",
      "Der Installer ist grundsätzlich nicht silent-fähig",
      "Das Skript wurde ohne Administratorrechte gestartet",
      "Die Installationsdatei ist beschädigt",
    ],
    correctIndex: 0,
    explanation:
      "Viele Inno-Setup-Installer unterscheiden zwischen /SILENT (reduzierte UI) und /VERYSILENT (keine UI). Die Doku bestätigt genau diesen Unterschied - der Befehl muss auf /VERYSILENT angepasst werden.",
  },
  {
    id: "msi-1603-permissions",
    difficulty: "easy",
    title: "Ticket #4017 - MSI-Installation schlägt mit Fehler 1603 fehl",
    symptom: "Eine per Deployment-Tool verteilte MSI-Installation bricht bei mehreren PCs mit Fehlercode 1603 ab.",
    tools: [
      {
        id: "msilog",
        label: "msiexec-Logdatei prüfen (Ausschnitt)",
        output: `Error 1603: Fatal error during installation.
Detail: Access is denied. Writing to 'C:\\Program Files\\App\\'`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Installation wurde ohne ausreichende (Administrator-)Rechte gestartet und kann daher nicht nach Program Files schreiben",
      "Die MSI-Datei ist beschädigt heruntergeladen worden",
      "Der Zielrechner hat zu wenig Arbeitsspeicher",
      "Die Netzwerkverbindung wurde während der Installation unterbrochen",
    ],
    correctIndex: 0,
    explanation:
      '"Access is denied" beim Schreiben nach Program Files ist ein klassisches Berechtigungsproblem. MSI-Fehler 1603 ist sehr allgemein, aber das Log zeigt hier konkret die Ursache: die Installation braucht erhöhte Rechte (z.B. Ausführung im Systemkontext über das Deployment-Tool).',
  },
  {
    id: "insufficient-disk-space",
    difficulty: "medium",
    title: "Ticket #4023 - Software installiert sich nur auf manchen PCs",
    symptom: "Dieselbe Softwareverteilung schlägt bei einem Teil der (identisch imagierten) PCs fehl, bei anderen nicht.",
    tools: [
      {
        id: "diskspace-failed",
        label: "Freien Speicherplatz auf einem fehlgeschlagenen PC prüfen",
        output: `Laufwerk C: - Frei: 420 MB`,
      },
      {
        id: "diskspace-ok",
        label: "Freien Speicherplatz auf einem erfolgreichen PC prüfen",
        output: `Laufwerk C: - Frei: 34 GB`,
      },
      {
        id: "requirements",
        label: "Systemanforderungen der Software prüfen",
        output: `Mindestens 2 GB freier Speicherplatz für die Installation erforderlich.`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Den fehlgeschlagenen PCs fehlt der für die Installation nötige freie Speicherplatz",
      "Die Software ist nicht mit diesem PC-Modell kompatibel",
      "Der Deployment-Server war zum Zeitpunkt der fehlgeschlagenen Installationen überlastet",
      "Auf den fehlgeschlagenen PCs fehlt eine Netzwerkverbindung",
    ],
    correctIndex: 0,
    explanation:
      "420 MB frei liegt weit unter den geforderten 2 GB, während der erfolgreiche PC reichlich Platz hat. Speicherplatz vor der Verteilung prüfen/freigeben (z.B. per vorgeschaltetem Bereinigungsskript) löst das Problem systematisch für die gesamte Flotte.",
  },
  {
    id: "missing-transform-param",
    difficulty: "medium",
    title: "Ticket #4029 - Firmen-Anpassungen (Transform) werden nicht übernommen",
    symptom: "Eine Anwendung wird zwar installiert, aber ohne die vorgesehenen firmenspezifischen Einstellungen aus dem Transform.",
    tools: [
      {
        id: "deploycmd",
        label: "Im Deployment-Tool hinterlegten Installationsbefehl prüfen",
        output: `msiexec /i app.msi /qn /norestart`,
      },
      {
        id: "expectedcmd",
        label: "Dokumentierten Soll-Befehl prüfen",
        output: `msiexec /i app.msi TRANSFORMS=firma-standard.mst /qn /norestart`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der TRANSFORMS-Parameter fehlt im tatsächlich verwendeten Befehl komplett",
      "Das Transform (MST) selbst ist fehlerhaft aufgebaut",
      "Der Nutzer hat während der Installation eigene Einstellungen gewählt",
      "Die MSI-Datei wurde zwischenzeitlich durch den Hersteller aktualisiert",
    ],
    correctIndex: 0,
    explanation:
      "Der Vergleich zeigt es eindeutig: im tatsächlich hinterlegten Befehl fehlt TRANSFORMS=firma-standard.mst komplett - ohne diesen Parameter wendet msiexec keinerlei Anpassungen an, die Anwendung installiert nur mit den MSI-Standardwerten.",
  },
  {
    id: "gpo-wrong-ou",
    difficulty: "medium",
    title: "Ticket #4035 - Per GPO verteilte Software erscheint bei niemandem",
    symptom: "Eine Anwendung wurde per Gruppenrichtlinie an eine Abteilung verteilt, taucht bei keinem der Nutzer auf.",
    tools: [
      {
        id: "gpresult",
        label: "gpresult /r bei einem betroffenen Nutzer ausführen",
        output: `Angewendete Gruppenrichtlinienobjekte:
    Default Domain Policy
(GPO_Softwareverteilung_Buchhaltung wird NICHT aufgelistet)`,
      },
      {
        id: "gpolink",
        label: "Verknüpfung der GPO in der Gruppenrichtlinienverwaltung prüfen",
        output: `GPO_Softwareverteilung_Buchhaltung
Verknüpft mit: OU=Marketing,DC=firma,DC=local`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die GPO ist mit der falschen Organisationseinheit (OU) verknüpft - Buchhaltung-Nutzer liegen nicht in dieser OU",
      "Die MSI-Datei ist auf dem Verteilungsserver nicht erreichbar",
      "Die Nutzer haben nicht genügend Speicherplatz",
      "Die GPO wurde versehentlich deaktiviert",
    ],
    correctIndex: 0,
    explanation:
      "Die GPO ist korrekt erstellt, aber mit der OU 'Marketing' verknüpft statt mit der OU der Buchhaltung-Nutzer - deshalb wird sie bei den eigentlich vorgesehenen Nutzern gar nicht erst angewendet. Lösung: Verknüpfung auf die richtige OU korrigieren.",
  },
  {
    id: "repackage-missing-dependency",
    difficulty: "hard",
    title: "Ticket #4042 - Repackagete Anwendung läuft nur auf dem Testrechner",
    symptom: "Eine per Repackaging erstellte MSI installiert und startet auf dem Referenz-PC einwandfrei, bei Endnutzern schlägt der Start fehl.",
    tools: [
      {
        id: "refpc-software",
        label: "Zusätzlich installierte Software auf dem Referenz-PC prüfen",
        output: `Referenz-PC - installierte Software (Auszug):
.NET Framework 4.8.1 (bereits vorinstalliert, NICHT Teil des Repackaging-Projekts)`,
      },
      {
        id: "standard-image",
        label: "Standard-Firmen-Image auf fehlende Komponente prüfen",
        output: `Standard-Image - installierte .NET-Version: 4.7.2
Von der Anwendung benötigt: mindestens 4.8`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Referenz-PC hatte eine Abhängigkeit (.NET 4.8.1) bereits vorinstalliert, die im Standard-Image fehlt und im Repackaging-Projekt nicht mitgeliefert wird",
      "Die Anwendung ist grundsätzlich nicht repackaging-fähig",
      "Der Referenz-PC hatte mehr Arbeitsspeicher als die Endnutzer-PCs",
      "Das Repackaging-Tool wurde in der falschen Sprache ausgeführt",
    ],
    correctIndex: 0,
    explanation:
      "Repackaging erfasst nur die Änderungen, die die Installation selbst vornimmt - eine bereits vorher vorhandene Abhängigkeit wie .NET 4.8.1 wird dabei nicht mit erfasst. Auf Systemen ohne diese Abhängigkeit (wie dem Standard-Image mit nur 4.7.2) schlägt der Start fehl. Lösung: auf einem sauberen Referenzsystem im Standard-Image neu paketieren und fehlende Abhängigkeiten gezielt mitliefern/als Voraussetzung einplanen.",
  },
  {
    id: "intune-detection-rule",
    difficulty: "hard",
    title: "Ticket #4051 - Intune-App-Installation bleibt ohne Fehlermeldung hängen",
    symptom: "Eine über Intune verteilte App zeigt bei allen Zielgeräten dauerhaft den Status 'Wird installiert', nie 'Erfolgreich' oder 'Fehlgeschlagen'.",
    tools: [
      {
        id: "imelog",
        label: "IntuneManagementExtension-Log auf einem Zielgerät prüfen",
        output: `[IME] Download erfolgreich abgeschlossen.
[IME] Installationsbefehl gestartet.
[IME] Installationsbefehl beendet (Exit Code 0).
[IME] Führe Erkennungsregel aus...
[IME] Erkennungsregel: Datei nicht gefunden.`,
      },
      {
        id: "detectionrule",
        label: "Konfigurierte Erkennungsregel (Detection Rule) prüfen",
        output: `Regeltyp: Datei vorhanden
Pfad: C:\\Program Files\\App\\app.exe
Tatsächlicher Installationspfad laut Setup-Log: C:\\Program Files (x86)\\App\\app.exe`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Erkennungsregel prüft den falschen Pfad - die eigentlich erfolgreiche Installation wird von Intune daher nicht als abgeschlossen erkannt",
      "Der Download der App schlägt bei allen Geräten fehl",
      "Den Geräten fehlt die Berechtigung, Apps über Intune zu installieren",
      "Die App ist für das verwendete Windows-Build nicht kompatibel",
    ],
    correctIndex: 0,
    explanation:
      "Der Installationsbefehl selbst läuft laut Log erfolgreich durch (Exit Code 0) - das eigentliche Problem liegt in der Erkennungsregel, die im 32-Bit-Pfad (Program Files (x86)) sucht, während die App tatsächlich in Program Files (64-Bit) installiert wurde. Intune erkennt die Installation dadurch fälschlich nie als abgeschlossen. Lösung: Erkennungsregel auf den korrekten Pfad korrigieren.",
  },
  {
    id: "missing-upgrade-code",
    difficulty: "hard",
    title: "Ticket #4059 - Nach Update sind zwei Versionen parallel installiert",
    symptom: "Nach der Verteilung einer neuen MSI-Version derselben Anwendung finden sich auf betroffenen PCs beide Versionen gleichzeitig installiert.",
    tools: [
      {
        id: "productcodes",
        label: "ProductCode alte vs. neue MSI vergleichen",
        output: `Alte MSI - ProductCode: {A1111111-1111-1111-1111-111111111111}
Neue MSI - ProductCode: {B2222222-2222-2222-2222-222222222222}`,
      },
      {
        id: "upgradetable",
        label: "Upgrade-Tabelle der neuen MSI im Editor (Orca) prüfen",
        output: `Tabelle 'Upgrade': (leer - kein Eintrag vorhanden)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der neuen MSI fehlt ein Eintrag in der Upgrade-Tabelle (UpgradeCode-Bezug), dadurch erkennt der Windows Installer die alte Version nicht als Vorgänger",
      "Die neue MSI wurde mit einem falschen Compiler erstellt",
      "Beide Versionen wurden absichtlich parallel benötigt",
      "Der Nutzer hat die alte Version manuell neu installiert",
    ],
    correctIndex: 0,
    explanation:
      "Der Windows Installer erkennt eine Vorgängerversion nur über einen passenden Eintrag in der Upgrade-Tabelle (verknüpft über den UpgradeCode, der bei richtig gepflegten MSIs über Versionen hinweg gleich bleibt). Fehlt dieser Eintrag komplett, behandelt der Installer die neue MSI als völlig eigenständiges Produkt - die alte Version wird nicht ersetzt. Lösung: UpgradeCode/Upgrade-Tabelle korrekt pflegen, oder die alte Version vor der neuen Installation gezielt deinstallieren.",
  },
];

document.addEventListener("DOMContentLoaded", () => initTicketTrainer(SCENARIOS, MODULE_ID));
