# IT-Trainingsplattform

Eine interaktive, rein clientseitige Übungsplattform für IT-Grundlagen -
von Computer-Hardware und Windows über Netzwerke und Security bis Cloud.
Kein Server, keine echte Datenbank, kein Login - alles läuft im Browser,
Fortschritt wird nur lokal (`localStorage`) gespeichert.

> **Hinweis:** Dies ist eine Lernsimulation. Sowohl das
> SQL-Injection-Modul als auch die SQL-Sandbox im Datenbanken-Modul
> arbeiten ausschliesslich gegen hartcodierte JavaScript-Daten im
> Browser (bzw. einen selbstgebauten, stark vereinfachten
> SELECT-Interpreter). Es gibt keine echte Datenbank, keinen echten
> Server und keine echte Codeausführung von Nutzereingaben.

## Module

Die 28 Module sind in 7 **Baukästen** (Lernpfad-Blöcke) gruppiert, die
aufeinander aufbauen - vom Fundament bis zum Betrieb. Die Reihenfolge ist
in `js/progress.js` (`TRACKS`/`MODULES`) zentral gepflegt und bestimmt
sowohl die Gruppierung auf der Startseite als auch die Navigationsleiste:
dort erscheint pro Baukasten ein Dropdown-Button, der beim Klick die
zugehörigen Module auflistet (aktiver Baukasten und aktives Modul werden
farblich hervorgehoben).

Zusätzlich zeigt die Startseite unter **"Lernpfad"** eine Übersicht, welche
Module fachlich aufeinander aufbauen - inkl. Verbindungen, die über
Baukasten-Grenzen hinweg gehen (z.B. Active Directory setzt funktionierendes
DHCP/DNS aus dem Netzwerk-Baukasten voraus). Jede Modul-Karte zeigt dazu
passend einen "Baut auf: ..."-Hinweis. Die Abhängigkeiten sind als
`prereqs`-Feld pro Modul in `js/progress.js` gepflegt.

**1. IT-Grundlagen** - das Handwerkszeug
- **Computer- & Windows-Grundlagen** ([modules/computer-basics.html](modules/computer-basics.html)) - Startmodul: Computeraufbau (inkl. Hardware-Diagramm), Benutzer- vs. Systemebene, NTFS-Berechtigungen (inkl. nachgebautem Berechtigungsdialog), Registry (inkl. Root-Key/Schlüssel/Wert-Baumdiagramm), Dateitypen.
- **CMD & PowerShell Terminal-Trainer** ([modules/terminal.html](modules/terminal.html)) - simuliertes Terminal, Befehle eintippen statt auswählen, gestaffelte Tipps.
- **Skripting-Grundlagen** ([modules/scripting.html](modules/scripting.html)) - Batch-/PowerShell-Skripte lesen und deren Ausgabe vorhersagen, inkl. klassischer Stolperfallen.
- **Virtualisierung & Docker-Grundlagen** ([modules/containers.html](modules/containers.html)) - Typ-1- vs. Typ-2-Hypervisor, virtuelle Maschinen vs. Container, Docker-Kernbegriffe (Image/Container/Dockerfile/Registry), inkl. Reihenfolge-Puzzle "vom Code zum laufenden Container".
- **Datenbanken** ([modules/databases.html](modules/databases.html)) - Datenbanktypen (relational/Key-Value/Document/Wide-Column/Graph), relationale Beziehungen (1:1/1:N/M:N), ER-Diagramme/Kardinalitäten, Verbindungen zu Datenbanken (Ports/Treiber), inkl. offen einsehbarer Testdatenbank mit eigener SQL-Sandbox (selbstgebauter, stark vereinfachter SELECT-Interpreter) und 9 Abfrage-Aufgaben.
- **PC-Troubleshooting** ([modules/pc-troubleshooting.html](modules/pc-troubleshooting.html)) - 8 Helpdesk-Tickets rund um PC-/Windows-Grundlagen (Boot-Probleme, Spooler, Speicherplatz, Malware, defektes RAM, Firmware-Bugs, gebrochene Domain-Vertrauensstellung).

