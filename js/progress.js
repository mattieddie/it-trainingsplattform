/*
 * progress.js - gemeinsames Fortschrittssystem fuer alle Module.
 * Speichert ausschliesslich lokal im Browser (localStorage). Es gibt
 * keinen Server, kein Login, keine Uebertragung von Daten irgendwohin.
 */

const PROGRESS_STORAGE_KEY = "netsec-trainer-progress-v1";

/** Reihenfolge und Metadaten der Module, zentral an einer Stelle gepflegt. */
const MODULES = [
  {
    id: "computerbasics",
    title: "Computer- & Windows-Grundlagen",
    icon: "\u{1F9E9}",
    description:
      "Startmodul: Computeraufbau (CPU/RAM/Speicher), Benutzer- vs. Systemebene, NTFS-Berechtigungen, Registry und Dateitypen.",
    href: "modules/computer-basics.html",
  },
  {
    id: "subnetting",
    title: "Subnetting-Trainer",
    icon: "\u{1F522}",
    description:
      "Berechne Netzadresse, Broadcast, nutzbare Hosts und das naechste Subnetz zu zufaellig generierten IP/CIDR-Aufgaben.",
    href: "modules/subnetting.html",
  },
  {
    id: "dhcpdns",
    title: "DHCP/DNS-Troubleshooting",
    icon: "\u{1F4E8}",
    description:
      "Helpdesk-Tickets mit simulierten Tool-Ausgaben (ipconfig, nslookup, ping). Finde die Ursache und die Loesung.",
    href: "modules/dhcp-dns.html",
  },
  {
    id: "firewall",
    title: "Firewall-Regel-Puzzle",
    icon: "\u{1F6E1}️",
    description:
      "Bringe Firewall-Regeln in die richtige Reihenfolge, damit das geforderte Verhalten entsteht. Erste passende Regel gewinnt.",
    href: "modules/firewall.html",
  },
  {
    id: "sqli",
    title: "SQL-Injection-Simulation",
    icon: "\u{1F9EA}",
    description:
      "Rein clientseitige Lernsimulation: warum ein naiver Login anfaellig ist und wie parametrisierte Queries schuetzen.",
    href: "modules/sqli.html",
  },
  {
    id: "dnsconcepts",
    title: "DNS & Domain-Konzepte",
    icon: "\u{1F310}",
    description:
      "A/CNAME-Records, TTL und Propagation erklaert - inkl. Platzhaltern fuer die eigene GitHub-Pages-Domain.",
    href: "modules/dns-concepts.html",
  },
  {
    id: "terminal",
    title: "CMD & PowerShell Terminal-Trainer",
    icon: "\u{1F4BB}",
    description:
      "Simuliertes Terminal: loese Aufgaben, indem du den richtigen CMD- oder PowerShell-Befehl eintippst.",
    href: "modules/terminal.html",
  },
  {
    id: "activedirectory",
    title: "Active Directory",
    icon: "\u{1F4C1}",
    description:
      "OUs, Gruppenrichtlinien-Vererbung (LSDOU) und AD-Troubleshooting-Tickets (Sperrungen, Replikation, FSMO).",
    href: "modules/active-directory.html",
  },
  {
    id: "intuneentra",
    title: "Intune / Entra ID / Hybrid",
    icon: "\u{2601}\u{FE0F}",
    description:
      "Join-Typen, Conditional Access und Intune-Compliance verstehen - inkl. Troubleshooting-Tickets aus der Cloud-Welt.",
    href: "modules/intune-entra.html",
  },
  {
    id: "backup",
    title: "Backup & Recovery",
    icon: "\u{1F4BE}",
    description:
      "3-2-1-Regel, RPO/RTO-Rechenaufgaben und Ransomware-Szenarien: welche Backup-Kopie ueberlebt einen Angriff?",
    href: "modules/backup.html",
  },
  {
    id: "emailsecurity",
    title: "E-Mail-Sicherheit",
    icon: "\u{1F4E7}",
    description:
      "SPF, DKIM und DMARC verstehen - inkl. Spoofing- und Zustellungs-Szenarien mit steigendem Schwierigkeitsgrad.",
    href: "modules/email-security.html",
  },
  {
    id: "scripting",
    title: "Skripting-Grundlagen",
    icon: "\u{1F4DC}",
    description:
      "Batch- und PowerShell-Skripte lesen und die tatsaechliche Ausgabe vorhersagen - inkl. klassischer Stolperfallen.",
    href: "modules/scripting.html",
  },
  {
    id: "cloudbasics",
    title: "Cloud-Grundlagen",
    icon: "\u{1F329}\u{FE0F}",
    description:
      "RBAC-Rollenwahl nach Least Privilege und M365-Lizenzierung - Azure/M365-Grundlagen fuer den Alltag.",
    href: "modules/cloud-basics.html",
  },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Fortschritt konnte nicht gelesen werden:", err);
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn("Fortschritt konnte nicht gespeichert werden:", err);
  }
}

/**
 * Aktualisiert den Fortschritt eines Moduls.
 * status: "progress" | "done"
 * extra: beliebige zusaetzliche Daten (z.B. Score), werden gemerged.
 */
function setModuleStatus(moduleId, status, extra) {
  const progress = loadProgress();
  progress[moduleId] = Object.assign({}, progress[moduleId], extra, {
    status,
    updatedAt: new Date().toISOString(),
  });
  saveProgress(progress);
}

function getModuleStatus(moduleId) {
  const progress = loadProgress();
  return progress[moduleId] ? progress[moduleId].status : "none";
}

function resetAllProgress() {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

/** Rendert die Modul-Uebersicht + Fortschrittsbalken in ein Container-Element. */
function renderModuleOverview(containerEl, progressBarEl, progressLabelEl) {
  const progress = loadProgress();
  const total = MODULES.length;
  const done = MODULES.filter(
    (m) => progress[m.id] && progress[m.id].status === "done"
  ).length;

  if (progressBarEl) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    progressBarEl.style.width = pct + "%";
  }
  if (progressLabelEl) {
    progressLabelEl.textContent = `${done} / ${total} Module abgeschlossen`;
  }

  if (!containerEl) return;
  containerEl.innerHTML = "";

  MODULES.forEach((mod) => {
    const status = progress[mod.id] ? progress[mod.id].status : "none";
    const statusMeta = {
      none: { label: "Nicht begonnen", cls: "status-none" },
      progress: { label: "In Bearbeitung", cls: "status-progress" },
      done: { label: "Abgeschlossen", cls: "status-done" },
    }[status];

    const card = document.createElement("div");
    card.className = "module-card";
    card.innerHTML = `
      <div class="icon">${mod.icon}</div>
      <h3>${mod.title}</h3>
      <span class="badge ${statusMeta.cls}">${statusMeta.label}</span>
      <p>${mod.description}</p>
      <a class="btn primary cta" href="${mod.href}">Modul oeffnen</a>
    `;
    containerEl.appendChild(card);
  });
}

/** Markiert die aktuelle Modul-Seite als "in Bearbeitung", sobald sie geladen wird. */
function markModuleStarted(moduleId) {
  const current = getModuleStatus(moduleId);
  if (current === "none") {
    setModuleStatus(moduleId, "progress");
  }
}
