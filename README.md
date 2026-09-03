# IT-Trainingsplattform

Eine interaktive, rein clientseitige Uebungsplattform fuer IT-Grundlagen -
von Computer-Hardware und Windows ueber Netzwerke und Security bis Cloud.
Kein Server, keine echte Datenbank, kein Login - alles laeuft im Browser,
Fortschritt wird nur lokal (`localStorage`) gespeichert.

> **Hinweis:** Dies ist eine Lernsimulation. Insbesondere das
> SQL-Injection-Modul arbeitet ausschliesslich gegen ein hartcodiertes
> JavaScript-Array im Browser. Es gibt keine echte Datenbank, keinen
> echten Server und keine echte Codeausfuehrung von Nutzereingaben.

## Module

0. **Computer- & Windows-Grundlagen** ([modules/computer-basics.html](modules/computer-basics.html)) - Startmodul
   Computeraufbau (CPU/RAM/Speicher/Mainboard, inkl. Diagramm), Benutzer- vs.
   Systemebene, NTFS-Berechtigungen, Registry und Dateitypen - schwierigkeits-
   gestuftes Quiz, thematisch gruppiert.
1. **Subnetting-Trainer** ([modules/subnetting.html](modules/subnetting.html))
   Zufaellig generierte IP/CIDR-Aufgaben: Netzadresse, Broadcast, nutzbare
   Hosts, naechstes Subnetz. Drei Schwierigkeitsstufen.
2. **DHCP/DNS-Troubleshooting** ([modules/dhcp-dns.html](modules/dhcp-dns.html))
   Helpdesk-Tickets mit simulierten `ipconfig`/`nslookup`/`ping`-Ausgaben,
   Multiple-Choice-Diagnose mit Erklaerung.
