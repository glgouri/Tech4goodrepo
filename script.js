<script>
  // Define showPlayers globally for immediate access
  window.showPlayers = function() {
    console.log("showPlayers called"); // Debug log - remove in production
    const section = document.getElementById("playerSection");
    if (section) {
      section.style.display = "block";
    } else {
      console.error("playerSection element not found");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Get team name from URL parameter instead of localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const teamName = urlParams.get("team");

    if (!teamName) {
      alert("Please login first!");
      window.location.href = "login.html";
      return;
    }

    const allTeams = JSON.parse(localStorage.getItem("teams")) || [];
    const team = allTeams.find(t => t.teamName === teamName);

    if (!team) {
      alert("Team not found! Please login again.");
      window.location.href = "login.html";
      return;
    }

    // Display team details
    document.getElementById("teamStatus").textContent = `Team Status: ${team.status || "Pending"}`;

    const tbody = document.getElementById("teamDetailsBody");
    tbody.innerHTML = `
      <tr>
        <td>${team.teamName}</td>
        <td>${team.coachName}</td>
        <td>${team.players ? team.players.length : 0}</td>
        <td>${team.phone}</td>
        <td>${team.matches || 0}</td>
        <td>${team.score || 0}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="showPlayers()">View Players</button>
        </td>
      </tr>
    `;

    document.getElementById("teamNameHeader").textContent = `${team.teamName} - Player Details`;
    renderPlayers(team.players || []);

    // Render Players Table
    function renderPlayers(players) {
      const tbody = document.getElementById("playerTableBody");
      tbody.innerHTML = "";

      if (!players || players.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No players added yet.</td></tr>`;
        return;
      }

      players.forEach((p, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.phone}</td>
            <td>${p.bmi}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deletePlayer(${i})">Delete</button></td>
          </tr>
        `;
      });
    }

    // Add Player
    document.getElementById("playerForm").addEventListener("submit", e => {
      e.preventDefault();

      const name = playerName.value.trim();
      const age = playerAge.value.trim();
      const phone = playerPhone.value.trim();
      const bmi = playerBMI.value.trim();

      if (!name || !age || !phone || !bmi) return alert("All fields required!");

      const allTeams = JSON.parse(localStorage.getItem("teams")) || [];
      const teamIndex = allTeams.findIndex(t => t.teamName === teamName);
      if (teamIndex === -1) return;

      allTeams[teamIndex].players = allTeams[teamIndex].players || [];
      allTeams[teamIndex].players.push({ name, age, phone, bmi });

      localStorage.setItem("teams", JSON.stringify(allTeams));
      renderPlayers(allTeams[teamIndex].players);

      bootstrap.Modal.getInstance(document.getElementById("playerModal")).hide();
      e.target.reset();
    });

    // Delete Player (already global via window.deletePlayer)
    window.deletePlayer = function(i) {
      const allTeams = JSON.parse(localStorage.getItem("teams")) || [];
      const teamIndex = allTeams.findIndex(t => t.teamName === teamName);

      allTeams[teamIndex].players.splice(i, 1);
      localStorage.setItem("teams", JSON.stringify(allTeams));
      renderPlayers(allTeams[teamIndex].players);
    };

    // Logout
    window.logout = function() {
      alert("You have been logged out.");
      window.location.href = "login.html";
    };
  });

  function openForm() {
    const modal = new bootstrap.Modal(document.getElementById("playerModal"));
    modal.show();
  }
</script>