**2. Netzwerk-Grundlagen** - wie Geräte sich finden
- **Netzwerkpakete, TCP/UDP & OSI-Modell** ([modules/network-packets.html](modules/network-packets.html)) - Kapselung/Paketaufbau (inkl. detailliertem IP-Header-Bitfeld), TTL, TCP-Handshake, TCP-vs-UDP-Analogie-Grafik, OSI- vs. TCP/IP-Modell, inkl. OSI-Reihenfolge-Puzzle und Port-↔-Dienst-Zuordnungsspiel.
- **Netzwerkgeräte & Routing** ([modules/network-devices.html](modules/network-devices.html)) - Hub/Switch/Router im Vergleich, plus generierte Routing-Tabellen-Aufgaben (Longest Prefix Match).
- **Subnetting-Trainer** ([modules/subnetting.html](modules/subnetting.html)) - generierte IP/CIDR-Aufgaben, drei Schwierigkeitsstufen, inkl. Bit-für-Bit-Aufschlüsselung einer Subnetzmaske.
- **DNS & Domain-Konzepte** ([modules/dns-concepts.html](modules/dns-concepts.html)) - A/CNAME/TTL/Propagation, inkl. Domain-Konfigurator.
- **DNS-Auflösung & DHCP-Prozess** ([modules/dns-dhcp-basics.html](modules/dns-dhcp-basics.html)) - der DHCP-DORA-Prozess und die rekursive DNS-Auflösung Schritt für Schritt (Diagramme), plus Referenztabelle aller DNS-Record-Typen, inkl. DORA-Reihenfolge-Puzzle und Record-Typ-↔-Zweck-Zuordnungsspiel.
- **DHCP/DNS-Troubleshooting** ([modules/dhcp-dns.html](modules/dhcp-dns.html)) - zehn Helpdesk-Tickets mit simulierten Tool-Ausgaben.
- **VPN-Grundlagen** ([modules/vpn-basics.html](modules/vpn-basics.html)) - Site-to-Site vs. Client-to-Site, IPSec vs. SSL-VPN (inkl. Vergleichsdiagramm), Split- vs. Full-Tunneling.

**3. Verzeichnisdienste & Identität** - On-Premises bis Cloud
- **Active Directory** ([modules/active-directory.html](modules/active-directory.html)) - GPO-Vererbung (LSDOU) als Vorhersage-Quiz, plus Troubleshooting-Tickets.
- **Intune / Entra ID / Hybrid** ([modules/intune-entra.html](modules/intune-entra.html)) - Join-Typen, Conditional Access (Kontrast zum Firewall-Modul: kumulative statt erste-Regel-Logik), Gerätemanagement-Quiz, Tickets.
- **Cloud-Grundlagen** ([modules/cloud-basics.html](modules/cloud-basics.html)) - Shared-Responsibility-Modell (On-Premises/IaaS/PaaS/SaaS), Azure-Ressourcenhierarchie, RBAC/Least Privilege, PIM &amp; PIM for Groups, M365-Lizenzierung.
- **Identitäts-Troubleshooting** ([modules/identity-troubleshooting.html](modules/identity-troubleshooting.html)) - 8 Helpdesk-Tickets rund um Active Directory, Entra ID, Intune und Hybrid-Identität (Kontosperrung, GPO-Sicherheitsfilterung, Connect-Sync, Conditional Access, Lizenzdienste, Password-Hash-Sync-Delay, dynamische Gruppen, Compliance-Richtlinien).

**4. Softwareverteilung & Paketierung** - Apps bereitstellen
- **Software-Paketierung** ([modules/packaging.html](modules/packaging.html)) - MSI-Aufbau (Tabellen/Dateistreams), Transforms (MST), stille CMD-Installation, Repackaging-Workflow (RayPack: RCP/RPP).
- **Paketierungs-Troubleshooting** ([modules/packaging-troubleshooting.html](modules/packaging-troubleshooting.html)) - 8 Helpdesk-Tickets rund um MSI/Silent-Install-Fehler, GPO-Softwareverteilung, Repackaging-Abhängigkeiten, Intune-Erkennungsregeln und fehlende UpgradeCodes.

