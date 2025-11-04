const STORAGE_KEY = "organizer_dashboard_v4";

// ========== Local Storage Helper ==========
const storage = {
  get(key, fallback = []) {
    try {
      return JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${key}`)) || fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
  },
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY))
      .forEach(k => localStorage.removeItem(k));
  }
};

// ========== Shortcuts ==========
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ========== Navigation ==========
$$(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    $$(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ========== State ==========
let state = {
  // ✅ Load teams from registration storage first
  teams: JSON.parse(localStorage.getItem("teams")) || storage.get("teams", []),
  matches: storage.get("matches"),
  scores: storage.get("scores", {}),
  spirit: storage.get("spirit", {}),
  announcements: storage.get("announcements"),
  gallery: storage.get("gallery"),
  children: storage.get("children"),
  visits: storage.get("visits"),
  sessions: storage.get("sessions"),
};

// ========== Save Function ==========
function saveAll() {
  for (const k in state) storage.set(k, state[k]);
}

// Remove old default demo teams (no need for sample data)
let tempPlayers = [];

// ========== PLAYER MANAGEMENT ==========
function renderPlayerList() {
  const list = $("#playerList");
  list.innerHTML = "";
  if (!tempPlayers.length) {
    list.innerHTML = "<li>No players added yet.</li>";
    return;
  }
  tempPlayers.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.playerName} (Age: ${p.age}, BMI: ${p.bmi})
      <button class="btn-red" data-i="${i}">Remove</button>`;
    list.appendChild(li);
  });
}

$("#addPlayerBtn").addEventListener("click", () => {
  const name = $("#playerNameInput").value.trim();
  const age = $("#playerAgeInput").value.trim();
  const bmi = $("#playerBmiInput").value.trim();
  if (!name || !age || !bmi) return alert("Please fill all player details");

  tempPlayers.push({ playerName: name, age, bmi });
  $("#playerNameInput").value = "";
  $("#playerAgeInput").value = "";
  $("#playerBmiInput").value = "";
  renderPlayerList();
});

$("#playerList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  tempPlayers.splice(btn.dataset.i, 1);
  renderPlayerList();
});

// ========== TEAM REGISTRATION ==========
$("#teamForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#teamNameInput").value.trim();
  if (!name) return alert("Enter team name");
  if (!tempPlayers.length) return alert("Add at least one player");

  const team = {
    name,
    coach: $("#teamCoachInput").value.trim(),
    contact: $("#teamContactInput").value.trim(),
    players: [...tempPlayers],
    status: "Pending"
  };

  state.teams.push(team);
  tempPlayers = [];
  $("#teamForm").reset();
  renderPlayerList();
  renderTeams();
  updateDropdowns();
  saveAll();

  // 🔄 Also save to registration storage
  localStorage.setItem("teams", JSON.stringify(state.teams));
});

// ========== TEAM LIST ==========
function renderTeams() {
  const list = $("#teamList");
  list.innerHTML = "";
  if (!state.teams.length) {
    list.innerHTML = "<li>No teams registered yet.</li>";
    return;
  }

  state.teams.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <b>${t.teamName || t.name}</b>
        <span style="color:#6b7280;">(${t.status || "Pending"})</span><br>
        <small>Coach: ${t.coachName || t.coach}</small>
      </div>
      <div class="action-group">
        <button class="btn-blue" data-act="view" data-i="${i}">View Details</button>
        <button class="btn-green" data-act="accept" data-i="${i}">Accept</button>
        <button class="btn-red" data-act="reject" data-i="${i}">Reject</button>
      </div>`;
    list.appendChild(li);
  });
  saveAll();
}

// ✅ Updated event listener with sync fix
$("#teamList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const i = btn.dataset.i;
  const act = btn.dataset.act;

  if (act === "view") return showTeamDetails(state.teams[i]);
  if (act === "accept") state.teams[i].status = "Accepted";
  if (act === "reject") state.teams[i].status = "Rejected";

  // 🔄 Sync with registration storage
  localStorage.setItem("teams", JSON.stringify(state.teams));

  renderTeams();
  updateDropdowns();
  saveAll();
});

// ========== TEAM DETAILS MODAL ==========
function showTeamDetails(team) {
  const modal = $("#modalOverlay");
  const content = $("#modalContent");

  // For compatibility with both register.html and dashboard-created teams
  const players = team.players || team.Players || [];

  const playerRows = players.map(p => `
    <tr>
      <td>${p.playerName || p.name}</td>
      <td>${p.age}</td>
      <td>${p.bmi}</td>
    </tr>`).join("");

  content.innerHTML = `
    <h2>${team.teamName || team.name}</h2>
    <p><strong>Coach:</strong> ${team.coachName || team.coach}</p>
    <p><strong>Contact:</strong> ${team.contact || team.phone}</p>
    <p><strong>Status:</strong> ${team.status}</p>
    <h3>Players</h3>
    <table class="player-table">
      <tr><th>Name</th><th>Age</th><th>BMI</th></tr>
      ${playerRows}
    </table>`;

  modal.classList.remove("hidden");
}

$("#modalClose").addEventListener("click", () => {
  $("#modalOverlay").classList.add("hidden");
});
$("#modalOverlay").addEventListener("click", e => {
  if (e.target.id === "modalOverlay") $("#modalOverlay").classList.add("hidden");
});

// ========== MATCHES, SCORES, ETC. ==========
function renderMatches() {
  const list = $("#matchList");
  list.innerHTML = "";
  if (!state.matches.length) return (list.innerHTML = "<li>No matches</li>");
  state.matches.forEach((m, i) => {
    list.innerHTML += `<li>${m.home} vs ${m.away} - ${m.details}
      <div class="action-group">
        <button class="btn-red" data-act="deleteMatch" data-i="${i}">Delete</button>
      </div></li>`;
  });
}

$("#matchForm").addEventListener("submit", e => {
  e.preventDefault();
  const home = $("#teamDropdown").value;
  const away = $("#opponentInput").value.trim();
  const details = $("#matchTimeInput").value.trim();
  if (!home || !away) return alert("Enter teams");
  state.matches.push({ home, away, details });
  $("#matchForm").reset();
  renderMatches();
  saveAll();
});

$("#matchList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.act === "deleteMatch") {
    state.matches.splice(btn.dataset.i, 1);
    renderMatches();
    saveAll();
  }
});

// ========== DROPDOWNS ==========
function updateDropdowns() {
  const all = state.teams.map(t => t.teamName || t.name);
  $("#teamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
  $("#scoreTeamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
  $("#spiritTeamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
}

// ========== INIT ==========
function init() {
  renderTeams();
  renderMatches();
  renderPlayerList();
  updateDropdowns();
}

window.addEventListener("DOMContentLoaded", init);
