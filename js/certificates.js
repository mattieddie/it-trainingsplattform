/*
 * certificates.js - Modul: Zertifikate & PKI
 * Vertrauenskette, Zertifikatsfelder, Ablauf/Widerruf, sowie SCEP-Verteilung
 * über Intune. Baut auf dem Modul "Verschlüsselung" (asymmetrische
 * Verschlüsselung) auf.
 */

const MODULE_ID = "certificates";

const TERM_PAIRS = [
  { id: "ca", left: "CA", right: "Zertifizierungsstelle - stellt Zertifikate aus und signiert sie" },
  { id: "ra", left: "RA", right: "Registrierungsstelle - prüft die Identität vor der Ausstellung" },
  { id: "va", left: "VA", right: "Validierungsdienst - beantwortet Anfragen zum Zertifikatsstatus" },
  { id: "crl", left: "CRL", right: "Liste vorzeitig widerrufener Zertifikate zum Download" },
  { id: "ocsp", left: "OCSP", right: "Echtzeit-Abfrage, ob ein einzelnes Zertifikat noch gültig ist" },
  { id: "scep", left: "SCEP", right: "Protokoll für automatisierte Zertifikatsanfragen von Geräten" },
  { id: "ndes", left: "NDES", right: "Windows-Serverrolle, die SCEP-Anfragen an die CA weiterleitet" },
];

