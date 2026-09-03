# IT-Trainingsplattform

Eine interaktive, rein clientseitige Übungsplattform für IT-Grundlagen -
von Computer-Hardware und Windows über Netzwerke und Security bis Cloud.
Kein Server, keine echte Datenbank, kein Login - alles läuft im Browser,
Fortschritt wird nur lokal (`localStorage`) gespeichert.

> **Hinweis:** Dies ist eine Lernsimulation. Insbesondere das
> SQL-Injection-Modul arbeitet ausschliesslich gegen ein hartcodiertes
> JavaScript-Array im Browser. Es gibt keine echte Datenbank, keinen
> echten Server und keine echte Codeausführung von Nutzereingaben.

## Module

Die 14 Module sind in 6 **Baukästen** (Lernpfad-Blöcke) gruppiert, die
aufeinander aufbauen - vom Fundament bis zum Betrieb. Die Reihenfolge ist
in `js/progress.js` (`TRACKS`/`MODULES`) zentral gepflegt und bestimmt
sowohl die Gruppierung auf der Startseite als auch die Navigationsreihenfolge.

**1. IT-Grundlagen** - das Handwerkszeug
- **Computer- & Windows-Grundlagen** ([modules/computer-basics.html](modules/computer-basics.html)) - Startmodul: Computeraufbau (inkl. Hardware-Diagramm), Benutzer- vs. Systemebene, NTFS-Berechtigungen, Registry, Dateitypen.
- **CMD & PowerShell Terminal-Trainer** ([modules/terminal.html](modules/terminal.html)) - simuliertes Terminal, Befehle eintippen statt auswählen, gestaffelte Tipps.
- **Skripting-Grundlagen** ([modules/scripting.html](modules/scripting.html)) - Batch-/PowerShell-Skripte lesen und deren Ausgabe vorhersagen, inkl. klassischer Stolperfallen.

**2. Netzwerk-Grundlagen** - wie Geräte sich finden
- **Subnetting-Trainer** ([modules/subnetting.html](modules/subnetting.html)) - generierte IP/CIDR-Aufgaben, drei Schwierigkeitsstufen.
- **DNS & Domain-Konzepte** ([modules/dns-concepts.html](modules/dns-concepts.html)) - A/CNAME/TTL/Propagation, inkl. Domain-Konfigurator.
- **DHCP/DNS-Troubleshooting** ([modules/dhcp-dns.html](modules/dhcp-dns.html)) - zehn Helpdesk-Tickets mit simulierten Tool-Ausgaben.

**3. Verzeichnisdienste & Identität** - On-Premises bis Cloud
- **Active Directory** ([modules/active-directory.html](modules/active-directory.html)) - GPO-Vererbung (LSDOU) als Vorhersage-Quiz, plus Troubleshooting-Tickets.
- **Intune / Entra ID / Hybrid** ([modules/intune-entra.html](modules/intune-entra.html)) - Join-Typen, Conditional Access (Kontrast zum Firewall-Modul: kumulative statt erste-Regel-Logik), Gerätemanagement-Quiz, Tickets.
- **Cloud-Grundlagen** ([modules/cloud-basics.html](modules/cloud-basics.html)) - RBAC/Least Privilege, PIM, M365-Lizenzierung.

**4. Softwareverteilung & Paketierung** - Apps bereitstellen
- **Software-Paketierung** ([modules/packaging.html](modules/packaging.html)) - MSI-Aufbau (Tabellen/Dateistreams), Transforms (MST), stille CMD-Installation, Repackaging-Workflow (RayPack: RCP/RPP).

**5. IT-Security** - Angriffsflächen erkennen und absichern
- **Firewall-Regel-Puzzle** ([modules/firewall.html](modules/firewall.html)) - Regeln umsortieren, selbst entwerfen, Multi-Firewall-Topologien (DMZ/VPN).
- **SQL-Injection-Simulation** ([modules/sqli.html](modules/sqli.html)) - sandboxed, unsicher vs. parametrisiert, drei Herausforderungen.
- **E-Mail-Sicherheit** ([modules/email-security.html](modules/email-security.html)) - SPF/DKIM/DMARC inkl. mehrerer Ablaufdiagramme, Alignment-Konzept, kompletter Beispiel-Ablauf mit vier Szenarien.

**6. Betrieb & Notfallvorsorge**
- **Backup & Recovery** ([modules/backup.html](modules/backup.html)) - 3-2-1-Regel (inkl. Diagramm), generierte RPO/RTO-Rechenaufgaben, Ransomware-Szenario-Quiz.

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
│   └── packaging.js
├── modules/
│   ├── computer-basics.html
│   ├── subnetting.html
│   ├── dhcp-dns.html
│   ├── firewall.html
│   ├── sqli.html
│   ├── dns-concepts.html
│   ├── terminal.html
│   ├── active-directory.html
│   ├── intune-entra.html
│   ├── backup.html
│   ├── email-security.html
│   ├── scripting.html
│   ├── cloud-basics.html
│   └── packaging.html
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
git commit -m "Initial commit: Netzwerk- & Security-Trainingsplattform"
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

## Technische Hinweise

- Kein Framework, kein Bundler, keine externen Abhängigkeiten.
- Fortschritt wird ausschliesslich lokal im Browser gespeichert
  (`localStorage`), es gibt keine Server-Komponente und keine
  Nutzerkonten.
- Das SQL-Injection-Modul erkennt Injection-Muster (z.B.
  `' OR '1'='1`, Kommentar-Injection) über einfache Mustererkennung
  (RegEx) auf einem rein zur Veranschaulichung zusammengebauten
  Text - es wird nirgends echtes SQL geparst oder ausgeführt.
