/*
 * email-security.js - Modul 10: E-Mail-Sicherheit (SPF/DKIM/DMARC)
 * Konzept-Erklaerung + ein schwierigkeitsgestuftes Quiz zu DNS-Record-
 * Interpretation und Spoofing-/Zustellungs-Szenarien. Alle Records und
 * Szenarien sind erfundene Beispiele, keine echten Abfragen.
 */

const MODULE_ID = "emailsecurity";

const QUIZ = [
  {
    difficulty: "easy",
    question:
      "Ein SPF-Eintrag lautet: v=spf1 include:_spf.google.com ~all. Was bedeutet der Qualifier \"~all\" am Ende?",
    options: [
      "SoftFail: nicht gelistete Server werden als verdaechtig markiert, die Mail wird aber meist trotzdem zugestellt (oft mit Spam-Kennzeichnung)",
      "HardFail: nicht gelistete Server werden strikt abgelehnt",
      "Alle Server sind automatisch erlaubt, unabhaengig von der Liste",
    ],
    correctIndex: 0,
    explanation:
      "\"~all\" (SoftFail) ist eine mildere Einstellung als \"-all\" (HardFail, strikte Ablehnung) und \"+all\" (alles erlauben, sehr unsicher). Viele Domains starten testweise mit \"~all\", bevor sie auf \"-all\" umstellen.",
  },
  {
    difficulty: "easy",
    question: "Was pruefen SPF, DKIM und DMARC im Kern gemeinsam?",
    options: [
      "Ob eine E-Mail tatsaechlich von einem autorisierten Server der angegebenen Absenderdomain stammt und unterwegs nicht veraendert wurde",
      "Ob der Empfaenger die Mail gelesen hat",
      "Ob der E-Mail-Anhang virenfrei ist",
    ],
    correctIndex: 0,
    explanation:
      "Alle drei Mechanismen drehen sich um Absender-Authentizitaet: SPF prueft die sendende IP, DKIM prueft eine kryptografische Signatur, DMARC verknuepft beides mit einer Richtlinie, was bei Fehlschlag passieren soll.",
  },
  {
    difficulty: "medium",
    question:
      "Wo wird der oeffentliche Schluessel fuer die DKIM-Pruefung veroeffentlicht?",
    options: [
      "Als TXT-Record unter selector._domainkey.domain.tld",
      "Im Header jeder einzelnen E-Mail",
      "Auf der Webseite der Firma unter /dkim-key",
    ],
    correctIndex: 0,
    explanation:
      "Der DKIM-Selector (ein beliebiger Name, z.B. \"mail\") plus \"._domainkey.\" plus die Domain ergeben den DNS-Namen, unter dem der oeffentliche Schluessel als TXT-Record liegt - der empfangende Server holt ihn sich dort, um die Signatur zu pruefen.",
  },
  {
    difficulty: "medium",
    question:
      "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@firma.ch - was passiert mit Mails, die die DMARC-Pruefung nicht bestehen?",
    options: [
      "Sie werden in Quarantaene verschoben (typischerweise der Spam-Ordner), und ein Bericht geht an die angegebene Adresse",
      "Sie werden automatisch geloescht, ohne Benachrichtigung",
      "Sie werden trotzdem normal zugestellt, nur langsamer",
    ],
    correctIndex: 0,
    explanation:
      "\"p=quarantine\" ist eine von drei DMARC-Richtlinien (p=none nur beobachten, p=quarantine in Verdacht/Spam verschieben, p=reject komplett ablehnen). \"rua\" gibt die Adresse fuer aggregierte aggregierte Berichte an.",
  },
  {
    difficulty: "medium",
    question: "Warum sollte eine Domain nur EINEN einzigen SPF-TXT-Record haben?",
    options: [
      "Weil bei mehreren SPF-Eintraegen das Pruefergebnis laut Standard undefiniert ist - mehrere Versanddienste muessen ueber \"include:\" in einem einzigen Eintrag kombiniert werden",
      "Weil DNS technisch nur einen TXT-Record pro Domain erlaubt",
      "Weil zwei SPF-Eintraege automatisch beide Server-Listen kombiniert erlauben",
    ],
    correctIndex: 0,
    explanation:
      "Mehrere SPF-Records fuer dieselbe Domain fuehren zu einem undefinierten/fehlerhaften Ergebnis. Nutzt eine Firma mehrere Versanddienste (z.B. Google Workspace + ein Newsletter-Tool), muessen diese ueber mehrere \"include:\"-Mechanismen in EINEM Eintrag zusammengefasst werden.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Angreifer faelscht die Absenderadresse info@firma.ch und versendet Phishing-Mails ueber einen eigenen Server. SPF fuer firma.ch ist korrekt auf die echten Mailserver gesetzt (-all). DKIM ist nicht konfiguriert. DMARC steht auf p=reject mit strikter SPF-Alignment. Wird die Phishing-Mail zugestellt?",
    options: [
      "Nein - SPF schlaegt fehl (der fremde Server ist nicht autorisiert), und DMARC mit p=reject lehnt die Mail deshalb ab, unabhaengig vom fehlenden DKIM",
      "Ja, weil DKIM nicht konfiguriert ist, greift DMARC gar nicht",
      "Ja, SPF wird nur bei ausgehenden, nicht bei eingehenden Mails geprueft",
    ],
    correctIndex: 0,
    explanation:
      "SPF prueft, ob die sendende Server-IP fuer die Absenderdomain autorisiert ist - der Angreifer-Server ist es nicht, SPF schlaegt also fehl. Da DMARC auf p=reject mit strikter SPF-Alignment steht und mindestens ein Mechanismus (hier keiner) bestehen muss, wird die Mail abgelehnt.",
  },
  {
    difficulty: "hard",
    question:
      "Ein legitimer Newsletter-Dienst versendet im Auftrag von firma.ch, ist aber NICHT in der SPF-Liste von firma.ch eingetragen. Er signiert die Mails aber korrekt per DKIM mit einem Schluessel von firma.ch. DMARC von firma.ch verlangt (Standardverhalten): mindestens SPF ODER DKIM muss im Alignment bestehen. Kommt die Mail durch?",
    options: [
      "Ja - DKIM besteht und ist ausreichend, DMARC verlangt normalerweise nur einen der beiden Mechanismen erfolgreich",
      "Nein, es muessen immer BEIDE Mechanismen (SPF und DKIM) gleichzeitig bestehen",
      "Nein, ohne SPF-Eintrag wird die Mail immer automatisch geblockt",
    ],
    correctIndex: 0,
    explanation:
      "DMARC verlangt im Standardfall, dass MINDESTENS EINER der beiden Mechanismen (SPF oder DKIM) besteht UND mit der sichtbaren Absenderdomain uebereinstimmt (Alignment). Da DKIM hier korrekt validiert, reicht das aus - selbst wenn SPF fehlschlaegt.",
  },
  {
    difficulty: "hard",
    question:
      "Eine Firma aktiviert DMARC direkt mit p=reject, bevor alle legitimen Versandquellen (z.B. ein altes ERP-System, das Rechnungen per Mail verschickt) korrekt per SPF/DKIM eingebunden sind. Was ist die wahrscheinliche Folge?",
    options: [
      "Auch die eigenen legitimen Mails aus dem ERP-System werden abgelehnt/nicht zugestellt, weil sie DMARC nicht bestehen",
      "Das ERP-System wird automatisch von DMARC ausgenommen",
      "Es passiert nichts, DMARC gilt nur fuer Mails von aussen an die Firma",
    ],
    correctIndex: 0,
    explanation:
      "DMARC unterscheidet nicht zwischen 'boesartig' und 'einfach falsch konfiguriert' - jede Mail, die SPF/DKIM-Alignment nicht besteht, wird gemaess Richtlinie behandelt. Deshalb empfiehlt sich ein schrittweises Vorgehen: erst p=none (nur Berichte sammeln, nichts blocken), dann p=quarantine, erst zuletzt p=reject, sobald alle legitimen Quellen sauber eingebunden sind.",
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
    q.options.forEach((opt, oIdx) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.innerHTML = `<input type="radio" name="mq${qIdx}" /> <span>${opt}</span>`;
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
    items.forEach((item, oIdx) => {
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

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
