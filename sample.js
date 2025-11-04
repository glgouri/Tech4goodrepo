// These imports are necessary for Firebase
// They are loaded because we specified type="module" in the HTML
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, collection, query, where, getDocs, limit 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase & App Configuration ---

// Get the app ID from the global variable, or use a default
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-frisbee-app';

// Get Firebase config from the global variable
// This is INJECTED by the environment, so it will be defined.
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

// --- Global App Variables ---
let app, auth, db;
let currentRole = null; // "team" or "organizer"
let loggedInTeam = null; // Will store the team's data object after login
let isReadOnly = false; // Controls all edit/delete/add functionality

let currentTeamId = null; // The ID of the team whose players are being viewed (for any role)
let editingPlayerId = null;
let playerToDeleteId = null; 

let playerModal, deleteConfirmModal; // Bootstrap modal instances
let playerForm;
let teamListBody, playerListBody;
let loginView, dashboardView;
let orgColumns; // To show/hide organizer columns

// --- Initialization ---
// We wait for the DOM to be fully loaded before running our script
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Firebase
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Error initializing Firebase:", e);
    document.body.innerHTML = "<h1>Error initializing. Please check console.</h1>";
    return;
  }
  
  // Get references to HTML elements
  playerForm = document.getElementById("playerForm");
  teamListBody = document.getElementById("team-list-body");
  playerListBody = document.getElementById("player-list-body");
  loginView = document.getElementById("login-view");
  dashboardView = document.getElementById("dashboard-view");
  orgColumns = document.querySelectorAll(".org-column"); // Get all organizer-only columns

  // Initialize Bootstrap Modals
  // We need to access the global `bootstrap` object, which is loaded from the Bootstrap JS
  try {
    playerModal = new bootstrap.Modal(document.getElementById("playerModal"));
    deleteConfirmModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
  } catch (e) {
    console.error("Error initializing Bootstrap modals:", e);
  }

  // Start the authentication process
  handleAuthentication();

  // Attach global event listeners (for login, dashboard, etc.)
  attachGlobalListeners();
});

// --- Authentication ---
function handleAuthentication() {
  // We just sign in anonymously to get access to Firestore.
  // The app's "login" is custom logic, not Firebase Auth.
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Anonymous user signed in:", user.uid);
      // Check if data exists, if not, seed it.
      // This must be done *after* we have auth.
      await seedDataIfNeeded();
    } else {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error signing in anonymously:", error);
      }
    }
  });
}

// --- Data Seeding (First-time setup) ---
async function seedDataIfNeeded() {
  // Data is now public
  const teamColRef = collection(db, "artifacts", appId, "public", "data", "teams");
  
  const q = query(teamColRef, limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("No teams found. Seeding initial data...");
    
    // 1. Add the "Thunder Strikers" team with new fields
    const teamData = {
      name: "Thunder Strikers",
      coach: "John Mathew",
      contact: "+91 9876543210",
      matchesAttended: 4,
      score: 254,
      password: "123", // In a real app, this should be hashed.
      status: "pending" // "pending", "accepted", "rejected"
    };
    const teamDocRef = await addDoc(teamColRef, teamData);
    
    // 2. Add players to that team (new public subcollection)
    const playerColRef = collection(db, "artifacts", appId, "public", "data", "teams", teamDocRef.id, "players");
    const players = [
      { name: "Aryan Kumar", age: 22, phone: "+91 9898989898", bmi: 23.5 },
      { name: "Rahul Singh", age: 21, phone: "+91 9123456789", bmi: 22.9 },
      { name: "Vivek Raj", age: 23, phone: "+91 9988776655", bmi: 24.2 },
      { name: "Aditya Nair", age: 22, phone: "+91 9765432109", bmi: 23.1 }
    ];

    await Promise.all(players.map(player => addDoc(playerColRef, player)));
    
    console.log("Initial data seeded successfully. Team: Thunder Strikers, Pass: 123");
  } else {
    console.log("Existing data found. No seeding required.");
  }
}

