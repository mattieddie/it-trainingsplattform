# Netzwerk- & Security-Trainingsplattform

Eine interaktive, rein clientseitige Uebungsplattform fuer Netzwerk- und
IT-Security-Grundlagen. Kein Server, keine echte Datenbank, kein Login -
alles laeuft im Browser, Fortschritt wird nur lokal (`localStorage`)
gespeichert.

> **Hinweis:** Dies ist eine Lernsimulation. Insbesondere das
> SQL-Injection-Modul arbeitet ausschliesslich gegen ein hartcodiertes
> JavaScript-Array im Browser. Es gibt keine echte Datenbank, keinen
> echten Server und keine echte Codeausfuehrung von Nutzereingaben.

## Module

1. **Subnetting-Trainer** ([modules/subnetting.html](modules/subnetting.html))
   Zufaellig generierte IP/CIDR-Aufgaben: Netzadresse, Broadcast, nutzbare
   Hosts, naechstes Subnetz. Drei Schwierigkeitsstufen.
2. **DHCP/DNS-Troubleshooting** ([modules/dhcp-dns.html](modules/dhcp-dns.html))
   Helpdesk-Tickets mit simulierten `ipconfig`/`nslookup`/`ping`-Ausgaben,
   Multiple-Choice-Diagnose mit Erklaerung.
3. **Firewall-Regel-Puzzle** ([modules/firewall.html](modules/firewall.html))
   Firewall-Regeln per Drag & Drop oder Pfeil-Buttons in die richtige
   Reihenfolge bringen ("erste passende Regel gewinnt"), Validierung ueber
   simulierte Testpakete.
4. **SQL-Injection-Simulation** ([modules/sqli.html](modules/sqli.html))
   Simuliertes Login-Formular gegen eine hartcodierte Fake-User-Liste:
   einmal unsicher (String-Verkettung), einmal sicher (parametrisiert).
5. **DNS & Domain-Konzepte** ([modules/dns-concepts.html](modules/dns-concepts.html))
   A/CNAME-Records, TTL, Propagation - inkl. Konfigurator fuer
   Beispiel-DNS-Eintraege zur eigenen GitHub-Pages-Domain.

## Projektstruktur

```
/
├── index.html                  Startseite mit Modul-Uebersicht + Fortschritt
├── css/style.css                Gemeinsames responsives Theme
├── js/
│   ├── progress.js               localStorage-Fortschritt (von allen Modulen genutzt)
│   ├── subnetting.js
│   ├── dhcp-dns.js
│   ├── firewall.js
│   ├── sqli.js
│   └── dns-concepts.js
├── modules/
│   ├── subnetting.html
│   ├── dhcp-dns.html
│   ├── firewall.html
│   ├── sqli.html
│   └── dns-concepts.html
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
