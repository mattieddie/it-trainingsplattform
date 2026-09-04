/*
 * containers.js - Modul: Virtualisierung & Docker-Grundlagen
 * Typ-1- vs. Typ-2-Hypervisor, virtuelle Maschinen vs. Container, sowie
 * Docker-Kernbegriffe (Image/Container/Dockerfile/Registry).
 */

const MODULE_ID = "containers";

const WORKFLOW_STEPS = [
  { id: "1", label: "Dockerfile schreiben - Bauanleitung für das Image" },
  { id: "2", label: "Image bauen (docker build) - unveränderliches Dateisystem-Template entsteht" },
  { id: "3", label: "Image in eine Registry veröffentlichen (z.B. Docker Hub)" },
  { id: "4", label: "Container aus dem Image starten (docker run) - laufende Instanz" },
];

const QUIZ = [
  {
    difficulty: "easy",
    question: "Was ist der zentrale Unterschied zwischen einer virtuellen Maschine und einem Container?",
    options: [
      "Jede VM bringt ihr eigenes vollständiges Gast-Betriebssystem mit, während sich alle Container auf einem Host den Kernel des Host-Betriebssystems teilen",
      "Container sind technisch identisch mit VMs, nur der Name ist anders",
      "VMs können nur unter Linux laufen, Container ausschliesslich unter Windows",
    ],
    correctIndex: 0,
    explanation:
      "Eine VM virtualisiert komplette Hardware inkl. eigenem Kernel/Betriebssystem. Ein Container ist dagegen im Kern ein isolierter Prozess, der sich den Kernel des Hosts mit anderen Containern teilt - dadurch deutlich leichtgewichtiger.",
  },
  {
    difficulty: "easy",
    question: "Warum starten Container in der Regel viel schneller als virtuelle Maschinen?",
    options: [
      "Ein Container muss kein eigenes Betriebssystem hochfahren - er startet als isolierter Prozess auf dem bereits laufenden Host-Kernel",
      "Container verwenden grundsätzlich schnellere Festplatten als VMs",
      "Container werden immer bereits vorgestartet im Arbeitsspeicher ausgeliefert",
    ],
    correctIndex: 0,
    explanation:
      "Der zeitaufwändigste Teil eines VM-Starts ist das Hochfahren des kompletten Gast-Betriebssystems. Ein Container überspringt das komplett, da er den bereits laufenden Host-Kernel mitbenutzt.",
  },
  {
    difficulty: "easy",
    question: "Was ist ein Docker-Image?",
    options: [
      "Ein unveränderliches Vorlagen-Dateisystem mit allem, was eine Anwendung zum Laufen braucht - aus einem Image können mehrere Container gestartet werden",
      "Ein Screenshot des laufenden Containers zu Dokumentationszwecken",
      "Eine komplette virtuelle Maschine mit eigenem Betriebssystem",
    ],
    correctIndex: 0,
    explanation:
      "Ein Image ist der \"Bauplan\": unveränderlich, geschichtet aufgebaut, enthält Code, Laufzeitumgebung und Abhängigkeiten. Ein Container ist die tatsächlich LAUFENDE Instanz davon - mehrere Container können vom selben Image gestartet werden.",
  },
  {
    difficulty: "medium",
    question: "Was unterscheidet Typ-1- von Typ-2-Hypervisoren?",
    options: [
      "Typ 1 läuft direkt auf der Hardware ohne Host-Betriebssystem dazwischen (z.B. VMware ESXi, Hyper-V Server), Typ 2 läuft als normale Anwendung innerhalb eines bestehenden Host-Betriebssystems (z.B. VirtualBox, VMware Workstation)",
      "Typ 1 ist ausschliesslich für Windows-Gäste, Typ 2 ausschliesslich für Linux-Gäste reserviert",
      "Typ 2 ist grundsätzlich schneller als Typ 1, da er näher an der Hardware arbeitet",
    ],
    correctIndex: 0,
    explanation:
      "Typ 1 (Native/Bare-Metal-Hypervisor) sitzt direkt zwischen Hardware und Gast-Betriebssystemen. Typ 2 (Hosted Hypervisor) läuft als ganz normale Anwendung INNERHALB eines bereits laufenden Host-Betriebssystems.",
  },
  {
    difficulty: "medium",
    question:
      "Warum wird ein Typ-1-Hypervisor für produktive Server im Rechenzentrum bevorzugt, ein Typ-2-Hypervisor eher für den Entwickler-Laptop?",
    options: [
      "Typ 1 hat kein zusätzliches Host-Betriebssystem als Overhead/Angriffsfläche und bietet dadurch bessere Performance und Sicherheit - Typ 2 ist dafür einfacher auf einem bereits laufenden Alltags-Betriebssystem einzurichten",
      "Typ 2 kann grundsätzlich keine Netzwerkverbindungen simulieren",
      "Typ 1 lässt sich technisch nur über eine serielle Konsole bedienen",
    ],
    correctIndex: 0,
    explanation:
      "Ohne zusätzliches Host-Betriebssystem hat Typ 1 weniger Overhead und eine kleinere Angriffsfläche - ideal für Produktionsserver. Typ 2 punktet dagegen mit einfacher Einrichtung auf einem bereits genutzten Alltagsrechner.",
  },
  {
    difficulty: "medium",
    question:
      "Ein Linux-Container soll auf einem Windows-11-Rechner laufen. Warum ist dafür im Hintergrund trotzdem ein Linux-Kernel nötig (z.B. via WSL2)?",
    options: [
      "Ein Container teilt sich den Kernel des Hosts - ein Linux-Container braucht deshalb einen laufenden Linux-Kernel, den Windows selbst nicht mitbringt, weshalb im Hintergrund eine leichte Linux-Umgebung bereitgestellt wird",
      "Windows kann Linux-Programme nativ ganz ohne jeden zusätzlichen Kernel ausführen",
      "WSL2 wird ausschliesslich für die grafische Oberfläche von Containern benötigt",
    ],
    correctIndex: 0,
    explanation:
      "Da Container den Host-Kernel mitbenutzen (statt einen eigenen mitzubringen), braucht ein Linux-Container zwingend einen Linux-Kernel - unter Windows wird dafür im Hintergrund eine leichtgewichtige Linux-Umgebung (WSL2) bereitgestellt.",
  },
  {
    difficulty: "hard",
    question:
      "Ein Unternehmen möchte eine alte Anwendung betreiben, die zwingend eine veraltete Windows-Server-Version benötigt, während der übrige Rechenzentrumsbetrieb auf aktuellem Linux läuft. VM oder Container - was ist naheliegender, und warum?",
    options: [
      "Eine VM, da sie ein komplett eigenes Gast-Betriebssystem mitbringt und damit unabhängig vom Host-Betriebssystem lauffähig ist - ein Container würde zwingend einen kompatiblen Host-Kernel benötigen",
      "Ein Container, da Container grundsätzlich jedes beliebige Betriebssystem emulieren können",
      "Keines von beiden - veraltete Betriebssysteme lassen sich generell nicht virtualisiert betreiben",
    ],
    correctIndex: 0,
    explanation:
      "Genau hier liegt die Stärke von VMs: sie bringen ein komplett eigenes Gast-Betriebssystem mit und sind dadurch unabhängig vom Host-Kernel - ein Windows-Container auf einem reinen Linux-Host würde dagegen nicht funktionieren.",
  },
  {
    difficulty: "hard",
    question:
      "Warum gilt die Isolation zwischen Containern auf demselben Host tendenziell als schwächer als die Isolation zwischen VMs auf demselben Hypervisor?",
    options: [
      "Container teilen sich denselben Host-Kernel - eine Schwachstelle im Kernel oder in der Container-Engine kann theoretisch mehrere Container gleichzeitig betreffen, während VMs durch den Hypervisor auf Hardware-Ebene stärker voneinander abgeschottet sind",
      "Container verschlüsseln ihre Daten grundsätzlich nicht, VMs dagegen schon",
      "Es gibt keinen technischen Unterschied, beide bieten identisch starke Isolation",
    ],
    correctIndex: 0,
    explanation:
      "Der geteilte Kernel ist der entscheidende Unterschied: eine Kernel-Schwachstelle kann potenziell alle Container auf demselben Host betreffen (\"Container-Escape\"), während VMs durch die Hardware-Virtualisierung des Hypervisors deutlich strikter getrennt sind.",
  },
  {
    difficulty: "hard",
    question:
      "Eine Microservices-Architektur mit vielen kleinen, unabhängig skalierenden Anwendungsteilen soll effizient betrieben werden. Warum passen Container hier meist besser als klassische VMs?",
    options: [
      "Container sind leichtgewichtig genug, um viele Instanzen parallel zu betreiben und blitzschnell hoch-/herunterzuskalieren, ohne für jede Instanz ein komplettes Gast-Betriebssystem starten zu müssen",
      "Microservices lassen sich technisch nur in Containern implementieren, niemals in VMs",
      "VMs unterstützen grundsätzlich keine Netzwerkkommunikation zwischen mehreren Instanzen",
    ],
    correctIndex: 0,
    explanation:
      "Bei vielen kleinen, sich häufig skalierenden Diensten macht sich der VM-Overhead (eigenes OS pro Instanz) besonders stark bemerkbar - Container starten in Sekunden statt Minuten und benötigen einen Bruchteil des Speichers.",
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
      item.innerHTML = `<input type="radio" name="cnq${qIdx}" /> <span>${opt}</span>`;
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

  const workflowPuzzle = initReorderPuzzle(document.getElementById("workflow-reorder-container"), WORKFLOW_STEPS);
  document.getElementById("check-workflow-order-btn").addEventListener("click", () => {
    const allCorrect = workflowPuzzle.check();
    const fb = document.getElementById("workflow-order-feedback");
    fb.classList.remove("hidden");
    fb.className = "feedback-box " + (allCorrect ? "correct" : "incorrect");
    fb.innerHTML = allCorrect
      ? "Richtig! Dockerfile → Image bauen → Registry → Container starten."
      : "Noch nicht ganz - grün markierte Karten stehen an der richtigen Stelle, rot markierte nicht.";
  });
  document.getElementById("reset-workflow-order-btn").addEventListener("click", () => {
    workflowPuzzle.reset();
    document.getElementById("workflow-order-feedback").classList.add("hidden");
  });

  renderQuiz();
  document.getElementById("check-quiz-btn").addEventListener("click", checkQuiz);
});