// --- Login / Role Handling ---
async function handleTeamLogin(e) {
  e.preventDefault();
  const teamName = document.getElementById("teamName").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("login-error-msg");

  // Query for a team matching name and password
  const teamColRef = collection(db, "artifacts", appId, "public", "data", "teams");
  const q = query(teamColRef, 
    where("name", "==", teamName), 
    where("password", "==", password), 
    limit(1));
    
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    errorMsg.innerText = "Invalid team name or password.";
    errorMsg.style.display = "block";
  } else {
    // Login Successful
    errorMsg.style.display = "none";
    loggedInTeam = snapshot.docs[0].data();
    loggedInTeam.id = snapshot.docs[0].id; // Store the doc ID
    currentRole = "team";
    
    // Set Read-Only status based on team status
    // ACCEPTED = Read Only
    // PENDING or REJECTED = Read/Write
    isReadOnly = (loggedInTeam.status === "accepted");
    
    showDashboard();
    loadSingleTeamView(loggedInTeam);
  }
}

function handleOrganizerLogin() {
  currentRole = "organizer";
  isReadOnly = true; // Organizer can't edit players, only accept/reject teams
  showDashboard();
  loadOrganizerView();
}

function showDashboard() {
  loginView.style.display = "none";
  dashboardView.style.display = "block";
  
  document.getElementById("user-role-display").innerText = `Role: ${currentRole}`;

  // Show/Hide Organizer-only columns
  orgColumns.forEach(col => {
    col.style.display = (currentRole === 'organizer') ? '' : 'none';
  });
}

function handleLogout() {
  // Just go back to the login screen
  currentRole = null;
  loggedInTeam = null;
  isReadOnly = false;
  
  loginView.style.display = "block";
  dashboardView.style.display = "none";
  
  // Hide player table
  document.getElementById('team1').style.display = 'none';
  teamListBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  playerListBody.innerHTML = '';
  document.getElementById("teamName").value = "";
  document.getElementById("password").value = "";
}

// --- Data Loading (Real-time) ---

// For "Team" role - load only their team
function loadSingleTeamView(teamData) {
  teamListBody.innerHTML = ""; // Clear table
  // We need to get the player count, so we'll do a quick fetch
  const playerColRef = collection(db, "artifacts", appId, "public", "data", "teams", teamData.id, "players");
  onSnapshot(playerColRef, (playerSnapshot) => {
     renderTeamRow(teamData, teamData.id, playerSnapshot.size);
     
     // Auto-click the "View Players" for the logged-in team
     // We find the button we just rendered
     const viewBtn = teamListBody.querySelector('.view-btn');
     if(viewBtn) {
        viewBtn.click();
     }
  });
}

// For "Organizer" role - load all teams
function loadOrganizerView() {
  const teamColRef = collection(db, "artifacts", appId, "public", "data", "teams");
  
  onSnapshot(teamColRef, (snapshot) => {
    if (snapshot.empty) {
      teamListBody.innerHTML = '<tr><td colspan="7">No teams found.</td></tr>';
      return;
    }
    
    teamListBody.innerHTML = ""; // Clear existing table data
    let playerCountMap = {}; 

    snapshot.docs.forEach(doc => {
      const team = doc.data();
      const teamId = doc.id;

      // Start fetching player count for this team
      const playerColRef = collection(db, "artifacts", appId, "public", "data", "teams", teamId, "players");
      onSnapshot(playerColRef, (playerSnapshot) => {
        playerCountMap[teamId] = playerSnapshot.size;
        renderTeamRow(team, teamId, playerCountMap[teamId]);
      });
    });
  }, (error) => {
    console.error("Error loading teams:", error);
  });
}

