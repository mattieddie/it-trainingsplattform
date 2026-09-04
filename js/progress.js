/*
 * progress.js - gemeinsames Fortschrittssystem für alle Module.
 * Speichert ausschliesslich lokal im Browser (localStorage). Es gibt
 * keinen Server, kein Login, keine Übertragung von Daten irgendwohin.
 */

const PROGRESS_STORAGE_KEY = "netsec-trainer-progress-v1";

/**
 * Baukästen (Lernpfad-Blöcke), in der Reihenfolge, in der ein Einsteiger
 * sie sinnvollerweise durcharbeiten würde - vom Fundament bis zum Betrieb.
 */
const TRACKS = [
  {
    id: "grundlagen",
    title: "IT-Grundlagen",
    icon: "\u{1F9F1}",
    description:
      "Das Handwerkszeug: wie ein Computer aufgebaut ist und wie man ihn per Kommandozeile/Skript steuert.",
  },
  {
    id: "netzwerk",
    title: "Netzwerk-Grundlagen",
    icon: "\u{1F310}",
    description: "Wie Geräte sich finden und miteinander sprechen - Adressierung und Namensauflösung.",
  },
  {
    id: "identitaet",
    title: "Verzeichnisdienste & Identität",
    icon: "\u{1F4C1}",
    description:
      "Benutzer, Geräte und Rechte zentral verwalten - erst On-Premises (Active Directory), dann in der Cloud.",
  },
  {
    id: "paketierung",
    title: "Softwareverteilung & Paketierung",
    icon: "\u{1F4E6}",
    description: "Wie Anwendungen für die Massen-Verteilung vorbereitet werden - MSI, Transforms und Repackaging.",
  },
  {
    id: "security",
    title: "IT-Security",
    icon: "\u{1F512}",
    description: "Angriffsflächen erkennen und absichern - Netzwerkgrenzen, Anwendungen und E-Mail.",
  },
  {
    id: "betrieb",
    title: "Betrieb & Notfallvorsorge",
    icon: "\u{1F6E0}\u{FE0F}",
    description: "Alles läuft - aber was, wenn nicht? Vorsorge für den Ernstfall.",
  },
];

