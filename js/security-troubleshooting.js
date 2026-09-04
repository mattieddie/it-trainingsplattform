/*
 * security-troubleshooting.js - Helpdesk-/Security-Ticket-Szenarien
 * (Baukasten IT-Security). Alle Tool-Ausgaben sind fest hinterlegte
 * Text-Fixtures.
 */

const MODULE_ID = "securitytickets";

const SCENARIOS = [
  {
    id: "ceo-fraud-phishing",
    difficulty: "easy",
    title: "Ticket #5011 - Verdächtige Zahlungsaufforderung per E-Mail",
    symptom: "Ein Nutzer meldet eine E-Mail, angeblich vom Geschäftsführer, mit dringender Bitte um eine Überweisung.",
    tools: [
      {
        id: "envelope",
        label: "Tatsächlichen Absender (Envelope-From) prüfen",
        output: `Von (angezeigt): Max Muster <geschaeftsleitung@firma.ch>
Envelope-From (tatsächlich): ceo@firrma-gmbh.com`,
      },
      {
        id: "authresults",
        label: "SPF/DKIM-Prüfergebnis anzeigen",
        output: `SPF: fail
DKIM: fail
DMARC: fail`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Ein klassischer CEO-Fraud-/Phishing-Versuch von einer gefälschten, ähnlich aussehenden Domain",
      "Der Geschäftsführer hat versehentlich die falsche Signatur verwendet",
      "Der Mailserver der Firma ist falsch konfiguriert",
      "Es handelt sich um einen technischen Zustellfehler",
    ],
    correctIndex: 0,
    explanation:
      'Die angezeigte Absenderadresse täuscht die echte Firmendomain vor, der tatsächliche Envelope-From nutzt aber eine Fake-Domain ("firrma-gmbh.com" statt der echten Domain) - und SPF/DKIM/DMARC schlagen alle fehl. Klassisches Muster eines CEO-Fraud-Phishingversuchs: nicht antworten, melden, blockieren.',
  },
  {
    id: "expired-certificate",
    difficulty: "easy",
    title: "Ticket #5017 - Zertifikatswarnung beim Aufruf der internen Webseite",
    symptom: "Mehrere Nutzer sehen beim Aufruf der internen Firmenseite eine Zertifikatswarnung im Browser.",
    tools: [
      {
        id: "certdetails",
        label: "Zertifikatsdetails der Seite prüfen",
        output: `Ausgestellt für: intranet.firma.local
Gültig bis: vor 3 Tagen abgelaufen
Ausstellende CA: Firma-Interne-CA (erreichbar)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Serverzertifikat ist abgelaufen",
      "Die interne Zertifizierungsstelle (CA) ist kompromittiert",
      "Der DNS-Eintrag der Seite zeigt auf den falschen Server",
      "Der Browser der Nutzer ist veraltet",
    ],
    correctIndex: 0,
    explanation:
      "Das Zertifikatsdetail zeigt eindeutig ein seit 3 Tagen abgelaufenes Gültigkeitsdatum, die ausstellende CA ist erreichbar. Lösung: neues Zertifikat ausstellen und installieren - langfristig z.B. per SCEP-Profil automatisiert verlängern, um das erneut zu vermeiden.",
  },
  {
    id: "firewall-rule-order",
    difficulty: "medium",
    title: "Ticket #5023 - Verbindung zu Partnerserver seit neuer Firewall-Regel blockiert",
    symptom: "Eine Anwendung kann seit gestern keine Verbindung mehr zu einem externen Partnerserver aufbauen.",
    tools: [
      {
        id: "fwlog",
        label: "Firewall-Log prüfen",
        output: `DENY  10.0.5.30 -> 203.0.113.40:8443  (Regel #12: Deny-All-Outbound)`,
      },
      {
        id: "ruleorder",
        label: "Regelreihenfolge auf der Firewall prüfen",
        output: `Regel #5:  ALLOW  ANY -> 203.0.113.40:8443
Regel #12: DENY   ANY -> ANY (Deny-All-Outbound)
Hinweis: gestern wurde eine neue Regel #3 (DENY ANY->ANY:8443) eingefügt`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Eine neu eingefügte, allgemeinere Deny-Regel steht in der Reihenfolge VOR der spezifischen Allow-Regel und greift daher zuerst",
      "Der Partnerserver hat seine IP-Adresse geändert",
      "Die Anwendung nutzt den falschen Port",
      "Die Firewall ist überlastet und verwirft Pakete zufällig",
    ],
    correctIndex: 0,
    explanation:
      "Bei Firewalls gilt: die erste passende Regel gewinnt. Die neu eingefügte Regel #3 (DENY auf Port 8443) sitzt vor der bestehenden Allow-Regel #5 und blockiert die Verbindung daher, bevor die eigentlich erlaubende Regel überhaupt geprüft wird. Lösung: die spezifische Allow-Regel vor die neue, allgemeinere Deny-Regel verschieben.",
  },
  {
    id: "sql-injection-login",
    difficulty: "medium",
    title: "Ticket #5029 - Login-Formular lässt sich mit einfachem Trick umgehen",
    symptom: "Ein interner Penetrationstest meldet: das Login-Formular einer Fachanwendung kann ohne gültiges Passwort umgangen werden.",
    tools: [
      {
        id: "testinput",
        label: "Verwendete Testeingabe prüfen",
        output: `Benutzername: admin' OR '1'='1
Passwort: irgendwas`,
      },
      {
        id: "sourcecode",
        label: "Serverseitigen Code-Ausschnitt prüfen",
        output: `query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Eine klassische SQL-Injection, da Nutzereingaben ungeprüft per String-Verkettung direkt in die Datenbankabfrage eingebaut werden",
      "Das Passwort-Hashing ist zu schwach konfiguriert",
      "Die Datenbank hat keine Backups",
      "Der Webserver läuft mit veralteten TLS-Einstellungen",
    ],
    correctIndex: 0,
    explanation:
      "Der Code baut die SQL-Abfrage per String-Verkettung aus ungeprüfter Nutzereingabe zusammen. Die Eingabe \"admin' OR '1'='1\" macht die WHERE-Bedingung immer wahr und umgeht damit die Passwortprüfung komplett - siehe Modul SQL-Injection. Lösung: parametrisierte Queries/Prepared Statements verwenden.",
  },
  {
    id: "missing-dmarc",
    difficulty: "medium",
    title: "Ticket #5034 - Gefälschte Rechnungsmails von der eigenen Firmendomain",
    symptom: "Externe Empfänger erhalten Betrugs-Mails, die scheinbar von der eigenen Firmendomain stammen, obwohl niemand in der Firma sie versendet hat.",
    tools: [
      {
        id: "spf",
        label: "SPF-Eintrag der eigenen Domain prüfen",
        output: `firma.ch. TXT "v=spf1 include:_spf.firma-mailserver.ch -all"
(SPF ist vorhanden und korrekt)`,
      },
      {
        id: "dmarc",
        label: "DMARC-Eintrag der eigenen Domain prüfen",
        output: `_dmarc.firma.ch. TXT  -> kein Eintrag gefunden`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Es fehlt ein DMARC-Eintrag - ohne ihn entscheidet der empfangende Mailserver selbst, was bei einem SPF/DKIM-Fehlschlag mit der eigenen Domain als Absender passiert",
      "SPF ist grundsätzlich nutzlos gegen Spoofing",
      "Der eigene Mailserver wurde gehackt und versendet die Mails selbst",
      "Die Domain wurde von der Registrierungsstelle gesperrt",
    ],
    correctIndex: 0,
    explanation:
      "SPF allein prüft nur, ob der sendende Server berechtigt ist - es legt aber nicht fest, was bei einem Fehlschlag geschehen soll. Genau das regelt DMARC (z.B. p=reject/quarantine). Fehlt DMARC, liefern viele Mailserver eine gefälschte Mail trotz SPF-Fail einfach zu, statt sie abzulehnen. Lösung: DMARC-Eintrag mit einer strikten Policy ergänzen.",
  },
  {
    id: "wrong-public-key",
    difficulty: "hard",
    title: "Ticket #5041 - Verschlüsselte Datei lässt sich beim Empfänger nicht öffnen",
    symptom: "Ein Mitarbeiter verschlüsselt eine sensible Datei für Kollege A, dieser kann sie aber trotz korrekt ausgetauschter Schlüssel nicht entschlüsseln.",
    tools: [
      {
        id: "fingerprint",
        label: "Fingerprint des verwendeten öffentlichen Schlüssels prüfen",
        output: `Verwendeter öffentlicher Schlüssel - Fingerprint: 4F:2A:...:9C
Öffentlicher Schlüssel von Kollege B - Fingerprint: 4F:2A:...:9C  (Übereinstimmung!)
Öffentlicher Schlüssel von Kollege A - Fingerprint: A1:B3:...:77  (keine Übereinstimmung)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Beim Verschlüsseln wurde versehentlich der öffentliche Schlüssel von Kollege B statt von Kollege A verwendet",
      "Der private Schlüssel von Kollege A ist beschädigt",
      "Asymmetrische Verschlüsselung funktioniert bei Dateien grundsätzlich nicht",
      "Die Datei wurde während der Übertragung beschädigt",
    ],
    correctIndex: 0,
    explanation:
      "Bei asymmetrischer Verschlüsselung kann eine mit dem öffentlichen Schlüssel einer Person verschlüsselte Nachricht NUR mit dem passenden privaten Schlüssel derselben Person entschlüsselt werden. Der Fingerprint-Vergleich zeigt eindeutig: es wurde der öffentliche Schlüssel von Kollege B statt Kollege A verwendet. Lösung: mit dem korrekten öffentlichen Schlüssel von Kollege A erneut verschlüsseln.",
  },
  {
    id: "compromised-server-botnet",
    difficulty: "hard",
    title: "Ticket #5048 - Server verbindet sich massenhaft zu unbekannten externen Zielen",
    symptom: "Das Monitoring meldet ungewöhnlich hohen ausgehenden Datenverkehr von einem internen Server, der normalerweise kaum aktiv nach aussen kommuniziert.",
    tools: [
      {
        id: "outboundlog",
        label: "Ausgehende Verbindungen des Servers prüfen",
        output: `Ausgehende Verbindungen (letzte 10 Min): 1847
Ziele: über 900 verschiedene externe IP-Adressen, Port 6667
Muster: typisch für IRC-basierte Command-and-Control-Kommunikation`,
      },
      {
        id: "processlist",
        label: "Laufende Prozesse auf dem Server prüfen",
        output: `Unbekannter Prozess 'svchost32.exe' (kein signiertes Microsoft-Binary)
Gestartet: vor 6 Tagen, hohe Netzwerkaktivität`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Server ist vermutlich bereits kompromittiert und Teil eines Botnets (Command-and-Control-Kommunikation)",
      "Ein legitimes Backup-Programm verursacht den Traffic",
      "Der DNS-Server des Unternehmens ist fehlkonfiguriert",
      "Es handelt sich um einen normalen Softwareupdate-Vorgang",
    ],
    correctIndex: 0,
    explanation:
      "Massenhafte Verbindungen zu hunderten unbekannten IPs auf einem für IRC/Botnet-C2 typischen Port, kombiniert mit einem unsignierten, verdächtig benannten Prozess, sind starke Indikatoren für eine bereits erfolgte Kompromittierung. Sofortmassnahme: Server vom Netz isolieren und forensisch untersuchen, bevor er weiter als Ausgangspunkt für Angriffe dient.",
  },
  {
    id: "vpn-session-timeout",
    difficulty: "hard",
    title: "Ticket #5056 - SSL-VPN bricht immer nach genau 60 Minuten ab",
    symptom: "Homeoffice-Mitarbeitende melden, ihre SSL-VPN-Verbindung breche zuverlässig nach etwa einer Stunde ab und müsse manuell neu aufgebaut werden. Der IPSec-Site-to-Site-Tunnel zur Zweigstelle ist davon nicht betroffen.",
    tools: [
      {
        id: "sslprofile",
        label: "SSL-VPN-Profil auf dem Gateway prüfen",
        output: `SSL-VPN-Profil 'Homeoffice'
Session-Timeout: 60 Minuten
Automatische Reauthentifizierung: Deaktiviert`,
      },
      {
        id: "ipsecprofile",
        label: "IPSec-Site-to-Site-Profil zum Vergleich prüfen",
        output: `IPSec-Tunnel 'Zweigstelle-B'
Session-Timeout: nicht gesetzt (dauerhaft, Standardverhalten für Site-to-Site)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das SSL-VPN-Profil hat ein festes Session-Timeout von 60 Minuten ohne automatische Reauthentifizierung",
      "Die Internetverbindung der Homeoffice-Mitarbeitenden ist instabil",
      "Der IPSec-Tunnel stört die SSL-VPN-Verbindungen",
      "Zu viele Nutzer sind gleichzeitig verbunden",
    ],
    correctIndex: 0,
    explanation:
      "Das SSL-VPN-Profil trennt die Verbindung nach exakt 60 Minuten, weil weder ein längeres Timeout noch eine automatische Reauthentifizierung konfiguriert ist - der IPSec-Site-to-Site-Tunnel ist als Dauerverbindung ohne Timeout konzipiert und deshalb nicht betroffen. Lösung: Timeout verlängern oder automatische Reauthentifizierung aktivieren.",
  },
];

document.addEventListener("DOMContentLoaded", () => initTicketTrainer(SCENARIOS, MODULE_ID));