3. **Firewall-Regel-Puzzle** ([modules/firewall.html](modules/firewall.html))
   Drei Aufgabentypen: bestehende Regeln umsortieren, Regeln komplett selbst
   entwerfen, und Experten-Szenarien mit mehreren Firewalls/DMZ/VPN-Zweig-
   stellen, bei denen jedes Testpaket alle Firewalls auf seinem Weg passieren
   muss. Validierung ueber simulierte Testpakete ("erste passende Regel
   gewinnt").
4. **SQL-Injection-Simulation** ([modules/sqli.html](modules/sqli.html))
   Simuliertes Login-Formular gegen eine hartcodierte Fake-User-Liste:
   einmal unsicher (String-Verkettung), einmal sicher (parametrisiert).
5. **DNS & Domain-Konzepte** ([modules/dns-concepts.html](modules/dns-concepts.html))
   A/CNAME-Records, TTL, Propagation - inkl. Konfigurator fuer
   Beispiel-DNS-Eintraege zur eigenen GitHub-Pages-Domain.
6. **CMD & PowerShell Terminal-Trainer** ([modules/terminal.html](modules/terminal.html))
   Simuliertes Terminal (kein echter Shell-Zugriff): loese Aufgaben, indem
   du den passenden CMD- oder PowerShell-Befehl eintippst, mit gestaffelten
   Tipps nach Fehlversuchen.
7. **Active Directory** ([modules/active-directory.html](modules/active-directory.html))
   Gruppenrichtlinien-Vererbung (LSDOU, Enforce/Block Inheritance) als
   Vorhersage-Quiz anhand einer festen OU-Struktur, plus Troubleshooting-
   Tickets (Kontosperrung, falsche OU, Item-Level Targeting, Replikation,
   FSMO-Rollen).
8. **Intune / Entra ID / Hybrid** ([modules/intune-entra.html](modules/intune-entra.html))
   Join-Typen, Entra Connect, Conditional Access (bewusst als Kontrast zum
   Firewall-Modul: hier gewinnt nicht die erste Regel, sondern alle
   zutreffenden Richtlinien wirken kumulativ), ein Geraetemanagement-Quiz
   (Autopilot, Wipe vs. Retire, MDM vs. MAM) und Intune-Compliance, plus
   Troubleshooting-Tickets aus der Cloud-Identitaets-Welt.
9. **Backup & Recovery** ([modules/backup.html](modules/backup.html))
   3-2-1-Regel (inkl. Diagramm), generierte RPO/RTO-Rechenaufgaben in drei
   Schwierigkeitsstufen, sowie ein 3-2-1-/Ransomware-Szenario-Quiz.
10. **E-Mail-Sicherheit** ([modules/email-security.html](modules/email-security.html))
    SPF/DKIM/DMARC (inkl. Ablaufdiagramm), Record-Interpretation und
    Spoofing-/Zustellungs-Szenarien mit steigendem Schwierigkeitsgrad.
11. **Skripting-Grundlagen** ([modules/scripting.html](modules/scripting.html))
    Batch- und PowerShell-Skripte lesen und die tatsaechliche Ausgabe
    vorhersagen - inkl. klassischer Stolperfallen (Off-by-one, Batch-
    Verzoegerungsproblem bei verzoegerter Variablenerweiterung).
12. **Cloud-Grundlagen** ([modules/cloud-basics.html](modules/cloud-basics.html))
    RBAC-Rollenwahl nach Least Privilege, Privileged Identity Management
    (PIM) und M365-Lizenzierung (Service Plans, gruppenbasierte Lizenzierung).

Jede Konzept-Karte hat wo sinnvoll einen kleinen "i"-Button (i-Punkt) mit
einer kurzen, einfachen Zusatzerklaerung, und mehrere Module enthalten
eingebettete SVG-Diagramme (Hardware-Aufbau, IP-Adress-Aufteilung,
3-2-1-Regel, SPF/DKIM/DMARC-Ablauf) zur Veranschaulichung.

## Projektstruktur

```
/
├── index.html                  Startseite mit Modul-Uebersicht + Fortschritt
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
│   └── cloud-basics.js
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
│   └── cloud-basics.html
└── .nojekyll                    Verhindert GitHub-Pages-Jekyll-Verarbeitung
```

Jedes Modul besteht aus einer eigenen HTML-Datei und einer eigenen
JS-Datei. Neue Uebungen lassen sich als weiteres Modul nach demselben
Muster ergaenzen (siehe `js/progress.js` fuer die Modul-Liste, die auf der
Startseite angezeigt wird).

## Lokale Entwicklung

Reines HTML/CSS/JavaScript, kein Build-Schritt noetig. Zwei Optionen:

**Direkt oeffnen:** `index.html` per Doppelklick im Browser oeffnen. Da
keine Fetch-Requests auf lokale Dateien gemacht werden, funktioniert das
problemlos auch ueber `file://`.

**Mit lokalem Server** (empfohlen, naeher am spaeteren Deployment):

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser oeffnen.

## Deployment auf GitHub Pages

Da es sich um eine rein statische Seite handelt, reicht die einfachste
GitHub-Pages-Variante ganz ohne Build/Actions:

1. Repository auf GitHub erstellen und den Code pushen (siehe unten).
2. Im Repository zu **Settings → Pages** gehen.
3. Unter **Source** die Option **Deploy from a branch** waehlen.
4. Branch **main** und Ordner **/ (root)** auswaehlen, speichern.
5. Nach kurzer Zeit ist die Seite unter
   `https://<dein-username>.github.io/<repo-name>/` erreichbar.

### Alternative: GitHub Actions Workflow

Falls spaeter ein Build-Schritt dazukommt (z.B. Minifizierung), kann
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

Fuer dieses Projekt (kein Build noetig) reicht aber die einfache
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

Um zusaetzlich DNS/WAF-Konzepte am Beispiel dieser Seite zu zeigen, kann
spaeter Cloudflare (kostenlos) vor die GitHub-Pages-Seite geschaltet
werden:

1. Domain bei Cloudflare hinzufuegen (kostenloser Plan reicht).
2. Nameserver der Domain beim Registrar auf die von Cloudflare
   vorgegebenen Nameserver umstellen.
3. In Cloudflare unter **DNS** die Eintraege fuer GitHub Pages anlegen:
   - `A`-Records auf der Apex-Domain (z.B. `beispiel.ch`) auf die vier
     GitHub-Pages-IPs: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
   - `CNAME`-Record fuer `www` auf `<dein-username>.github.io`.
   - Proxy-Status (orange Wolke) aktiviert lassen, um Cloudflares
     Proxy/WAF zu nutzen.
4. Im GitHub-Repository unter **Settings → Pages → Custom domain** die
   eigene Domain eintragen (erzeugt automatisch eine `CNAME`-Datei im
   Repo-Root).
5. **SSL/TLS-Modus** in Cloudflare auf **Full** stellen, da GitHub Pages
   selbst HTTPS bereitstellt.

Das Modul "DNS & Domain-Konzepte" in der App enthaelt einen Konfigurator,
der die passenden Beispiel-Eintraege fuer die eigene Domain generiert.

## Technische Hinweise

- Kein Framework, kein Bundler, keine externen Abhaengigkeiten.
- Fortschritt wird ausschliesslich lokal im Browser gespeichert
  (`localStorage`), es gibt keine Server-Komponente und keine
  Nutzerkonten.
- Das SQL-Injection-Modul erkennt Injection-Muster (z.B.
  `' OR '1'='1`, Kommentar-Injection) ueber einfache Mustererkennung
  (RegEx) auf einem rein zur Veranschaulichung zusammengebauten
  Text - es wird nirgends echtes SQL geparst oder ausgefuehrt.
