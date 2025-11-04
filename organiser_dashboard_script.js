const STORAGE_KEY = "organizer_dashboard_v3";

const storage = {
  get(key, fallback = []) {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${key}`)) || fallback;
  },
  set(key, value) {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(value));
  },
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ================= NAVIGATION =================
$$(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    $$(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(target).classList.add("active");
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ================= STATE =================
let state = {
  teams: storage.get("teams"),
  matches: storage.get("matches"),
  scores: storage.get("scores", {}),
  spirit: storage.get("spirit", {}),
  announcements: storage.get("announcements"),
  gallery: storage.get("gallery"),
  children: storage.get("children"),
  visits: storage.get("visits"),
  sessions: storage.get("sessions"),
};

function saveAll() {
  for (const k in state) storage.set(k, state[k]);
}

// ================= TOURNAMENT MANAGEMENT =================

// --- Teams ---
// ---------- TEAM APPROVAL (Spot Registration + Sample Teams) ----------
if (!localStorage.getItem(`${STORAGE_KEY}_teams`)) {
  state.teams = [
    {
      name: "Thunder Hawks",
      coach: "John Mathews",
      contact: "9876543210",
      status: "Pending",
      players: [
        { playerName: "Arun Kumar", age: 21, bmi: 23.1 },
        { playerName: "Vijay Menon", age: 22, bmi: 22.4 },
        { playerName: "Rahul Nair", age: 20, bmi: 24.3 }
      ]
    },
    {
      name: "Blue Whales",
      coach: "Suresh Rajan",
      contact: "9123456789",
      status: "Pending",
      players: [
        { playerName: "Kiran Lal", age: 23, bmi: 21.7 },
        { playerName: "Manoj Das", age: 22, bmi: 22.1 },
        { playerName: "Naveen Rao", age: 21, bmi: 23.5 }
      ]
    }
  ];
  saveAll();
}

let tempPlayers = [];

// ---------- Add Players ----------
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

// ---------- Register Team ----------
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
  saveAll();
});

// ---------- Display Teams ----------
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
        <b>${t.name}</b>
        <span style="color:#6b7280;">(${t.status})</span><br>
        <small>Coach: ${t.coach}</small>
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

$("#teamList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const i = btn.dataset.i;
  const act = btn.dataset.act;

  if (act === "view") return showTeamDetails(state.teams[i]);
  if (act === "accept") state.teams[i].status = "Accepted";
  if (act === "reject") state.teams[i].status = "Rejected";
  renderTeams();
  saveAll();
});

// ---------- View Details Modal ----------
function showTeamDetails(team) {
  const modal = $("#modalOverlay");
  const content = $("#modalContent");
  const playerRows = team.players.map(p => `
    <tr>
      <td>${p.playerName}</td>
      <td>${p.age}</td>
      <td>${p.bmi}</td>
    </tr>`).join("");
  content.innerHTML = `
    <h2>${team.name}</h2>
    <p><strong>Coach:</strong> ${team.coach}</p>
    <p><strong>Contact:</strong> ${team.contact}</p>
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





// --- Matches ---
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

// --- Scores ---
function renderScores() {
  const board = $("#scoreboard");
  board.innerHTML = "";
  const entries = Object.entries(state.scores);
  if (!entries.length) return (board.innerHTML = "<p>No scores yet.</p>");
  entries.forEach(([team, score]) => {
    board.innerHTML += `<p>${team}: <b>${score}</b></p>`;
  });
}

$("#scoreForm").addEventListener("submit", e => {
  e.preventDefault();
  const team = $("#scoreTeamDropdown").value;
  const score = Number($("#scoreValueInput").value);
  if (!team) return alert("Select a team");
  state.scores[team] = score;
  renderScores();
  saveAll();
});

$("#resetScoresBtn").addEventListener("click", () => {
  if (confirm("Reset all scores?")) {
    state.scores = {};
    renderScores();
    saveAll();
  }
});

// --- Spirit Leaderboard ---
function renderSpirit() {
  const list = $("#leaderboard");
  list.innerHTML = "";
  const entries = Object.entries(state.spirit);
  if (!entries.length) return (list.innerHTML = "<li>No data</li>");
  entries.sort((a, b) => b[1] - a[1]);
  entries.forEach(([team, points]) => (list.innerHTML += `<li>${team}: ${points} pts</li>`));
}

$("#spiritForm").addEventListener("submit", e => {
  e.preventDefault();
  const team = $("#spiritTeamDropdown").value;
  const points = Number($("#spiritPointsInput").value);
  if (!team) return;
  state.spirit[team] = (state.spirit[team] || 0) + points;
  renderSpirit();
  saveAll();
});

$("#resetSpiritBtn").addEventListener("click", () => {
  if (confirm("Reset points?")) {
    state.spirit = {};
    renderSpirit();
    saveAll();
  }
});

// --- Announcements ---
function renderAnnouncements() {
  const list = $("#announcementList");
  list.innerHTML = "";
  if (!state.announcements.length) return (list.innerHTML = "<li>No announcements</li>");
  state.announcements.forEach((a, i) => {
    list.innerHTML += `<li>${a}<button class="btn-red" data-i="${i}">Delete</button></li>`;
  });
}

$("#announcementForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("#announcementText").value.trim();
  if (!text) return;
  state.announcements.push(text);
  $("#announcementForm").reset();
  renderAnnouncements();
  saveAll();
});

$("#announcementList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  state.announcements.splice(btn.dataset.i, 1);
  renderAnnouncements();
  saveAll();
});