**5. IT-Security** - Angriffsflächen erkennen und absichern
- **Verschlüsselung** ([modules/encryption.html](modules/encryption.html)) - symmetrisch/asymmetrisch/hybrid, Diffie-Hellman-Schlüsselaustausch, Hashing & Salt, inkl. zweier Live-Demos mit echtem SHA-256 (Web-Crypto-API im Browser).
- **Zertifikate & PKI** ([modules/certificates.html](modules/certificates.html)) - Vertrauenskette (Root-CA/Intermediate-CA), Zertifikatsfelder, Ablauf & Widerruf (CRL/OCSP), automatisierte Zertifikatsverteilung per SCEP über Intune (inkl. NDES), Begriffs-Zuordnungsspiel.
- **Firewall-Regel-Puzzle** ([modules/firewall.html](modules/firewall.html)) - Regeln umsortieren, selbst entwerfen, Multi-Firewall-Topologien (DMZ/VPN).
- **SQL-Injection-Simulation** ([modules/sqli.html](modules/sqli.html)) - sandboxed, unsicher vs. parametrisiert, drei Herausforderungen.
- **E-Mail-Sicherheit** ([modules/email-security.html](modules/email-security.html)) - SPF/DKIM/DMARC inkl. mehrerer Ablaufdiagramme, Erklärung von `include:_spf.google.com`, interaktivem Schritt-für-Schritt-Vergleich ("welche Prüfung schaut welchen Mail-Teil an"), Alignment-Konzept und komplettem Beispiel-Ablauf mit vier Szenarien.
- **Security-Troubleshooting** ([modules/security-troubleshooting.html](modules/security-troubleshooting.html)) - 8 Security-Tickets rund um Phishing/CEO-Fraud, abgelaufene Zertifikate, Firewall-Regelreihenfolge, SQL-Injection, fehlendes DMARC, falsch verwendete Schlüssel, kompromittierte Server und VPN-Session-Timeouts.

**6. Betrieb & Notfallvorsorge**
- **Backup & Recovery** ([modules/backup.html](modules/backup.html)) - 3-2-1-Regel (inkl. Diagramm), RAID-Level 0/1/5/6/10 mit Diagrammen, generierte RPO/RTO-Rechenaufgaben (inkl. Diagramm), Ransomware-Szenario-Quiz.
- **Backup-Troubleshooting** ([modules/backup-troubleshooting.html](modules/backup-troubleshooting.html)) - 8 Betriebs-Tickets rund um volle Backup-Ziele, lange inkrementelle Restores, degradierte RAID-Arrays, unbemerkt beschädigte Sicherungen, Ransomware auf dem Backup-Ziel, RTO-Verletzungen und fehlgeschlagene GFS-Läufe.

**7. Abschlussprüfung**
- **Abschlussprüfung** ([modules/final-exam.html](modules/final-exam.html)) - 12 Fragen, zufällig gezogen aus einem grösseren Pool pro Baukasten (moderater Schwierigkeitsgrad, Anwendungsszenarien statt reinem Auswendiglernen), Antwortoptionen zusätzlich gemischt - bei jedem Versuch eine andere Zusammenstellung. Enthält einen deutlichen Hinweis, die Prüfung ohne KI-Hilfsmittel zu bearbeiten (technisch auf einer rein clientseitigen Seite nicht erzwingbar, siehe Hinweis im Modul selbst).

Jede Konzept-Karte hat wo sinnvoll einen kleinen "i"-Button (i-Punkt) mit
einer kurzen, einfachen Zusatzerklärung/Analogie, und mehrere Module
enthalten eingebettete SVG-Diagramme (Hardware-Aufbau, IP-Adress-Aufteilung,
3-2-1-Regel, SPF/DKIM/DMARC-Ablauf inkl. Alignment, MSI-Struktur,
Transform-Anwendung, RayPack-Workflow) zur Veranschaulichung.

## Projektstruktur

