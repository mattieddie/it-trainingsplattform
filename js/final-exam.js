/*
 * final-exam.js - Abschlussprüfung
 * Zieht bei jedem Aufruf/Retry zufällig eine Teilmenge aus einem größeren
 * Fragenpool (organisiert nach Baukasten) und mischt zusätzlich die
 * Antwortoptionen jeder Frage. Ziel: kein statischer Fragensatz, den man
 * einmal lösen und als Lösungsschlüssel teilen/nachschlagen kann.
 */

const MODULE_ID = "finalexam";

const QUESTION_POOL = {
  grundlagen: [
    {
      question:
        "Ein Nutzer beschwert sich, dass er eine Datei nicht löschen kann, obwohl er laut Rechtsklick-Eigenschaften \"Vollzugriff\" hat. Was ist eine plausible Ursache?",
      options: [
        "Die Datei ist zusätzlich durch eine explizite \"Verweigern\"-Berechtigung eingeschränkt - diese hat immer Vorrang vor erlaubenden Berechtigungen",
        "NTFS-Berechtigungen gelten nur für Ordner, nie für einzelne Dateien",
        "\"Vollzugriff\" bezieht sich nur auf Lesen, nie auf Löschen",
      ],
      correctIndex: 0,
      explanation:
        "Eine explizite Verweigern-Berechtigung (Deny) gewinnt bei NTFS-Rechten immer gegen eine erlaubende Berechtigung, egal wie umfassend diese sonst ist - deshalb kann \"Vollzugriff\" trotzdem durch eine einzelne Deny-Regel blockiert sein.",
    },
    {
      question:
        "Ein PowerShell-Skript soll nachts automatisiert laufen, schlägt aber mit \"Ausführung von Skripts ist auf diesem System deaktiviert\" fehl. Welcher Befehl behebt das typischerweise für den aktuellen Benutzer?",
      options: [
        "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser",
        "Get-ExecutionPolicy -List",
        "Enable-Script -Force",
      ],
      correctIndex: 0,
      explanation:
        "Die Execution Policy steuert, welche Skripte ausgeführt werden dürfen. \"RemoteSigned\" erlaubt lokal erstellte Skripte, verlangt aber eine Signatur für aus dem Internet heruntergeladene - ein üblicher, nicht zu offener Kompromiss.",
    },
    {
      question:
        "Ein Batch-Skript liest eine Variable innerhalb einer FOR-Schleife bei jedem Durchlauf neu ein, aber der Wert bleibt immer der vom Start der Schleife. Was fehlt vermutlich?",
      options: [
        "setlocal enabledelayedexpansion sowie die Verwendung von !variable! statt %variable%",
        "Ein zusätzliches echo unmittelbar vor der Schleife",
        "Die Schleife muss statt mit for zwingend mit goto geschrieben werden",
      ],
      correctIndex: 0,
      explanation:
        "Batch löst %variable% bereits beim Parsen der GESAMTEN Schleife auf, nicht bei jedem Durchlauf einzeln. Verzögerte Auswertung (delayed expansion) mit !variable! liest den Wert dagegen erst zur Laufzeit jedes einzelnen Durchlaufs neu ein.",
    },
    {
      question:
        "Welche Windows-Komponente gibt am ehesten Aufschluss darüber, WARUM ein Dienst beim Systemstart nicht gestartet ist?",
      options: [
        "Ereignisanzeige (Event Viewer), Systemprotokoll",
        "Task-Manager, Reiter \"Apps\"",
        "Datei-Explorer, Eigenschaften der Programmdatei",
      ],
      correctIndex: 0,
      explanation:
        "Fehlgeschlagene Dienststarts werden mit Fehlercode und oft einer genaueren Beschreibung im Systemprotokoll der Ereignisanzeige protokolliert - der Task-Manager zeigt nur den aktuellen Zustand, keine Fehlerursache.",
    },
    {
      question:
        "Eine .ps1-Datei wird bei Doppelklick standardmässig nur im Editor geöffnet statt ausgeführt. Warum ist das so konfiguriert?",
      options: [
        "Als Sicherheitsmassnahme, damit nicht versehentlich (z.B. per Mail-Anhang) beliebige Skripte durch simplen Doppelklick ausgeführt werden",
        "Weil .ps1-Dateien technisch keine echten, ausführbaren Skripte sind",
        "Weil PowerShell grundsätzlich keine Doppelklick-Ausführung unterstützen kann",
      ],
      correctIndex: 0,
      explanation:
        "Diese Standardeinstellung ist eine bewusste Sicherheitsbremse gegen \"Social Engineering per Anhang\" - ein Skript soll bewusst über die Konsole gestartet werden, nicht durch einen unbedachten Doppelklick.",
    },
  ],
  netzwerk: [
    {
      question:
        "Ein Client kann per IP-Adresse pingen, aber nicht per Hostname erreichen. Welche Komponente ist am wahrscheinlichsten die Ursache?",
      options: [
        "Die DNS-Auflösung funktioniert nicht (falscher/nicht erreichbarer DNS-Server)",
        "Der Standardgateway ist falsch konfiguriert",
        "Die Subnetzmaske ist zu klein gewählt",
      ],
      correctIndex: 0,
      explanation:
        "Funktioniert die Verbindung per IP, aber nicht per Namen, liegt das Problem fast immer bei der Namensauflösung (DNS) - Routing und Adressierung sind ja nachweislich in Ordnung, sonst würde auch der Ping per IP fehlschlagen.",
    },
    {
      question: "Wie viele nutzbare Host-Adressen stehen in einem /26-Subnetz zur Verfügung?",
      options: ["62", "64", "30"],
      correctIndex: 0,
      explanation:
        "/26 ergibt 2^(32-26) = 64 Adressen insgesamt. Davon sind die erste (Netzadresse) und letzte (Broadcast-Adresse) reserviert, es bleiben also 64 - 2 = 62 nutzbare Host-Adressen.",
    },
    {
      question:
        "Zwei Geräte im selben IP-Subnetz können sich nicht erreichen. Am Switch zeigt sich: beide Ports sind unterschiedlichen VLANs zugeordnet. Warum verhindert das die Kommunikation trotz gleichem IP-Subnetz?",
      options: [
        "VLANs trennen den Verkehr bereits auf Schicht 2 (Data Link) unabhängig von der IP-Adressierung - ohne Routing zwischen den VLANs kommt kein Rahmen durch",
        "VLANs betreffen ausschliesslich WLAN-Verbindungen, kabelgebundene Geräte sind nie betroffen",
        "Das IP-Subnetz hat automatisch immer Vorrang vor der VLAN-Konfiguration",
      ],
      correctIndex: 0,
      explanation:
        "VLANs wirken auf OSI-Schicht 2, komplett unabhängig von der IP-Adressierung auf Schicht 3. Zwei Geräte in unterschiedlichen VLANs sind logisch getrennte Netze, selbst wenn zufällig dieselben IP-Adressbereiche konfiguriert wären.",
    },
    {
      question:
        "Ein Ticket beschreibt: \"Neue Geräte bekommen keine IP-Adresse mehr, ipconfig zeigt eine 169.254.x.x-Adresse.\" Was bedeutet das?",
      options: [
        "Der DHCP-Server ist nicht erreichbar - das Gerät hat sich stattdessen selbst eine APIPA-Adresse vergeben",
        "Das Gerät hat erfolgreich eine öffentliche Internet-Adresse erhalten",
        "169.254.x.x ist die Standardadresse für IPv6-Verbindungen",
      ],
      correctIndex: 0,
      explanation:
        "169.254.0.0/16 ist der reservierte Bereich für APIPA (Automatic Private IP Addressing) - Windows vergibt diese Adresse automatisch selbst, wenn per DHCP keine Adresse bezogen werden konnte.",
    },
    {
      question: "Warum wird bei einem Site-to-Site-VPN meist IPSec statt SSL-VPN eingesetzt?",
      options: [
        "IPSec arbeitet auf Netzwerkebene (Layer 3) und eignet sich damit besser, um den gesamten Verkehr zwischen zwei kompletten Standort-Netzwerken zu verschlüsseln, nicht nur einzelne Anwendungen",
        "SSL-VPN unterstützt grundsätzlich keine Verschlüsselung",
        "IPSec ist der einzige VPN-Standard, den handelsübliche Router überhaupt kennen",
      ],
      correctIndex: 0,
      explanation:
        "SSL-VPN eignet sich vor allem für einzelne Remote-Clients/Anwendungen (oft browserbasiert), während IPSec auf Netzwerkebene ganze Standort-zu-Standort-Verbindungen transparent verschlüsseln kann - deshalb der Standard für Site-to-Site.",
    },
    {
      question:
        "Ein CNAME-Record soll auf der Apex-Domain (z.B. beispiel.ch, ohne Subdomain) gesetzt werden - der DNS-Anbieter lehnt das ab. Warum?",
      options: [
        "Der DNS-Standard verlangt, dass ein CNAME der EINZIGE Record auf seinem Namen ist - auf der Apex-Domain müssen aber zwingend weitere Records (z.B. MX für Mail) koexistieren können",
        "Apex-Domains unterstützen grundsätzlich überhaupt keine DNS-Einträge",
        "CNAME-Records sind ausschliesslich für IPv6-Adressen reserviert",
      ],
      correctIndex: 0,
      explanation:
        "Ein CNAME darf laut Standard nicht neben anderen Records für denselben Namen existieren. Da eine Apex-Domain praktisch immer weitere Records braucht (z.B. MX, NS), ist ein CNAME dort nicht erlaubt - dafür gibt es A-Records oder anbieterspezifische ALIAS/ANAME-Records.",
    },
  ],
  identitaet: [
    {
      question:
        "Ein Benutzer ist Mitglied in zwei Sicherheitsgruppen mit widersprüchlichen GPO-Einstellungen (eine erlaubt, eine verweigert dieselbe Einstellung). Welche Regel gilt bei GPO-Konflikten typischerweise?",
      options: [
        "Eine explizite \"Deny\"(Verweigern)-Einstellung hat grundsätzlich Vorrang vor einer erlaubenden Einstellung",
        "Es gilt automatisch die zuletzt erstellte Gruppenrichtlinie",
        "Beide widersprüchlichen Einstellungen werden gemittelt/kombiniert angewendet",
      ],
      correctIndex: 0,
      explanation:
        "Wie bei NTFS-Berechtigungen gilt auch bei GPOs: eine explizite Verweigern-Einstellung schlägt eine erlaubende Einstellung, unabhängig von Vererbungsreihenfolge oder Erstellungszeitpunkt.",
    },
    {
      question:
        "Ein per Hybrid-Join verbundenes Gerät kann sich zwar bei Entra ID anmelden, erhält aber keine Intune-Richtlinien. Was fehlt wahrscheinlich?",
      options: [
        "Die Synchronisation zwischen lokalem Active Directory und Entra ID läuft nicht korrekt, oder dem Gerät fehlt zusätzlich die MDM-Registrierung bei Intune",
        "Hybrid-Join-Geräte können grundsätzlich nie von Intune verwaltet werden",
        "Intune-Richtlinien gelten ausschliesslich für reine Cloud-Geräte, nie für hybride Geräte",
      ],
      correctIndex: 0,
      explanation:
        "Hybrid-Join allein reicht nicht für Intune-Verwaltung - das Gerät muss zusätzlich bei Intune registriert sein (MDM-Enrollment), und die Synchronisation (z.B. Entra Connect) muss korrekt laufen, damit Attribute und Gruppenmitgliedschaften ankommen.",
    },
    {
      question:
        "Ein Administrator soll laut Least-Privilege-Prinzip nicht dauerhaft Globaler Administrator sein. Welches Feature passt dafür am besten?",
      options: [
        "Privileged Identity Management (PIM) - zeitlich befristete, bei Bedarf aktivierte Rollenzuweisung statt dauerhafter Rechte",
        "Conditional Access - das steuert nur Anmeldebedingungen, keine Rechtezuweisung",
        "Ein zweites, dauerhaft mit denselben Rechten ausgestattetes Admin-Konto",
      ],
      correctIndex: 0,
      explanation:
        "PIM erlaubt \"Just-in-Time\"-Admin-Rechte: die Rolle wird nur bei tatsächlichem Bedarf für begrenzte Zeit aktiviert statt dauerhaft zugewiesen zu sein - das reduziert die Angriffsfläche eines kompromittierten Kontos erheblich.",
    },
    {
      question:
        "Ein neues Benutzerkonto erscheint im lokalen Active Directory, aber nicht in Entra ID/Microsoft 365, obwohl Verzeichnissynchronisation eingerichtet ist. Woran liegt das zuerst am wahrscheinlichsten?",
      options: [
        "Der nächste Synchronisationszyklus wurde noch nicht durchlaufen, oder das Konto liegt ausserhalb der für die Synchronisation konfigurierten OU",
        "Entra ID synchronisiert grundsätzlich nur einmal pro Woche",
        "Neue Konten müssen zwingend ein zweites Mal manuell in Entra ID angelegt werden",
      ],
      correctIndex: 0,
      explanation:
        "Directory-Synchronisation läuft in Intervallen (oft ca. 30 Minuten) und synchronisiert meist nur gezielt konfigurierte OUs - beides sind die häufigsten, harmlosen Gründe für ein \"noch nicht sichtbares\" Konto.",
    },
    {
      question:
        "Ein FSMO-Rollenserver (z.B. der PDC-Emulator) fällt aus. Was ist die unmittelbare praktische Folge für den laufenden Betrieb?",
      options: [
        "Für die meisten Funktionen nicht sofort dramatisch (normale Anmeldungen laufen weiter), aber Vorgänge wie Zeitsynchronisation oder bestimmte Passwortänderungen können beeinträchtigt sein",
        "Das gesamte Active Directory ist augenblicklich vollständig funktionsunfähig",
        "Alle Benutzerkonten im gesamten Unternehmen werden automatisch gesperrt",
      ],
      correctIndex: 0,
      explanation:
        "FSMO-Rollen sind spezialisierte Einzelaufgaben (z.B. Zeitsynchronisation beim PDC-Emulator) - ihr Ausfall betrifft gezielt diese Funktionen, während die grundlegende AD-Authentifizierung über andere Domänencontroller meist weiterläuft.",
    },
  ],
  paketierung: [
    {
      question:
        "Eine MSI-Installation soll bei einem automatisierten Rollout komplett ohne Benutzerinteraktion laufen. Welcher msiexec-Parameter wird dafür typischerweise verwendet?",
      options: ["/qn", "/passive", "/repair"],
      correctIndex: 0,
      explanation:
        "/qn steht für \"quiet, no UI\" - keinerlei Anzeige oder Interaktion. /passive zeigt immerhin noch einen Fortschrittsbalken, /repair repariert eine bestehende Installation statt eine neue durchzuführen.",
    },
    {
      question:
        "Ein Unternehmen möchte firmenspezifische Einstellungen (z.B. einen abweichenden Installationspfad) in eine Standard-MSI einbringen, ohne die Original-MSI zu verändern. Welches Mittel ist dafür vorgesehen?",
      options: [
        "Ein Transform (MST), das zusätzlich zur MSI beim Installationsaufruf mitgegeben wird",
        "Ein komplett neues MSI-Paket muss von Grund auf gebaut werden",
        "Die Original-MSI-Datei muss direkt in einem Hex-Editor verändert werden",
      ],
      correctIndex: 0,
      explanation:
        "Ein Transform (.mst) enthält nur die Abweichungen von der Standard-MSI und wird beim Installationsaufruf zusätzlich referenziert (z.B. msiexec /i paket.msi TRANSFORMS=firma.mst) - die Original-MSI bleibt unverändert und wiederverwendbar.",
    },
    {
      question:
        "Beim Repackaging mit einem Tool wie RayPack wird typischerweise vor UND nach der Installation ein Snapshot des Systems gemacht. Wozu?",
      options: [
        "Um durch den Vergleich beider Zustände automatisch zu erkennen, welche Dateien/Registry-Einträge die Installation tatsächlich verändert hat, und daraus ein eigenes Paket abzuleiten",
        "Um im Fehlerfall das System per Snapshot vollständig zurücksetzen zu können",
        "Snapshots dienen ausschliesslich der Dokumentation und haben keine technische Funktion beim Paketieren",
      ],
      correctIndex: 0,
      explanation:
        "Der Vorher-Nachher-Vergleich (Differenzanalyse) ist das technische Kernprinzip des Repackagings: alles, was sich zwischen den beiden Snapshots geändert hat, gilt als von der Installation verursacht und wird ins neue Paket übernommen.",
    },
    {
      question:
        "Eine stille Installation über CMD schlägt bei einem klassischen EXE-Installationsprogramm fehl, obwohl derselbe Parameter bei anderer Software funktioniert hat. Was ist die wahrscheinlichste Erklärung?",
      options: [
        "Silent-Install-Parameter sind bei EXE-Installern herstellerspezifisch (z.B. /S, /silent, /verysilent je nach Installer-Framework) und nicht standardisiert wie bei MSI",
        "EXE-Dateien unterstützen grundsätzlich keine stille Installation",
        "Stille Installation funktioniert nur bei digital signierten Programmen",
      ],
      correctIndex: 0,
      explanation:
        "Im Gegensatz zu MSI (einheitliche msiexec-Parameter wie /qn) gibt es bei EXE-Setups keinen Standard - je nach verwendetem Installer-Framework (NSIS, InstallShield, Inno Setup, ...) unterscheiden sich die Silent-Parameter.",
    },
  ],
  security: [
    {
      question:
        "Eine Firewall-Regelliste erlaubt in Regel 3 Verkehr auf Port 443, blockiert aber in Regel 7 denselben Verkehr vom selben Absender. Nach dem Prinzip \"erste passende Regel gewinnt\" - was passiert?",
      options: [
        "Der Verkehr wird erlaubt, da Regel 3 zuerst zutrifft und die Auswertung dort stoppt - Regel 7 wird nie mehr geprüft",
        "Die restriktivere Regel (Regel 7, blockieren) gewinnt immer, unabhängig von der Reihenfolge",
        "Beide Regeln werden angewendet, das Ergebnis ist ein Kompromiss",
      ],
      correctIndex: 0,
      explanation:
        "Bei \"erste passende Regel gewinnt\" ist die Reihenfolge entscheidend: sobald eine Regel zutrifft, stoppt die Auswertung sofort - nachfolgende, eigentlich strengere Regeln kommen gar nicht mehr zum Tragen.",
    },
    {
      question:
        "Ein Login-Formular baut Abfragen wie folgt: SELECT * FROM users WHERE name = '\" + input + \"'. Welche Eingabe demonstriert klassisch eine SQL-Injection-Umgehung der Passwortprüfung?",
      options: ["' OR '1'='1", "admin123", "<script>alert(1)</script>"],
      correctIndex: 0,
      explanation:
        "' OR '1'='1 schliesst die Anführungszeichen vorzeitig und hängt eine immer wahre Bedingung an - die WHERE-Klausel wird dadurch für jede Zeile wahr, wodurch die Anmeldung ohne echtes Passwort durchgeht. Das dritte Beispiel ist XSS, kein SQL-Injection-Muster.",
    },
    {
      question:
        "Warum reicht eine gültige DKIM-Signatur allein nicht aus, um Phishing mit gefälschtem sichtbaren Absender zuverlässig zu verhindern?",
      options: [
        "DKIM bestätigt nur, dass die im d=-Tag genannte Domain signiert hat - nicht, dass diese mit dem sichtbaren From-Header übereinstimmt; erst DMARC mit Alignment schliesst diese Lücke",
        "DKIM-Signaturen sind grundsätzlich unsicher und lassen sich leicht fälschen",
        "DKIM prüft bereits automatisch den sichtbaren From-Header mit",
      ],
      correctIndex: 0,
      explanation:
        "Ein Angreifer könnte für seine EIGENE Domain sauber DKIM signieren und trotzdem im sichtbaren From-Header eine fremde Adresse eintragen - erst DMARC verlangt zusätzlich, dass die geprüfte Domain zur sichtbaren Absenderdomain passt (Alignment).",
    },
    {
      question:
        "Für die Speicherung von Passwörtern wird bcrypt statt reinem SHA-256 empfohlen. Was ist der entscheidende Unterschied?",
      options: [
        "bcrypt ist absichtlich langsam/rechenintensiv gestaltet und bringt Salting eingebaut mit - das bremst Brute-Force-Angriffe deutlich stärker aus als schnelles, reines SHA-256",
        "bcrypt erzeugt kürzere Hash-Werte, was Datenbankspeicher spart",
        "SHA-256 kann technisch keine Passwörter verarbeiten, sondern nur Dateien",
      ],
      correctIndex: 0,
      explanation:
        "SHA-256 ist für Geschwindigkeit optimiert - bei Passwörtern ein Nachteil, da es Brute-Force beschleunigt. bcrypt/Argon2 sind bewusst langsam gestaltet und bringen Salting von Haus aus mit.",
    },
    {
      question:
        "Zwei Parteien wollen sich über einen unsicheren Kanal auf einen gemeinsamen symmetrischen Schlüssel einigen, ohne diesen je zu übertragen. Welches Verfahren ist dafür klassisch gedacht?",
      options: [
        "Diffie-Hellman-Schlüsselaustausch",
        "Reines SHA-256-Hashing der Nachricht",
        "Ein fest im Programmcode hinterlegter, gemeinsamer Schlüssel",
      ],
      correctIndex: 0,
      explanation:
        "Diffie-Hellman ist genau dafür entwickelt worden: ein gemeinsames Geheimnis entsteht bei beiden Seiten unabhängig, ohne dass der Schlüssel selbst je über den unsicheren Kanal übertragen werden muss.",
    },
    {
      question:
        "In einer DMZ steht ein Webserver, der aus dem Internet erreichbar sein muss, aber keinen direkten Zugriff auf das interne Firmennetz haben soll. Welches Grundprinzip beschreibt diese Architektur?",
      options: [
        "Netzwerksegmentierung - die DMZ isoliert öffentlich erreichbare Systeme von internen, schützenswerten Systemen durch getrennte Firewall-Zonen",
        "Die DMZ dient ausschliesslich der Geschwindigkeitsoptimierung des Webservers",
        "DMZ-Server benötigen grundsätzlich keine eigenen Firewall-Regeln",
      ],
      correctIndex: 0,
      explanation:
        "Die DMZ ist eine eigene Netzwerkzone zwischen Internet und internem Netz - wird der öffentlich erreichbare Server kompromittiert, verhindert die Segmentierung, dass der Angreifer direkt ins interne Netz vordringen kann.",
    },
  ],
  betrieb: [
    {
      question:
        "Nach der 3-2-1-Backup-Regel sollen 3 Kopien, 2 verschiedene Medientypen und 1 externe Kopie existieren. Ein Unternehmen hat zwei Backups auf zwei verschiedenen NAS-Systemen im selben Serverraum. Was fehlt laut Regel?",
      options: [
        "Eine räumlich getrennte (Offsite-)Kopie - beide NAS-Systeme im selben Raum sind bei einem lokalen Ereignis gleichzeitig gefährdet",
        "Nichts, zwei NAS-Systeme erfüllen bereits alle Anforderungen der Regel",
        "Es wird schlicht ein drittes NAS-System im selben Raum benötigt",
      ],
      correctIndex: 0,
      explanation:
        "Die \"1\" in der 3-2-1-Regel steht für eine räumlich getrennte Kopie. Zwei NAS im selben Raum schützen zwar gegen Hardware-Defekt, aber nicht gegen Brand, Wasserschaden oder Diebstahl, die beide gleichzeitig treffen würden.",
    },
    {
      question:
        "Ein Ransomware-Angriff verschlüsselt auch das laufend gemountete Backup-Laufwerk mit. Welche Backup-Eigenschaft hätte das verhindert?",
      options: [
        "Eine Offline- oder unveränderliche (immutable) Kopie, die nicht dauerhaft für Schreibzugriffe verbunden/erreichbar ist",
        "Eine einfach höhere Backup-Frequenz allein",
        "Ein grösseres Speichermedium für dasselbe Backup",
      ],
      correctIndex: 0,
      explanation:
        "Ist ein Backup-Ziel dauerhaft beschreibbar eingebunden, kann Ransomware es wie jedes andere Laufwerk mitverschlüsseln. Offline- oder unveränderliche (immutable) Kopien sind für genau dieses Szenario gedacht.",
    },
    {
      question:
        "Das RPO (Recovery Point Objective) eines Systems beträgt 4 Stunden. Was bedeutet das für den maximal tolerierbaren Datenverlust?",
      options: [
        "Im Ernstfall dürfen höchstens die letzten 4 Stunden an Daten verloren gehen - Backups müssen also mindestens alle 4 Stunden erfolgen",
        "Die Wiederherstellung des gesamten Systems darf höchstens 4 Stunden dauern",
        "RPO hat keinen Bezug zu Backup-Intervallen, sondern nur zur Hardware-Leistung",
      ],
      correctIndex: 0,
      explanation:
        "RPO beschreibt den maximal tolerierbaren DATENVERLUST (rückwärts in der Zeit gemessen) - das RTO (Recovery Time Objective) beschreibt dagegen die maximale WIEDERHERSTELLUNGSDAUER. Beide werden oft verwechselt.",
    },
    {
      question:
        "Warum sollte ein Wiederherstellungsplan (Recovery-Plan) regelmässig tatsächlich GETESTET werden, statt nur dokumentiert in der Schublade zu liegen?",
      options: [
        "Nur ein getesteter Plan zeigt zuverlässig, ob Backups im Ernstfall wirklich vollständig und in der angenommenen Zeit wiederherstellbar sind - ungetestete Backups können unbemerkt beschädigt oder unvollständig sein",
        "Getestete Pläne sind gesetzlich vorgeschrieben und haben sonst keinen praktischen Nutzen",
        "Ein Test ist nur bei Cloud-Backups nötig, bei rein lokalen Backups dagegen überflüssig",
      ],
      correctIndex: 0,
      explanation:
        "Ein Backup, das nie zurückgespielt wurde, ist nur eine Vermutung, kein verlässlicher Schutz - Konfigurationsfehler, beschädigte Dateien oder zu lange Wiederherstellungszeiten fallen sonst erst im echten Notfall auf.",
    },
  ],
};