$("#clearAnnouncements").addEventListener("click", () => {
  if (confirm("Clear all announcements?")) {
    state.announcements = [];
    renderAnnouncements();
    saveAll();
  }
});

// --- Gallery ---
function renderGallery() {
  const div = $("#gallery");
  div.innerHTML = "";
  if (!state.gallery.length) return (div.innerHTML = "<p>No photos</p>");
  state.gallery.forEach((img, i) => {
    div.innerHTML += `<div><img src="${img}" alt=""><button class="btn-red" data-i="${i}">✕</button></div>`;
  });
}

$("#uploadPhotoBtn").addEventListener("click", () => {
  const file = $("#photoUpload").files[0];
  if (!file) return alert("Select an image");
  const reader = new FileReader();
  reader.onload = e => {
    state.gallery.push(e.target.result);
    renderGallery();
    saveAll();
  };
  reader.readAsDataURL(file);
});

$("#gallery").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  state.gallery.splice(btn.dataset.i, 1);
  renderGallery();
  saveAll();
});

$("#clearGalleryBtn").addEventListener("click", () => {
  if (confirm("Clear gallery?")) {
    state.gallery = [];
    renderGallery();
    saveAll();
  }
});

// --- Dropdowns ---
function updateDropdowns() {
  const approved = state.teams.filter(t => t.status === "Approved").map(t => t.name);
  const all = state.teams.map(t => t.name);
  $("#teamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
  $("#scoreTeamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
  $("#spiritTeamDropdown").innerHTML = all.map(t => `<option>${t}</option>`).join("");
}

// ================= COACHING PROGRAMME =================

// --- Children ---
function renderChildren() {
  const list = $("#childList");
  list.innerHTML = "";
  if (!state.children.length) return (list.innerHTML = "<li>No children</li>");
  state.children.forEach((c, i) => {
    list.innerHTML += `<li>${c.name} - ${c.attendance} days
    <div class="action-group">
      <button class="btn-green" data-act="mark" data-i="${i}">Mark</button>
      <button class="btn-red" data-act="remove" data-i="${i}">Remove</button>
    </div></li>`;
  });
}

$("#childForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#childName").value.trim();
  if (!name) return;
  state.children.push({ name, attendance: 0 });
  $("#childForm").reset();
  renderChildren();
  saveAll();
});

$("#childList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const i = btn.dataset.i;
  if (btn.dataset.act === "mark") state.children[i].attendance++;
  if (btn.dataset.act === "remove") state.children.splice(i, 1);
  renderChildren();
  saveAll();
});

// --- Visits ---
function renderVisits() {
  const list = $("#visitList");
  list.innerHTML = "";
  if (!state.visits.length) return (list.innerHTML = "<li>No visits</li>");
  state.visits.forEach(v => (list.innerHTML += `<li>${v}</li>`));
}

$("#visitForm").addEventListener("submit", e => {
  e.preventDefault();
  const note = $("#visitNotes").value.trim();
  if (!note) return;
  state.visits.push(note);
  $("#visitForm").reset();
  renderVisits();
  saveAll();
});

// --- Sessions ---
function renderSessions() {
  const list = $("#sessionList");
  list.innerHTML = "";
  if (!state.sessions.length) return (list.innerHTML = "<li>No sessions</li>");
  state.sessions.forEach(s => (list.innerHTML += `<li>${s.coach}: ${s.details}</li>`));
}

$("#sessionForm").addEventListener("submit", e => {
  e.preventDefault();
  const coach = $("#coachName").value.trim();
  const details = $("#sessionDetails").value.trim();
  if (!coach || !details) return;
  state.sessions.push({ coach, details });
  $("#sessionForm").reset();
  renderSessions();
  saveAll();
});

// --- Report ---
$("#generateReport").addEventListener("click", () => {
  const totalChildren = state.children.length;
  const totalSessions = state.sessions.length;
  const avgAttendance = totalChildren ? (state.children.reduce((a, c) => a + c.attendance, 0) / totalChildren).toFixed(1) : 0;
  $("#reportOutput").textContent = `📊 Coaching Report
Total Children: ${totalChildren}
Total Sessions: ${totalSessions}
Average Attendance: ${avgAttendance} days`;
});

// ================= INIT =================
function init() {
  renderTeams();
  renderMatches();
  renderScores();
  renderSpirit();
  renderAnnouncements();
  renderGallery();
  renderChildren();
  renderVisits();
  renderSessions();
  updateDropdowns();
}

window.addEventListener("DOMContentLoaded", init);
