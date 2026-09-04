/*
 * encryption.js - Modul: Verschlüsselung
 * Symmetrisch/asymmetrisch/hybrid, Diffie-Hellman, Hashing & Salt.
 * Enthält zwei Live-Demos über die native Web-Crypto-API (crypto.subtle) -
 * es wird also ECHTES SHA-256 berechnet, keine Simulation. Es werden dabei
 * keinerlei Eingaben irgendwohin übertragen, alles bleibt im Browser.
 */

const MODULE_ID = "encryption";

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSaltHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function setupHashDemo() {
  const input = document.getElementById("hash-input");
  const output = document.getElementById("hash-output");
  if (!input) return;

  const update = async () => {
    const text = input.value;
    if (!text) {
      output.textContent = "-";
      return;
    }
    output.textContent = await sha256Hex(text);
  };
  input.addEventListener("input", update);
  update();
}

function setupSaltDemo() {
  const input = document.getElementById("salt-input");
  const saltOutput = document.getElementById("salt-value");
  const plainHashOutput = document.getElementById("salt-plain-hash");
  const saltedHashOutput = document.getElementById("salt-salted-hash");
  const regenBtn = document.getElementById("regen-salt-btn");
  if (!input) return;

  let currentSalt = randomSaltHex(8);
  saltOutput.textContent = currentSalt;

  const update = async () => {
    const text = input.value;
    if (!text) {
      plainHashOutput.textContent = "-";
      saltedHashOutput.textContent = "-";
      return;
    }
    plainHashOutput.textContent = await sha256Hex(text);
    saltedHashOutput.textContent = await sha256Hex(text + currentSalt);
  };

  regenBtn.addEventListener("click", () => {
    currentSalt = randomSaltHex(8);
    saltOutput.textContent = currentSalt;
    update();
  });
  input.addEventListener("input", update);
  update();
}

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist der Hauptunterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?",
    options: [
      "Symmetrisch nutzt genau EINEN gemeinsamen Schlüssel zum Ver- und Entschlüsseln, asymmetrisch nutzt ein Schlüsselpaar (öffentlich/privat)",
      "Symmetrische Verschlüsselung ist grundsätzlich unsicherer und wird deshalb nirgends mehr eingesetzt",
      "Asymmetrische Verschlüsselung kommt komplett ohne jeden Schlüssel aus",
    ],
    correctIndex: 0,
    explanation:
      "Symmetrisch (z.B. AES) = ein gemeinsames Geheimnis, das beide Seiten vorher kennen müssen. Asymmetrisch (z.B. RSA) = ein mathematisch verknüpftes Schlüsselpaar, bei dem der öffentliche Schlüssel frei verteilt werden kann und trotzdem niemand ohne den privaten Schlüssel entschlüsseln kann.",
  },
  {
    difficulty: "easy",
    question: "Warum wird beim Speichern von Passwörtern zusätzlich zum Hashing ein Salt verwendet?",
    options: [
      "Damit zwei Nutzer mit demselben Passwort unterschiedliche Hash-Werte erhalten und vorab berechnete Rainbow-Tables wirkungslos werden",
      "Salt macht den Hash umkehrbar, sodass das Passwort im Notfall wiederhergestellt werden kann",
      "Salt wird nur bei symmetrischer Verschlüsselung benötigt, bei Hashes ist es überflüssig",
    ],
    correctIndex: 0,
    explanation:
      "Ohne Salt erzeugt dasselbe Passwort immer denselben Hash - ein Angreifer mit einer vorab berechneten Tabelle (Rainbow-Table) häufiger Passwörter könnte den Hash sofort nachschlagen. Ein individueller, zufälliger Salt pro Nutzer macht diese Tabellen nutzlos, da jeder Hash einzigartig wird.",
  },
  {
    difficulty: "easy",
    question: "Was bedeutet der \"Avalanche-Effekt\" bei guten Hashfunktionen wie SHA-256?",
    options: [
      "Schon eine winzige Änderung der Eingabe (z.B. ein einziges Zeichen) führt zu einem komplett anderen, nicht vorhersehbaren Hash-Wert",
      "Der berechnete Hash wird mit jeder weiteren Eingabe automatisch länger",
      "Ähnliche Eingaben erzeugen bewusst ähnliche Hash-Werte, damit man sie wiedererkennt",
    ],
    correctIndex: 0,
    explanation:
      "Der Avalanche-Effekt ist eine zentrale Eigenschaft kryptografischer Hashfunktionen: selbst ein einziges verändertes Bit in der Eingabe verändert im Schnitt die Hälfte aller Bits im Ausgabe-Hash. Das verhindert, dass man aus Ähnlichkeiten im Hash auf Ähnlichkeiten in der Eingabe schliessen kann.",
  },
  {
    difficulty: "medium",
    question: "Warum nutzt HTTPS (TLS) eine hybride Verschlüsselung, statt durchgehend asymmetrisch zu verschlüsseln?",
    options: [
      "Asymmetrische Verschlüsselung ist rechenintensiv/langsam - sie wird deshalb nur einmalig genutzt, um einen symmetrischen Sitzungsschlüssel sicher auszutauschen; die eigentlichen Daten werden danach schnell symmetrisch verschlüsselt",
      "Weil symmetrische Verschlüsselung eigentlich unsicher ist und nur zur Tarnung mitverwendet wird",
      "Weil asymmetrische Verschlüsselung technisch gar keine echten Nutzdaten verarbeiten kann, sondern nur einzelne Zeichen",
    ],
    correctIndex: 0,
    explanation:
      "Asymmetrische Kryptografie ist um Grössenordnungen langsamer als symmetrische. TLS nutzt sie deshalb nur für den \"teuren\" Teil - den sicheren Austausch eines Sitzungsschlüssels - und wechselt danach zu schneller symmetrischer Verschlüsselung (z.B. AES) für den eigentlichen Datenstrom.",
  },
  {
    difficulty: "medium",
    question:
      "Beim Diffie-Hellman-Schlüsselaustausch tauschen Alice und Bob öffentlich Werte aus, die aus je einer GEHEIMEN Zahl berechnet wurden. Warum kann ein Lauscher daraus trotzdem nicht den gemeinsamen Schlüssel berechnen?",
    options: [
      "Weil sich aus der öffentlich sichtbaren, potenzierten Zahl die ursprüngliche geheime Zahl (diskreter Logarithmus) bei ausreichend grossen Zahlen praktisch nicht in nützlicher Zeit zurückrechnen lässt",
      "Weil bei Diffie-Hellman zusätzlich noch alles per AES verschlüsselt über die Leitung geht",
      "Weil Diffie-Hellman die ausgetauschten Werte gar nicht wirklich öffentlich, sondern versteckt überträgt",
    ],
    correctIndex: 0,
    explanation:
      "Die Sicherheit von Diffie-Hellman beruht auf dem diskreten Logarithmus-Problem: aus g, p und g^a mod p auf a zurückzuschliessen ist bei grossen Zahlen praktisch nicht machbar - obwohl g, p, g^a mod p und g^b mod p alle öffentlich mitgelesen werden können.",
  },
  {
    difficulty: "medium",
    question:
      "Für eine heruntergeladene Datei wird ein SHA-256-Hash zur Integritätsprüfung veröffentlicht - ganz ohne Salt. Für Passwörter wäre das ungeeignet. Warum reicht ein einfacher Hash hier trotzdem aus?",
    options: [
      "Bei der Integritätsprüfung geht es nur darum, unbeabsichtigte Veränderungen zu erkennen (jeder darf denselben Hash nachrechnen können) - bei Passwörtern soll dagegen verhindert werden, dass jemand aus gestohlenen Hashes das ursprüngliche Passwort errät, wofür Salt nötig ist",
      "Für Dateien wird ohnehin eine andere, absichtlich schwächere Hash-Funktion verwendet",
      "Ein Hash ohne Salt ist grundsätzlich genauso sicher wie einer mit Salt, Salt ist reine Geschmackssache",
    ],
    correctIndex: 0,
    explanation:
      "Der Zweck entscheidet: Integritätsprüfung will Änderungen sichtbar machen (öffentlicher, reproduzierbarer Vergleichswert). Passwort-Hashing will dagegen verhindern, dass ein Angreifer mit gestohlenen Hashes im grossen Stil Passwörter erraten kann - dafür braucht es Salt (gegen Rainbow-Tables) und absichtlich langsame Verfahren (gegen Brute-Force).",
  },
  {
    difficulty: "hard",
    question:
      "Vereinfachtes RSA-Beispiel: n=33, e=7 (öffentlicher Schlüssel), d=3 (privater Schlüssel, geheim). Ein Angreifer fängt den Geheimtext c=29 ab und kennt n, e und c. Kann er ohne Kenntnis von d die Nachricht entschlüsseln?",
    options: [
      "Nein direkt nicht - dafür müsste er d aus n und e ableiten. Bei diesen winzigen Demo-Zahlen ginge das noch über die Primfaktorzerlegung von n=33=3×11, bei echten RSA-Schlüsseln mit hunderten Stellen ist genau das aber praktisch unmöglich",
      "Ja, aus c und e allein lässt sich die Nachricht immer sofort direkt berechnen",
      "Nein, weil c als Geheimtext ohnehin niemals öffentlich einsehbar sein darf",
    ],
    correctIndex: 0,
    explanation:
      "RSA-Sicherheit beruht darauf, dass die Primfaktorzerlegung von n (hier winzig und daher unrealistisch leicht: 33 = 3 × 11) bei echten Schlüsseln mit sehr grossen Zahlen praktisch nicht in nützlicher Zeit möglich ist. Nur wer die Primfaktoren (und damit d) kennt, kann entschlüsseln.",
  },
  {
    difficulty: "hard",
    question:
      "Digitale Signaturen (z.B. bei DKIM) funktionieren \"umgekehrt\" zur normalen asymmetrischen Verschlüsselung. Was wird womit gemacht?",
    options: [
      "Der Absender signiert (verschlüsselt einen Hash der Nachricht) mit seinem PRIVATEN Schlüssel - jeder kann die Signatur mit dem öffentlich bekannten Schlüssel prüfen. Bei normaler Verschlüsselung ist es umgekehrt: mit dem PUBLIC Key des Empfängers verschlüsseln, nur dessen privater Schlüssel entschlüsselt",
      "Signaturen laufen exakt gleich wie Verschlüsselung ab, nur mit symmetrischen statt asymmetrischen Schlüsseln",
      "Signaturen werden mit dem öffentlichen Schlüssel erstellt und anschliessend mit dem privaten Schlüssel geprüft",
    ],
    correctIndex: 0,
    explanation:
      "Verschlüsselung: mit dem PUBLIC Key des Empfängers verschlüsseln → nur sein PRIVATE Key entschlüsselt (Vertraulichkeit). Signatur: mit dem eigenen PRIVATE Key signieren → jeder mit dem zugehörigen PUBLIC Key prüfen (Authentizität/Nachweis, dass wirklich der Besitzer des privaten Schlüssels signiert hat) - siehe auch das Modul E-Mail-Sicherheit zu DKIM.",
  },
  {
    difficulty: "hard",
    question:
      "Warum speichert ein gut konfiguriertes System Passwörter niemals als reinen SHA-256-Hash (auch nicht gesalzen), sondern nutzt speziell dafür gebaute Verfahren wie bcrypt oder Argon2 - obwohl SHA-256 selbst kryptografisch als sicher gilt?",
    options: [
      "SHA-256 ist extrem schnell berechenbar - bei einem Datenleck können Angreifer damit Milliarden Passwörter pro Sekunde durchprobieren (Brute-Force). bcrypt/Argon2 sind absichtlich langsam und rechenintensiv gestaltet, um genau das gezielt auszubremsen",
      "SHA-256 ist mathematisch unsicher und lässt sich mit einfachen Mitteln direkt umkehren",
      "SHA-256 kann rein technisch keine Passwörter verarbeiten, sondern nur ganze Dateien",
    ],
    correctIndex: 0,
    explanation:
      "SHA-256 wurde für Geschwindigkeit optimiert (z.B. für Integritätsprüfungen) - genau das ist bei Passwort-Hashing ein Nachteil, da es Brute-Force-Angriffe beschleunigt. bcrypt und Argon2 sind bewusst langsam und speicherintensiv (\"Key Stretching\"), um Angreifer auszubremsen, und bringen Salting bereits eingebaut mit.",
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
      item.innerHTML = `<input type="radio" name="eq${qIdx}" /> <span>${opt}</span>`;
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

  setupHashDemo();
  setupSaltDemo();
  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