function renderTeamRow(team, teamId, playerCount) {
  // Find existing row or create new one
  let row = document.getElementById(`team-row-${teamId}`);
  if (!row) {
    row = document.createElement("tr");
    row.id = `team-row-${teamId}`;
    teamListBody.appendChild(row);
  }
  
  // Set status color
  let statusClass = "text-muted";
  if (team.status === "accepted") statusClass = "text-success";
  if (team.status === "rejected") statusClass = "text-danger";

  // Organizer-only actions
  let orgActions = '-';
  if (currentRole === 'organizer') {
    orgActions = `
      <button class="btn btn-success btn-sm m-1" data-team-id="${teamId}" data-action="accepted">Accept</button>
      <button class="btn btn-danger btn-sm m-1" data-team-id="${teamId}" data-action="rejected">Reject</button>
      <button class="btn btn-secondary btn-sm m-1" data-team-id="${teamId}" data-action="pending">Pending</button>
    `;
  }

  row.innerHTML = `
    <td>${team.name}</td>
    <td>${team.coach}</td>
    <td>${playerCount !== undefined ? playerCount : '...'}</td>
    <td>${team.contact}</td>
    <td>${team.matchesAttended}</td>
    <td>${team.score}</td>
    <td class="org-column" style="display: ${currentRole === 'organizer' ? '' : 'none'};">
      <strong class="${statusClass}">${team.status}</strong>
    </td>
    <td class="org-column" style="display: ${currentRole === 'organizer' ? '' : 'none'};">
      ${orgActions}
    </td>
    <td>
      <button class="view-btn" data-team-id="${teamId}" data-team-name="${team.name}">View Players</button>
    </td>
  `;
}

// Load players for a specific team
let playerListenerUnsubscribe = null; 

function loadPlayers(teamId, teamName) {
  // If we're already listening to a player list, stop it
  if (playerListenerUnsubscribe) {
    playerListenerUnsubscribe();
  }

  // Show/Hide "Add Player" button based on Read-Only status
  document.getElementById("add-player-btn").style.display = isReadOnly ? 'none' : 'block';

  // Update the player table header
  document.getElementById("player-team-name").innerText = teamName;
  
  const playerColRef = collection(db, "artifacts", appId, "public", "data", "teams", teamId, "players");
  
  playerListenerUnsubscribe = onSnapshot(playerColRef, (snapshot) => {
    if (snapshot.empty) {
      playerListBody.innerHTML = '<tr><td colspan="5">No players found for this team.</td></tr>';
      return;
    }
    
    playerListBody.innerHTML = ""; // Clear
    snapshot.docs.forEach(doc => {
      const player = doc.data();
      const playerId = doc.id;
      
      const row = document.createElement("tr");
      
      // Conditionally render action buttons
      let actionButtons = '<td>Read-Only</td>';
      if (!isReadOnly) {
        actionButtons = `
        <td>
          <button class="btn-edit" data-player-id="${playerId}">Edit</button>
          <button class="btn-delete" data-player-id="${playerId}">Delete</button>
        </td>`;
      }
      
      row.innerHTML = `
        <td>${player.name}</td>
        <td>${player.age}</td>
        <td>${player.phone}</td>
        <td>${player.bmi}</td>
        ${actionButtons}
      `;
      playerListBody.appendChild(row);
    });
    
  }, (error) => {
    console.error("Error loading players:", error);
  });
}

// --- Event Handlers (CRUD) ---

