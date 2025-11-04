document.addEventListener("DOMContentLoaded", () => {
      
      
      let playerModalEl = document.getElementById("playerModal");
      let playerModal = new bootstrap.Modal(playerModalEl);
      
      let playerForm = document.getElementById("playerForm");
      
      let deleteConfirmModalEl = document.getElementById("deleteConfirmModal");
      let deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);
      
      let editingRow = null;
      let rowToDelete = null;
      let currentTeamTableBody = null; 
      window.showPlayers = function(teamId) {
        
        document.querySelectorAll('.player-table').forEach(div => div.style.display = 'none');
        
        
        const teamTableDiv = document.getElementById(teamId);
        if (teamTableDiv) {
          teamTableDiv.style.display = 'block';
      
          currentTeamTableBody = teamTableDiv.querySelector('tbody');
          
     
          window.scrollTo({ top: teamTableDiv.offsetTop - 100, behavior: 'smooth' });
        } else {
          console.error("Could not find team table with ID:", teamId);
          currentTeamTableBody = null; 
        }
      }

      
      window.openForm = function() {
        editingRow = null; 
        document.getElementById("playerModalLabel").innerText = "Add Player";
        playerForm.reset(); 
        playerModal.show();
      }

      window.editPlayer = function(btn) {
        editingRow = btn.closest("tr");
        const cells = editingRow.children;
        document.getElementById("playerName").value = cells[0].innerText;
        document.getElementById("playerAge").value = cells[1].innerText;
        document.getElementById("playerPhone").value = cells[2].innerText;
        document.getElementById("playerBMI").value = cells[3].innerText;
        document.getElementById("playerModalLabel").innerText = "Edit Player";
        playerModal.show();
      }

      
      window.deletePlayer = function(btn) {
        rowToDelete = btn.closest("tr"); 
        deleteConfirmModal.show(); 
      }
      
      
      window.logout = function() {
        console.log("Logout clicked");
     
        location.reload(); 
      }

      playerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("playerName").value;
        const age = document.getElementById("playerAge").value;
        const phone = document.getElementById("playerPhone").value;
        const bmi = document.getElementById("playerBMI").value;
        
        const newRowContent = `
          <td>${name}</td>
          <td>${age}</td>
          <td>${phone}</td>
          <td>${bmi}</td>
          <td>
            <button class="btn-edit" onclick="editPlayer(this)">Edit</button>
            <button class="btn-delete" onclick="deletePlayer(this)">Delete</button>
          </td>
        `;

        if (editingRow) {
          
          editingRow.innerHTML = newRowContent;
          editingRow = null;
        } else {
         
          if (currentTeamTableBody) {
             const newRow = document.createElement("tr");
             newRow.innerHTML = newRowContent;
             currentTeamTableBody.appendChild(newRow);
          } else {
             console.error("No team table selected to add player to.");
          }
        }
        
        playerModal.hide();
      });
      
     
      document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
        if (rowToDelete) {
          rowToDelete.remove(); 
          rowToDelete = null; 
        }
        deleteConfirmModal.hide();
      });

    });