const QUIZ = [
  {
    difficulty: "easy",
    question: "Welches Grundproblem löst eine PKI (Public Key Infrastructure)?",
    options: [
      "Sie bestätigt vertrauenswürdig, dass ein bestimmter öffentlicher Schlüssel wirklich zu der Identität gehört, die er behauptet - eine Zertifizierungsstelle (CA) bürgt für diese Bindung",
      "Sie ersetzt Verschlüsselung komplett durch schnellere Hash-Verfahren",
      "Sie verhindert, dass Daten überhaupt verschlüsselt werden müssen",
    ],
    correctIndex: 0,
    explanation:
      "Ein Schlüsselpaar allein sagt nichts darüber aus, WEM der öffentliche Schlüssel gehört - genau diese Bindung zwischen Identität und Schlüssel bestätigt eine vertrauenswürdige Zertifizierungsstelle (CA) mit ihrer Signatur.",
  },
  {
    difficulty: "easy",
    question: "Was passiert typischerweise, wenn ein Zertifikat sein Ablaufdatum überschreitet?",
    options: [
      "Verbindungen/Authentifizierungen, die dieses Zertifikat nutzen, schlagen fehl bzw. Browser/Clients zeigen eine Vertrauenswarnung - eine rechtzeitige Erneuerung ist nötig",
      "Das Zertifikat funktioniert unverändert weiter, das Datum ist rein informativ",
      "Der zugehörige private Schlüssel wird automatisch gelöscht",
    ],
    correctIndex: 0,
    explanation:
      "Abgelaufene Zertifikate werden von Clients als ungültig behandelt - klassische Folgen sind Browser-Warnungen, fehlschlagende WLAN-/VPN-Authentifizierung oder abbrechende TLS-Verbindungen, bis ein neues Zertifikat ausgestellt wird.",
  },
  {
    difficulty: "easy",
    question: "Was ist eine Root-CA?",
    options: [
      "Die oberste Zertifizierungsstelle einer Vertrauenskette - ihr Zertifikat ist selbstsigniert und muss vorab (z.B. im Betriebssystem/Browser) als vertrauenswürdig hinterlegt sein",
      "Ein Zertifikat, das nur für die Root-Partition einer Festplatte gilt",
      "Ein Zertifikat, das automatisch nach 24 Stunden abläuft",
    ],
    correctIndex: 0,
    explanation:
      "Die Root-CA steht an der Spitze der Vertrauenskette. Da niemand über ihr steht, signiert sie ihr eigenes Zertifikat selbst - Vertrauen entsteht dadurch, dass Betriebssysteme/Browser eine Liste bekannter, vertrauenswürdiger Root-CAs mitbringen.",
  },
  {
    difficulty: "medium",
    question:
      "Warum kommen bei vielen Zertifikaten Intermediate-CAs zwischen Root-CA und dem eigentlichen Endzertifikat zum Einsatz?",
    options: [
      "Der besonders sensible private Schlüssel der Root-CA soll so selten wie möglich benutzt werden (idealerweise offline gelagert) - Intermediate-CAs übernehmen das tägliche Ausstellen und können bei einem Vorfall isoliert widerrufen werden, ohne die Root-CA zu kompromittieren",
      "Intermediate-CAs sind nur ein Marketing-Begriff ohne technischen Unterschied zur Root-CA",
      "Sie beschleunigen ausschliesslich die Ladezeit von Webseiten",
    ],
    correctIndex: 0,
    explanation:
      "Würde die Root-CA jedes einzelne Endzertifikat direkt signieren, müsste ihr Schlüssel ständig online/aktiv sein - ein ideales Angriffsziel. Intermediate-CAs übernehmen das Tagesgeschäft, sodass die Root-CA meist offline bleiben kann.",
  },
  {
    difficulty: "medium",
    question: "Ein Zertifikat wird vorzeitig widerrufen (z.B. weil der private Schlüssel gestohlen wurde). Worüber erfahren Clients das?",
    options: [
      "Über eine Zertifikatssperrliste (CRL) oder einen Online-Statusabruf (OCSP), die/den der Client bei der Prüfung konsultiert",
      "Automatisch, sobald das Ablaufdatum erreicht ist - vorzeitiger Widerruf ist technisch nicht möglich",
      "Nur per manueller E-Mail-Benachrichtigung an alle betroffenen Nutzer",
    ],
    correctIndex: 0,
    explanation:
      "CRL (eine herunterladbare Sperrliste) und OCSP (eine Echtzeit-Statusabfrage für ein einzelnes Zertifikat) sind die beiden Standardmechanismen, mit denen ein Client prüfen kann, ob ein an sich noch gültiges (nicht abgelaufenes) Zertifikat vorzeitig widerrufen wurde.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet SCEP grundlegend von einer manuellen Zertifikatsanfrage durch einen Administrator?",
    options: [
      "SCEP erlaubt Geräten, automatisiert und ohne manuelles Eingreifen ein Zertifikat bei einer CA anzufordern - entscheidend für die Verwaltung grosser Geräteflotten (z.B. über Intune)",
      "SCEP funktioniert nur für Zertifikate, die niemals ablaufen",
      "SCEP ersetzt die Zertifizierungsstelle vollständig, es wird gar keine CA mehr benötigt",
    ],
    correctIndex: 0,
    explanation:
      "Ohne SCEP müsste ein Admin für jedes einzelne Gerät manuell ein Zertifikat anfordern und installieren - bei hunderten oder tausenden verwalteten Geräten (z.B. via Intune) ist automatisierte Ausstellung per SCEP der einzige praktikable Weg.",
  },
  {
    difficulty: "hard",
    question:
      "In einer Intune-SCEP-Umgebung übernimmt der NDES-Server (Network Device Enrollment Service) eine zentrale Rolle. Was macht er?",
    options: [
      "Er nimmt die SCEP-Anfragen der Geräte entgegen (meist vermittelt über den Intune-NDES-Connector) und leitet sie an die interne Zertifizierungsstelle weiter, die das eigentliche Zertifikat ausstellt",
      "Er ersetzt Intune komplett und übernimmt die gesamte Geräteverwaltung",
      "Er speichert alle privaten Schlüssel aller verwalteten Geräte zentral auf einem einzigen Server",
    ],
    correctIndex: 0,
    explanation:
      "NDES ist die Brücke zwischen der Cloud (Intune) und der On-Premises-Zertifizierungsstelle (Active Directory Certificate Services): er nimmt SCEP-Anfragen entgegen und reicht sie an die CA zur eigentlichen Ausstellung weiter.",
  },
  {
    difficulty: "hard",
    question:
      "Warum wird bei einer SCEP-Verteilung über Intune fast immer zusätzlich ein \"Trusted Root Certificate\"-Profil an dieselben Geräte verteilt?",
    options: [
      "Das Gerät muss dem Root-CA-Zertifikat der ausstellenden internen CA vertrauen, bevor es dem per SCEP erhaltenen Zertifikat selbst vertrauen kann - ohne das Root-Profil bleibt das neue Zertifikat für viele Zwecke (z.B. WLAN-Authentifizierung) nutzlos",
      "Das Root-Zertifikat ist rein optional und dient nur der Dokumentation",
      "Trusted-Root-Profile werden nur für Zertifikate von öffentlichen (nicht internen) CAs benötigt",
    ],
    correctIndex: 0,
    explanation:
      "Ein Gerät, das die interne CA noch nicht kennt, kann das per SCEP erhaltene Zertifikat nicht sinnvoll validieren - das separate Trusted-Root-Profil sorgt dafür, dass die gesamte Vertrauenskette bis zur Root-CA auf dem Gerät bekannt ist.",
  },
  {
    difficulty: "hard",
    question:
      "Warum ist zertifikatsbasierte Authentifizierung (z.B. für WLAN/VPN via SCEP-Zertifikat) sicherheitstechnisch oft einer reinen Passwort-Authentifizierung vorzuziehen?",
    options: [
      "Ein Zertifikat mit privatem Schlüssel lässt sich nicht wie ein Passwort erraten, phishen oder abhören, ist an das jeweilige Gerät gebunden und lässt sich bei Bedarf gezielt für nur dieses eine Gerät widerrufen",
      "Zertifikate sind grundsätzlich unsichtbar für Angreifer und können deshalb nie kompromittiert werden",
      "Zertifikatsbasierte Authentifizierung benötigt keinerlei zentrale Verwaltung mehr",
    ],
    correctIndex: 0,
    explanation:
      "Passwörter können erraten, wiederverwendet oder gephisht werden. Ein gerätegebundenes Zertifikat mit privatem Schlüssel bietet dagegen einen kryptografischen Nachweis, der sich nicht einfach abtippen oder erraten lässt - und lässt sich pro Gerät gezielt widerrufen.",
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
      item.innerHTML = `<input type="radio" name="pkiq${qIdx}" /> <span>${opt}</span>`;
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

    const expBox = document.querySelector(`[data-explanation="${qIdx}"]`);
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

document.addEventListener("DOMContentLoaded", () => {
  markModuleStarted(MODULE_ID);
  if (getModuleStatus(MODULE_ID) === "done") {
    document.getElementById("completion-banner").classList.remove("hidden");
  }

  initMatchPuzzle(document.getElementById("term-match-container"), TERM_PAIRS, (matched, total) => {
    document.getElementById("term-match-progress").textContent = `${matched} / ${total} Paare gefunden`;
  });

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