function attachGlobalListeners() {
  // --- Login View Listeners ---
  document.getElementById("team-login-form").addEventListener("submit", handleTeamLogin);
  document.getElementById("organizer-login-btn").addEventListener("click", handleOrganizerLogin);
  
  // --- Dashboard View Listeners (using event delegation) ---
  document.body.addEventListener('click', async (e) => {
    // Handle "View Players" click
    if (e.target.classList.contains('view-btn')) {
      currentTeamId = e.target.dataset.teamId; // IMPORTANT: Set current team
      const teamName = e.target.dataset.teamName;
      
      // If team is logging in, isReadOnly is already set.
      // If organizer is logging in, they are always read-only for players.
      if (currentRole === 'organizer') {
        isReadOnly = true; 
      }
      
      loadPlayers(currentTeamId, teamName);
      
      // Show the player table
      const playerTableDiv = document.getElementById('team1');
      playerTableDiv.style.display = 'block';
      window.scrollTo({ top: playerTableDiv.offsetTop - 100, behavior: 'smooth' });
    }

    // Handle "Add Player" click
    if (e.target.classList.contains('btn-add')) {
      if(isReadOnly) return; // Double-check
      handleOpenAddForm();
    }

    // Handle "Edit" click
    if (e.target.classList.contains('btn-edit')) {
      if(isReadOnly) return; // Double-check
      handleOpenEditForm(e.target.dataset.playerId);
    }

    // Handle "Delete" click
    if (e.target.classList.contains('btn-delete')) {
      if(isReadOnly) return; // Double-check
      handleOpenDeleteConfirm(e.target.dataset.playerId);
    }
    
    // Handle Organizer "Accept/Reject/Pending" clicks
    if (e.target.dataset.action) {
        const teamId = e.target.dataset.teamId;
        const newStatus = e.target.dataset.action; // "accepted", "rejected", "pending"
        
        if (!teamId) return;

        const teamRef = doc(db, "artifacts", appId, "public", "data", "teams", teamId);
        try {
          await updateDoc(teamRef, { status: newStatus });
          console.log(`Team ${teamId} status updated to ${newStatus}`);
        } catch (error) {
          console.error("Error updating team status:", error);
        }
    }

    // Handle Logout
    if (e.target.classList.contains('logout-btn')) {
      handleLogout();
    }
  });

  // Handle Add/Edit Form Submission
  playerForm.addEventListener("submit", handlePlayerFormSubmit);

  // Handle Final Delete Confirmation
  document.getElementById("confirmDeleteBtn").addEventListener("click", handlePlayerDelete);
}

// 1. Open Add Form
function handleOpenAddForm() {
  if (!currentTeamId) return;
  if (isReadOnly) return; // Should not happen, but good to check

  editingPlayerId = null;
  document.getElementById("playerModalLabel").innerText = "Add Player";
  playerForm.reset();
  playerModal.show();
}

// 2. Open Edit Form
async function handleOpenEditForm(playerId) {
  if (isReadOnly) return;
  editingPlayerId = playerId;
  
  const docRef = doc(db, "artifacts", appId, "public", "data", "teams", currentTeamId, "players", playerId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const player = docSnap.data();
    document.getElementById("playerName").value = player.name;
    document.getElementById("playerAge").value = player.age;
    document.getElementById("playerPhone").value = player.phone;
    document.getElementById("playerBMI").value = player.bmi;
    
    document.getElementById("playerModalLabel").innerText = "Edit Player";
    playerModal.show();
  } else {
    console.error("Player not found.");
  }
}

// 3. Handle Add/Edit Form Save
async function handlePlayerFormSubmit(e) {
  e.preventDefault();
  if (!currentTeamId || isReadOnly) return;

  const playerData = {
    name: document.getElementById("playerName").value,
    age: Number(document.getElementById("playerAge").value),
    phone: document.getElementById("playerPhone").value,
    bmi: Number(document.getElementById("playerBMI").value)
  };

  try {
    if (editingPlayerId) {
      // Update existing player
      const docRef = doc(db, "artifacts", appId, "public", "data", "teams", currentTeamId, "players", editingPlayerId);
      await updateDoc(docRef, playerData);
    } else {
      // Add new player
      const colRef = collection(db, "artifacts", appId, "public", "data", "teams", currentTeamId, "players");
      await addDoc(colRef, playerData);
    }
    playerModal.hide();
    editingPlayerId = null;
  } catch (error) {
    console.error("Error saving player:", error);
  }
}

// 4. Open Delete Confirmation
function handleOpenDeleteConfirm(playerId) {
  if (isReadOnly) return;
  playerToDeleteId = playerId;
  deleteConfirmModal.show();
}

// 5. Handle Final Delete
async function handlePlayerDelete() {
  if (!playerToDeleteId || !currentTeamId || isReadOnly) return;
  
  try {
    const docRef = doc(db, "artifacts", appId, "public", "data", "teams", currentTeamId, "players", playerToDeleteId);
    await deleteDoc(docRef);
    deleteConfirmModal.hide();
    playerToDeleteId = null;
  } catch (error)
 {
    console.error("Error deleting player:", error);
  }
}