/** Reihenfolge und Metadaten der Module, zentral an einer Stelle gepflegt. */
const MODULES = [
  // ---- Baukasten: IT-Grundlagen ----
  {
    id: "computerbasics",
    track: "grundlagen",
    title: "Computer- & Windows-Grundlagen",
    icon: "\u{1F9E9}",
    description:
      "Startmodul: Computeraufbau (CPU/RAM/Speicher), Benutzer- vs. Systemebene, NTFS-Berechtigungen, Registry und Dateitypen.",
    href: "modules/computer-basics.html",
  },
  {
    id: "terminal",
    track: "grundlagen",
    title: "CMD & PowerShell Terminal-Trainer",
    icon: "\u{1F4BB}",
    description:
      "Simuliertes Terminal: löse Aufgaben, indem du den richtigen CMD- oder PowerShell-Befehl eintippst.",
    href: "modules/terminal.html",
    prereqs: ["computerbasics"],
  },
  {
    id: "scripting",
    track: "grundlagen",
    title: "Skripting-Grundlagen",
    icon: "\u{1F4DC}",
    description:
      "Batch- und PowerShell-Skripte lesen und die tatsächliche Ausgabe vorhersagen - inkl. klassischer Stolperfallen.",
    href: "modules/scripting.html",
    prereqs: ["terminal"],
  },

  // ---- Baukasten: Netzwerk-Grundlagen ----
  {
    id: "networkpackets",
    track: "netzwerk",
    title: "Netzwerkpakete, TCP/UDP & OSI-Modell",
    icon: "\u{1F4F6}",
    description:
      "Kapselung/Paketaufbau, TTL, TCP vs. UDP (inkl. Drei-Wege-Handshake) und wie OSI- und TCP/IP-Modell zusammenhängen.",
    href: "modules/network-packets.html",
    prereqs: ["computerbasics"],
  },
  {
    id: "networkdevices",
    track: "netzwerk",
    title: "Netzwerkgeräte & Routing",
    icon: "\u{1F50C}",
    description:
      "Hub vs. Switch vs. Router im Vergleich, plus generierte Routing-Tabellen-Aufgaben (Longest Prefix Match).",
    href: "modules/network-devices.html",
    prereqs: ["networkpackets"],
  },
  {
    id: "subnetting",
    track: "netzwerk",
    title: "Subnetting-Trainer",
    icon: "\u{1F522}",
    description:
      "Berechne Netzadresse, Broadcast, nutzbare Hosts und das nächste Subnetz zu zufällig generierten IP/CIDR-Aufgaben.",
    href: "modules/subnetting.html",
    prereqs: ["networkpackets"],
  },
  {
    id: "dnsconcepts",
    track: "netzwerk",
    title: "DNS & Domain-Konzepte",
    icon: "\u{1F310}",
    description:
      "A/CNAME-Records, TTL und Propagation erklärt - inkl. Platzhaltern für die eigene GitHub-Pages-Domain.",
    href: "modules/dns-concepts.html",
    prereqs: ["networkpackets"],
  },
  {
    id: "dhcpdns",
    track: "netzwerk",
    title: "DHCP/DNS-Troubleshooting",
    icon: "\u{1F4E8}",
    description:
      "Helpdesk-Tickets mit simulierten Tool-Ausgaben (ipconfig, nslookup, ping). Finde die Ursache und die Lösung.",
    href: "modules/dhcp-dns.html",
    prereqs: ["subnetting", "dnsconcepts"],
  },
  {
    id: "vpnbasics",
    track: "netzwerk",
    title: "VPN-Grundlagen",
    icon: "\u{1F510}",
    description:
      "Site-to-Site vs. Client-to-Site, IPSec vs. SSL-VPN, Split- vs. Full-Tunneling.",
    href: "modules/vpn-basics.html",
    prereqs: ["networkdevices"],
  },

  // ---- Baukasten: Verzeichnisdienste & Identität ----
  {
    id: "activedirectory",
    track: "identitaet",
    title: "Active Directory",
    icon: "\u{1F4C1}",
    description:
      "OUs, Gruppenrichtlinien-Vererbung (LSDOU) und AD-Troubleshooting-Tickets (Sperrungen, Replikation, FSMO).",
    href: "modules/active-directory.html",
    prereqs: ["dhcpdns"],
  },
  {
    id: "intuneentra",
    track: "identitaet",
    title: "Intune / Entra ID / Hybrid",
    icon: "\u{2601}\u{FE0F}",
    description:
      "Join-Typen, Conditional Access, Gerätemanagement und Intune-Compliance - inkl. Troubleshooting-Tickets aus der Cloud-Welt.",
    href: "modules/intune-entra.html",
    prereqs: ["activedirectory"],
  },
  {
    id: "cloudbasics",
    track: "identitaet",
    title: "Cloud-Grundlagen",
    icon: "\u{1F329}\u{FE0F}",
    description:
      "RBAC-Rollenwahl nach Least Privilege und M365-Lizenzierung - Azure/M365-Grundlagen für den Alltag.",
    href: "modules/cloud-basics.html",
    prereqs: ["intuneentra"],
  },

  // ---- Baukasten: Softwareverteilung & Paketierung ----
  {
    id: "packaging",
    track: "paketierung",
    title: "Software-Paketierung",
    icon: "\u{1F4E6}",
    description:
      "MSI-Aufbau (Tabellen, Dateistreams), Transforms (MST), stille Installation per CMD und Repackaging (RayPack: RCP/RPP).",
    href: "modules/packaging.html",
    prereqs: ["scripting"],
  },

  // ---- Baukasten: IT-Security ----
  {
    id: "encryption",
    track: "security",
    title: "Verschlüsselung",
    icon: "\u{1F511}",
    description:
      "Symmetrisch, asymmetrisch und hybrid verschlüsseln, Diffie-Hellman-Schlüsselaustausch, sowie Hashing und Salt - mit zwei echten SHA-256-Live-Demos.",
    href: "modules/encryption.html",
    prereqs: ["networkpackets"],
  },
  {
    id: "firewall",
    track: "security",
    title: "Firewall-Regel-Puzzle",
    icon: "\u{1F6E1}️",
    description:
      "Bringe Firewall-Regeln in die richtige Reihenfolge, damit das geforderte Verhalten entsteht. Erste passende Regel gewinnt.",
    href: "modules/firewall.html",
    prereqs: ["networkdevices"],
  },
  {
    id: "sqli",
    track: "security",
    title: "SQL-Injection-Simulation",
    icon: "\u{1F9EA}",
    description:
      "Rein clientseitige Lernsimulation: warum ein naiver Login anfällig ist und wie parametrisierte Queries schützen.",
    href: "modules/sqli.html",
    prereqs: ["scripting"],
  },
  {
    id: "emailsecurity",
    track: "security",
    title: "E-Mail-Sicherheit",
    icon: "\u{1F4E7}",
    description:
      "SPF, DKIM und DMARC verstehen - inkl. Spoofing- und Zustellungs-Szenarien mit steigendem Schwierigkeitsgrad.",
    href: "modules/email-security.html",
    prereqs: ["dnsconcepts", "encryption"],
  },

  // ---- Baukasten: Betrieb & Notfallvorsorge ----
  {
    id: "backup",
    track: "betrieb",
    title: "Backup & Recovery",
    icon: "\u{1F4BE}",
    description:
      "3-2-1-Regel, RPO/RTO-Rechenaufgaben und Ransomware-Szenarien: welche Backup-Kopie überlebt einen Angriff?",
    href: "modules/backup.html",
    prereqs: ["activedirectory"],
  },
];

/**
 * Fisher-Yates-Shuffle. Wird von allen Modulen genutzt, um die Reihenfolge
 * der Antwortoptionen bei jedem Rendern neu zu mischen - die richtige
 * Antwort soll nicht immer an derselben Position stehen.
 */
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
 * extra: beliebige zusätzliche Daten (z.B. Score), werden gemerged.
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