```
/
├── index.html                  Startseite mit Modul-Übersicht + Fortschritt
├── css/style.css                Gemeinsames responsives Theme
├── js/
│   ├── progress.js               localStorage-Fortschritt (von allen Modulen genutzt)
│   ├── computer-basics.js
│   ├── subnetting.js
│   ├── dhcp-dns.js
│   ├── firewall.js
│   ├── sqli.js
│   ├── dns-concepts.js
│   ├── terminal.js
│   ├── active-directory.js
│   ├── intune-entra.js
│   ├── backup.js
│   ├── email-security.js
│   ├── scripting.js
│   ├── cloud-basics.js
│   ├── packaging.js
│   ├── network-devices.js
│   ├── network-packets.js
│   ├── vpn-basics.js
│   ├── encryption.js
│   ├── final-exam.js
│   ├── dns-dhcp-basics.js
│   ├── certificates.js
│   ├── containers.js
│   ├── database.js
│   ├── pc-troubleshooting.js
│   ├── identity-troubleshooting.js
│   ├── packaging-troubleshooting.js
│   ├── security-troubleshooting.js
│   └── backup-troubleshooting.js
├── modules/
│   ├── computer-basics.html
│   ├── containers.html
│   ├── databases.html
│   ├── pc-troubleshooting.html
│   ├── network-packets.html
│   ├── network-devices.html
│   ├── vpn-basics.html
│   ├── subnetting.html
│   ├── dns-dhcp-basics.html
│   ├── dhcp-dns.html
│   ├── encryption.html
│   ├── certificates.html
│   ├── firewall.html
│   ├── sqli.html
│   ├── dns-concepts.html
│   ├── terminal.html
│   ├── active-directory.html
│   ├── intune-entra.html
│   ├── identity-troubleshooting.html
│   ├── backup.html
│   ├── backup-troubleshooting.html
│   ├── email-security.html
│   ├── security-troubleshooting.html
│   ├── scripting.html
│   ├── cloud-basics.html
│   ├── packaging.html
│   ├── packaging-troubleshooting.html
│   └── final-exam.html
├── images/                      Eingebundene Screenshots/Diagramme (siehe unten)
└── .nojekyll                    Verhindert GitHub-Pages-Jekyll-Verarbeitung
```

Jedes Modul besteht aus einer eigenen HTML-Datei und einer eigenen
JS-Datei. Neue Übungen lassen sich als weiteres Modul nach demselben
Muster ergänzen (siehe `js/progress.js` für die Modul-Liste, die auf der
Startseite angezeigt wird).

## Lokale Entwicklung

Reines HTML/CSS/JavaScript, kein Build-Schritt nötig. Zwei Optionen:

**Direkt öffnen:** `index.html` per Doppelklick im Browser öffnen. Da
keine Fetch-Requests auf lokale Dateien gemacht werden, funktioniert das
problemlos auch über `file://`.

**Mit lokalem Server** (empfohlen, näher am späteren Deployment):

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.

## Deployment auf GitHub Pages

Da es sich um eine rein statische Seite handelt, reicht die einfachste
GitHub-Pages-Variante ganz ohne Build/Actions:

1. Repository auf GitHub erstellen und den Code pushen (siehe unten).
2. Im Repository zu **Settings → Pages** gehen.
3. Unter **Source** die Option **Deploy from a branch** wählen.
4. Branch **main** und Ordner **/ (root)** auswählen, speichern.
5. Nach kurzer Zeit ist die Seite unter
   `https://<dein-username>.github.io/<repo-name>/` erreichbar.

### Alternative: GitHub Actions Workflow

