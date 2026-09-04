/*
 * identity-troubleshooting.js - Helpdesk-Ticket-Szenarien rund um Active
 * Directory, Entra ID/Intune und Hybrid-Identität (Baukasten
 * Verzeichnisdienste & Identität). Alle Tool-Ausgaben sind fest
 * hinterlegte Text-Fixtures.
 */

const MODULE_ID = "identitytickets";

const SCENARIOS = [
  {
    id: "account-locked-old-device",
    difficulty: "easy",
    title: "Ticket #3011 - Benutzerkonto gesperrt",
    symptom: "Ein Nutzer kann sich nicht mehr anmelden: 'Ihr Konto wurde vorübergehend gesperrt.'",
    tools: [
      {
        id: "adstatus",
        label: "Kontostatus in Active Directory prüfen",
        output: `Get-ADUser -Identity jmeier -Properties LockedOut
LockedOut : True`,
      },
      {
        id: "eventlog",
        label: "Sicherheitsereignisprotokoll prüfen (Event 4740)",
        output: `Event 4740 - Konto gesperrt
Konto: jmeier
Aufrufender Computer: ALT-LAPTOP-07
Anzahl Fehlversuche: 12 in 3 Minuten`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Ein Gerät (vermutlich mit einem alten gespeicherten Passwort) versucht wiederholt erfolglos sich anzumelden und sperrt dadurch das Konto",
      "Der Nutzer wurde absichtlich vom Administrator gesperrt",
      "Das Konto ist abgelaufen",
      "Der Domain-Controller ist nicht erreichbar",
    ],
    correctIndex: 0,
    explanation:
      "12 Fehlversuche in kurzer Zeit von einem alten Laptop deuten stark auf ein dort gespeichertes, veraltetes Passwort hin (z.B. in einer App oder einem gemappten Laufwerk), das automatisch wiederholt probiert wird. Lösung: Konto entsperren und das alte Passwort auf dem betroffenen Gerät aktualisieren/entfernen.",
  },
  {
    id: "gpo-security-filtering",
    difficulty: "easy",
    title: "Ticket #3018 - Gruppenrichtlinie wird nicht angewendet",
    symptom: "Eine neue Gruppenrichtlinie (Bildschirmsperre nach 5 Minuten) wirkt bei einem Nutzer nicht.",
    tools: [
      {
        id: "gpresult",
        label: "gpresult /r auf dem betroffenen Client ausführen",
        output: `Angewendete Gruppenrichtlinienobjekte: (keine)

Verweigerte Gruppenrichtlinienobjekte:
    GPO_Bildschirmsperre (Grund: Sicherheitsfilterung)`,
      },
      {
        id: "filtering",
        label: "Sicherheitsfilterung der GPO in der Konsole prüfen",
        output: `Sicherheitsfilterung von GPO_Bildschirmsperre:
  - Gruppe 'Vertrieb-Standard' (Lesen, Übernehmen)
  Nutzer jmeier ist Mitglied von 'Vertrieb-Extern' (nicht gelistet)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Sicherheitsfilterung der GPO schliesst die Gruppe des Nutzers aus, dadurch wird die Richtlinie für ihn verweigert",
      "Der Nutzer hat die Richtlinie manuell deaktiviert",
      "Die GPO ist fehlerhaft programmiert",
      "Der Client hat seit Wochen keinen Kontakt zum Domain-Controller",
    ],
    correctIndex: 0,
    explanation:
      "gpresult zeigt explizit 'Verweigert (Sicherheitsfilterung)'. Nur Mitglieder der berechtigten Gruppe 'Vertrieb-Standard' bekommen die GPO angewendet - der Nutzer ist aber in der Gruppe 'Vertrieb-Extern'. Lösung: die richtige Gruppe in der Sicherheitsfilterung ergänzen.",
  },
  {
    id: "connect-sync-stopped",
    difficulty: "medium",
    title: "Ticket #3024 - Neue AD-Benutzer erscheinen nicht in Microsoft 365",
    symptom: "Seit einigen Tagen tauchen neu angelegte AD-Benutzerkonten nicht mehr in Microsoft 365 auf.",
    tools: [
      {
        id: "connecthealth",
        label: "Azure AD Connect Health prüfen",
        output: `Letzter erfolgreicher Sync: vor 3 Tagen
Letzter Sync-Versuch: vor 40 Minuten - Status: Fehlgeschlagen`,
      },
      {
        id: "servicestatus",
        label: "Sync-Dienst auf dem Connect-Server prüfen",
        output: `Dienst: Microsoft Azure AD Sync
Status: Beendet`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Synchronisierungsdienst (Azure AD Connect) ist beendet und synchronisiert daher keine neuen Konten mehr",
      "Die neuen Benutzer wurden im falschen Container in AD angelegt",
      "Die Lizenzen für Microsoft 365 sind aufgebraucht",
      "Das Passwort des Connect-Dienstkontos ist zu schwach",
    ],
    correctIndex: 0,
    explanation:
      "Der Sync-Dienst selbst ist beendet ('Status: Beendet') - ohne laufenden Dienst finden keine weiteren Synchronisierungsläufe statt, weder für neue Benutzer noch für Änderungen. Dienst neu starten und Fehlerursache für den Stopp prüfen.",
  },
  {
    id: "conditional-access-block",
    difficulty: "medium",
    title: "Ticket #3031 - Anmeldung trotz korrektem Passwort blockiert",
    symptom:
      "Ein Nutzer kann sich mit korrektem Passwort nicht anmelden. Fehlermeldung: 'Ihre Organisation benötigt weitere Informationen, um Ihr Konto zu schützen.'",
    tools: [
      {
        id: "signinlog",
        label: "Anmeldeprotokoll in Entra ID prüfen",
        output: `Anmeldeversuch: fehlgeschlagen
Fehlercode: 53003
Grund: Blocked by Conditional Access Policy`,
      },
      {
        id: "policy",
        label: "Details der ausgelösten Richtlinie prüfen",
        output: `Richtlinie: 'Zugriff nur von konformen Geräten'
Bedingung: Gerät muss als konform (Intune-verwaltet) registriert sein
Verwendetes Gerät: nicht registriert (privates Gerät)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Eine Conditional-Access-Richtlinie verlangt ein verwaltetes/konformes Gerät, das aktuell genutzte private Gerät erfüllt das nicht",
      "Das Konto des Nutzers ist deaktiviert",
      "Der Nutzer hat sein Passwort falsch eingegeben",
      "Die Multi-Faktor-Authentifizierung ist für das Konto nicht eingerichtet",
    ],
    correctIndex: 0,
    explanation:
      "Fehlercode 53003 ist der Standard-Fehlercode für eine durch Conditional Access blockierte Anmeldung. Die Richtliniendetails zeigen den genauen Grund: das verwendete Gerät ist nicht als konform registriert. Lösung: Gerät in Intune registrieren/als konform einstufen lassen, oder ein verwaltetes Gerät nutzen.",
  },
  {
    id: "license-service-disabled",
    difficulty: "medium",
    title: "Ticket #3037 - Teams fehlt trotz zugewiesener Lizenz",
    symptom: "Ein Nutzer hat laut Lizenzübersicht eine volle Microsoft-365-Lizenz, Teams lässt sich aber nicht öffnen.",
    tools: [
      {
        id: "licensedetail",
        label: "Lizenzzuweisung im Detail prüfen",
        output: `Lizenz: Microsoft 365 Business Premium - zugewiesen
Enthaltene Dienste:
  Exchange Online       : Aktiviert
  SharePoint Online     : Aktiviert
  Microsoft Teams       : Deaktiviert (manuell)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Der Teams-Dienst wurde innerhalb der zugewiesenen Lizenz manuell deaktiviert",
      "Der Nutzer hat keine gültige Lizenz",
      "Teams ist auf dem Gerät des Nutzers nicht installiert",
      "Der Nutzer ist in der falschen Zeitzone eingetragen",
    ],
    correctIndex: 0,
    explanation:
      "Eine Lizenz besteht aus mehreren einzeln (de)aktivierbaren Diensten. Hier ist die Lizenz zwar zugewiesen, aber der Teams-Baustein innerhalb dieser Lizenz wurde separat deaktiviert. Lösung: den Dienst 'Microsoft Teams' innerhalb der Lizenzzuweisung aktivieren.",
  },
  {
    id: "password-hash-sync-delay",
    difficulty: "hard",
    title: "Ticket #3044 - Neues Passwort funktioniert lokal, aber nicht in der Cloud",
    symptom:
      "Ein Nutzer hat sein Passwort lokal geändert. An seinem PC (Domain-Anmeldung) funktioniert das neue Passwort sofort, bei Microsoft 365 wird es noch als falsch abgelehnt.",
    tools: [
      {
        id: "syncstatus",
        label: "Password Hash Sync - letzten Lauf prüfen",
        output: `Password Hash Sync - letzter Lauf: vor 25 Minuten
Konfiguriertes Sync-Intervall: 30 Minuten (Standard: 2 Minuten, wurde manuell erhöht)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Das Passwort-Hash-Sync-Intervall wurde ungewöhnlich hoch eingestellt, die Änderung ist in der Cloud schlicht noch nicht angekommen",
      "Der Nutzer hat sich vertippt",
      "Das Cloud-Konto wurde versehentlich gelöscht",
      "Es liegt ein Netzwerkausfall zwischen Client und Domain-Controller vor",
    ],
    correctIndex: 0,
    explanation:
      "Password Hash Sync läuft standardmässig alle 2 Minuten, wurde hier aber auf 30 Minuten gestellt. Die Passwortänderung ist lokal sofort wirksam, muss aber erst über den nächsten Sync-Lauf in die Cloud übertragen werden. Lösung: kurz abwarten, einen manuellen Delta-Sync anstossen, oder das Intervall wieder auf den Standardwert zurücksetzen.",
  },
  {
    id: "dynamic-group-attribute",
    difficulty: "hard",
    title: "Ticket #3052 - Neue Mitarbeitende landen in der falschen Gruppe",
    symptom:
      "Mehrere neue Mitarbeitende der Abteilung Vertrieb bekommen automatisch nicht die erwarteten Zugriffsrechte über die dynamische Gruppe 'GRP-Vertrieb'.",
    tools: [
      {
        id: "dynrule",
        label: "Regel der dynamischen Gruppe prüfen",
        output: `Dynamische Mitgliedschaftsregel:
(user.department -eq "Vertrieb")`,
      },
      {
        id: "attribute",
        label: "Abteilungsattribut der betroffenen neuen Nutzer prüfen",
        output: `Nutzer: mschmid   department: "Vertrieb "   (Leerzeichen am Ende)
Nutzer: tfischer  department: (leer)`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Fehlerhafte/inkonsistente Werte im department-Attribut (Tippfehler, Leerzeichen, leer) erfüllen die exakte Regelbedingung nicht",
      "Die dynamische Gruppe ist grundsätzlich falsch konfiguriert und funktioniert bei niemandem",
      "Die neuen Nutzer wurden nicht lizenziert",
      "Dynamische Gruppen aktualisieren sich nur einmal im Monat",
    ],
    correctIndex: 0,
    explanation:
      'Die Regel prüft exakt auf den String "Vertrieb". Ein Leerzeichen ("Vertrieb ") oder ein leeres Feld erfüllt diese exakte Bedingung nicht, obwohl es für einen Menschen wie die richtige Abteilung aussieht. Lösung: Attributwerte bei der Anlage neuer Nutzer bereinigen/validieren, ggf. die Regel toleranter gestalten (z.B. mit trim-ähnlicher Prüfung, wo unterstützt).',
  },
  {
    id: "compliance-policy-tightened",
    difficulty: "hard",
    title: "Ticket #3061 - Plötzlich alle iOS-Geräte als nicht konform markiert",
    symptom:
      "Über Nacht werden in Intune praktisch alle iPhones als 'nicht konform' angezeigt, obwohl sich an den Geräten nichts geändert hat.",
    tools: [
      {
        id: "compliancereport",
        label: "Compliance-Bericht prüfen",
        output: `Nicht-Konformitätsgrund (alle betroffenen Geräte):
'Betriebssystemversion nicht unterstützt - Minimum iOS 17.0 erforderlich'`,
      },
      {
        id: "policyhistory",
        label: "Änderungsverlauf der Compliance-Richtlinie prüfen",
        output: `Compliance-Richtlinie 'iOS-Mindeststandard'
Geändert: gestern, 22:00 Uhr
Änderung: Mindest-iOS-Version von 15.0 auf 17.0 angehoben`,
      },
    ],
    question: "Was ist die wahrscheinlichste Ursache?",
    options: [
      "Die Compliance-Richtlinie wurde gestern verschärft (höhere Mindestversion), viele Geräte laufen noch auf einer älteren iOS-Version",
      "Apple hat einen globalen Dienstausfall",
      "Die Geräte haben grundsätzlich den Kontakt zu Intune verloren",
      "Es handelt sich um einen Zertifikatsfehler auf den Geräten",
    ],
    correctIndex: 0,
    explanation:
      "Der Änderungsverlauf zeigt exakt den Auslöser: die Mindest-iOS-Version wurde gestern Abend angehoben. Alle Geräte, die noch nicht auf die neue Mindestversion aktualisiert sind, gelten seither als nicht konform. Lösung: Geräte aktualisieren lassen (z.B. per Update-Richtlinie) oder eine Übergangsfrist für die Umstellung einplanen.",
  },
];

document.addEventListener("DOMContentLoaded", () => initTicketTrainer(SCENARIOS, MODULE_ID));