const SELECT_COUNTS = {
  grundlagen: 2,
  netzwerk: 3,
  identitaet: 2,
  paketierung: 1,
  security: 3,
  betrieb: 1,
};

let EXAM_QUESTIONS = [];
let examStartTime = null;

function buildExam() {
  let questions = [];
  Object.keys(SELECT_COUNTS).forEach((cat) => {
    const pool = QUESTION_POOL[cat];
    const picked = shuffleArray(pool)
      .slice(0, SELECT_COUNTS[cat])
      .map((q) => Object.assign({ category: cat }, q));
    questions = questions.concat(picked);
  });
  return shuffleArray(questions);
}

function categoryLabel(catId) {
  const track = TRACKS.find((t) => t.id === catId);
  return track ? `${track.icon} ${track.title}` : catId;
}

function renderExam() {
  EXAM_QUESTIONS = buildExam();
  examStartTime = Date.now();

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  document.getElementById("quiz-feedback").classList.add("hidden");
  document.getElementById("completion-banner").classList.add("hidden");

  EXAM_QUESTIONS.forEach((q, qIdx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    wrapper.innerHTML = `
      <span class="badge" style="margin-bottom:8px; background: var(--bg-input); color: var(--text-muted);">${categoryLabel(q.category)}</span>
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
      item.innerHTML = `<input type="radio" name="feq${qIdx}" /> <span>${opt}</span>`;
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

function checkExam() {
  const lists = document.querySelectorAll("#quiz-container .option-list");
  let correctCount = 0;

  lists.forEach((list, qIdx) => {
    const chosenIndex = list.dataset.chosenIndex;
    const q = EXAM_QUESTIONS[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item) => {
      const oIdx = Number(item.dataset.origIndex);
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (chosenIndex !== undefined && Number(chosenIndex) === oIdx && oIdx !== q.correctIndex) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;

    const expBox = document.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className = "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const elapsedSec = Math.round((Date.now() - examStartTime) / 1000);
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = String(elapsedSec % 60).padStart(2, "0");

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === EXAM_QUESTIONS.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${EXAM_QUESTIONS.length} richtig.</strong> Benötigte Zeit: ${minutes}:${seconds} Min.`;

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

  renderExam();
  document.getElementById("check-quiz-btn").addEventListener("click", checkExam);
  document.getElementById("new-attempt-btn").addEventListener("click", renderExam);
});