Falls später ein Build-Schritt dazukommt (z.B. Minifizierung), kann
stattdessen ein Workflow wie folgt verwendet werden
(`.github/workflows/pages.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: "."
      - id: deployment
        uses: actions/deploy-pages@v4
```

Für dieses Projekt (kein Build nötig) reicht aber die einfache
Branch-Deployment-Variante oben vollkommen aus.

### Git & GitHub Setup (falls noch nicht geschehen)

```bash
git init
git add .
git commit -m "Initial commit: IT-Trainingsplattform"
git branch -M main
git remote add origin https://github.com/<dein-username>/<repo-name>.git
git push -u origin main
```

Pages danach wie oben beschrieben in den Repo-Settings aktivieren.

## Optional: Cloudflare als DNS/Proxy davorschalten

Um zusätzlich DNS/WAF-Konzepte am Beispiel dieser Seite zu zeigen, kann
später Cloudflare (kostenlos) vor die GitHub-Pages-Seite geschaltet
werden:

1. Domain bei Cloudflare hinzufügen (kostenloser Plan reicht).
2. Nameserver der Domain beim Registrar auf die von Cloudflare
   vorgegebenen Nameserver umstellen.
3. In Cloudflare unter **DNS** die Einträge für GitHub Pages anlegen:
   - `A`-Records auf der Apex-Domain (z.B. `beispiel.ch`) auf die vier
     GitHub-Pages-IPs: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
   - `CNAME`-Record für `www` auf `<dein-username>.github.io`.
   - Proxy-Status (orange Wolke) aktiviert lassen, um Cloudflares
     Proxy/WAF zu nutzen.
4. Im GitHub-Repository unter **Settings → Pages → Custom domain** die
   eigene Domain eintragen (erzeugt automatisch eine `CNAME`-Datei im
   Repo-Root).
5. **SSL/TLS-Modus** in Cloudflare auf **Full** stellen, da GitHub Pages
   selbst HTTPS bereitstellt.

Das Modul "DNS & Domain-Konzepte" in der App enthält einen Konfigurator,
der die passenden Beispiel-Einträge für die eigene Domain generiert.

## Interaktive Übungsformate

Neben klassischen Multiple-Choice-Quiz gibt es zwei wiederverwendbare
Übungstypen (implementiert in `js/progress.js`, von einzelnen Modulen
mit eigenen Daten befüllt):

- **Reihenfolge-Puzzle** (`initReorderPuzzle`) - Karten per Drag&amp;Drop
  oder Auf/Ab-Buttons in die richtige Reihenfolge bringen. Im Einsatz
  bei: OSI-Schichten (Netzwerkpakete), DORA-Schritte (DNS-Auflösung &amp;
  DHCP), Docker-Workflow (Virtualisierung &amp; Docker).
- **Zuordnungs-Puzzle** (`initMatchPuzzle`) - zwei gemischte Spalten per
  Klick zu Paaren verbinden. Im Einsatz bei: Port ↔ Dienst
  (Netzwerkpakete), DNS-Record-Typ ↔ Zweck (DNS-Auflösung &amp; DHCP),
  PKI-Begriff ↔ Bedeutung (Zertifikate &amp; PKI).

Dazu kommt die bereits bestehende Drag&amp;Drop-Regelsortierung im
Firewall-Modul (eigene Implementierung, da zusätzlich bearbeitbare
Felder pro Regel nötig sind), sowie die **SQL-Sandbox** im
Datenbanken-Modul (`js/database.js`) - ein selbstgebauter, stark
vereinfachter SELECT-Interpreter (SELECT/WHERE/JOIN/ORDER BY) gegen eine
offen einsehbare Testdatenbank, inkl. 9 Abfrage-Aufgaben, deren Ergebnis
automatisch gegen eine hinterlegte Referenz-Query geprüft wird.

Ausserdem gibt es den generischen **Ticket-Troubleshooting-Trainer**
(`initTicketTrainer`, ursprünglich für DHCP/DNS gebaut, jetzt
wiederverwendbar): ein Helpdesk-Ticket mit Symptom, anforderbaren
Diagnose-Tool-Ausgaben und einer Multiple-Choice-Ursachenfrage. Jedes
Modul-JS liefert nur noch eigene SCENARIOS-Daten. Im Einsatz bei:
DHCP/DNS-Troubleshooting (Netzwerk), PC-Troubleshooting (IT-Grundlagen),
Identitäts-Troubleshooting (Verzeichnisdienste), Paketierungs-, Security-
und Backup-Troubleshooting.

## Technische Hinweise

- Kein Framework, kein Bundler, keine externen Abhängigkeiten.
- Fortschritt wird ausschliesslich lokal im Browser gespeichert
  (`localStorage`), es gibt keine Server-Komponente und keine
  Nutzerkonten.
- Das SQL-Injection-Modul erkennt Injection-Muster (z.B.
  `' OR '1'='1`, Kommentar-Injection) über einfache Mustererkennung
  (RegEx) auf einem rein zur Veranschaulichung zusammengebauten
  Text - es wird nirgends echtes SQL geparst oder ausgeführt.