function moduleTitleById(moduleId) {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod ? mod.title : moduleId;
}

function moduleCardHtml(mod, progress) {
  const status = progress[mod.id] ? progress[mod.id].status : "none";
  const statusMeta = {
    none: { label: "Nicht begonnen", cls: "status-none" },
    progress: { label: "In Bearbeitung", cls: "status-progress" },
    done: { label: "Abgeschlossen", cls: "status-done" },
  }[status];

  const prereqsHtml =
    mod.prereqs && mod.prereqs.length
      ? `<p class="text-muted prereq-line">Baut auf: ${mod.prereqs.map(moduleTitleById).join(", ")}</p>`
      : "";

  return `
    <div class="module-card">
      <div class="icon">${mod.icon}</div>
      <h3>${mod.title}</h3>
      <span class="badge ${statusMeta.cls}">${statusMeta.label}</span>
      <p>${mod.description}</p>
      ${prereqsHtml}
      <a class="btn primary cta" href="${mod.href}">Modul öffnen</a>
    </div>
  `;
}

/**
 * Rendert eine kompakte Lernpfad-Übersicht: die Baukästen-Reihenfolge als
 * Kette, plus die wichtigsten Abhängigkeiten, die über Baukasten-Grenzen
 * hinweg gehen (z.B. Active Directory baut auf DHCP/DNS aus dem
 * Netzwerk-Baukasten auf).
 */
function renderLearningPath(containerEl) {
  if (!containerEl) return;

  const chain = TRACKS.map((t) => `<span class="path-chip">${t.icon} ${t.title}</span>`).join(
    '<span class="path-arrow">→</span>'
  );

  const crossTrackEdges = MODULES.filter((m) => m.prereqs && m.prereqs.length).filter((m) =>
    m.prereqs.some((p) => {
      const prereqMod = MODULES.find((x) => x.id === p);
      return prereqMod && prereqMod.track !== m.track;
    })
  );

  const edgesHtml = crossTrackEdges
    .map((m) => {
      const trackTitle = TRACKS.find((t) => t.id === m.track).title;
      const prereqLabels = m.prereqs
        .map((p) => {
          const prereqMod = MODULES.find((x) => x.id === p);
          const crossing = prereqMod && prereqMod.track !== m.track;
          return crossing
            ? `<strong>${prereqMod.title}</strong> (${TRACKS.find((t) => t.id === prereqMod.track).title})`
            : moduleTitleById(p);
        })
        .join(", ");
      return `<li>${m.icon} <strong>${m.title}</strong> (${trackTitle}) baut auf: ${prereqLabels}</li>`;
    })
    .join("");

  containerEl.innerHTML = `
    <div class="path-chain">${chain}</div>
    <p class="text-muted" style="margin-top:10px;">
      Innerhalb jedes Baukastens bauen die Module meist ebenfalls
      aufeinander auf (siehe "Baut auf"-Hinweis auf den Modul-Karten unten).
      Zusätzlich gibt es folgende Verbindungen, die über Baukasten-Grenzen
      hinweg gehen:
    </p>
    <ul class="path-edge-list">${edgesHtml}</ul>
  `;
}

/** Rendert die nach Baukästen gruppierte Modul-Übersicht + Gesamtfortschrittsbalken. */
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

  TRACKS.forEach((track, trackIdx) => {
    const trackModules = MODULES.filter((m) => m.track === track.id);
    if (trackModules.length === 0) return;

    const trackDone = trackModules.filter(
      (m) => progress[m.id] && progress[m.id].status === "done"
    ).length;

    const section = document.createElement("section");
    section.className = "track-section";
    section.innerHTML = `
      <div class="track-header">
        <span class="track-number">${trackIdx + 1}</span>
        <div>
          <h2 class="track-title">${track.icon} ${track.title}</h2>
          <p class="track-description">${track.description}</p>
        </div>
        <span class="track-progress">${trackDone} / ${trackModules.length}</span>
      </div>
      <div class="module-grid"></div>
    `;

    const grid = section.querySelector(".module-grid");
    trackModules.forEach((mod) => {
      grid.insertAdjacentHTML("beforeend", moduleCardHtml(mod, progress));
    });

    containerEl.appendChild(section);
  });
}

/** Markiert die aktuelle Modul-Seite als "in Bearbeitung", sobald sie geladen wird. */
function markModuleStarted(moduleId) {
  const current = getModuleStatus(moduleId);
  if (current === "none") {
    setModuleStatus(moduleId, "progress");
  }
}

/** Dropdown-Navigation: Baukasten-Gruppen oeffnen/schliessen per Klick. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-dropdown-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = btn.closest(".nav-dropdown");
      const wasOpen = dropdown.classList.contains("open");
      document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
      if (!wasOpen) dropdown.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav-dropdown.open").forEach((d) => d.classList.remove("open"));
    }
  });
});
