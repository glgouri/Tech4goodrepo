Y - Ultimate Frisbee Tournament Management System

Overview
The Frisbee Tournament Management System is an online platform designed to simplify and streamline the management of frisbee tournaments.
The system enables both team participants and organizers to interact seamlessly — from registration to approval and participation management — through an intuitive web interface.

Key Features
<br>
<br>
For Teams
<br>
<ul>
  <li>Register your team and player details.</li>
  <li>Login with unique credentials.</li>
  <li>View team approval status.</li>
  <li>If rejected, edit or update team/player information and resubmit.</li>
  <li>If accepted, the team details become read-only to maintain data integrity.</li>
  <br>
For Organizers
<br>
<ul>
  <li>View all registered teams in one place.</li>
  <li>Monitor registration updates dynamically.</li>
</ul>
<br>
Tech Stack
<br>
<ul>
  <li>Frontend: HTML, CSS, JavaScript</li>
  <li>Backend: supabase (Hosted Backend as a Service)</li>
  <li>Database: supabase + local storage</li>
  <li>Version Control: Git & GitHub</li>
</ul>
<br>
Project Structure
<br>
<ul>
  <li>homepage.html</li>
  <li>index.html</li>
  <li>login.html</li>
  <li>organiser_dashboard.html</li>
  <li>organiser_dashboard_script.js</li>
  <li>organiser_dashboard_style.css</li>
  <li>organiser_login.html</li>
  <li>organiser_login_style.css</li>
  <li>register.html</li>
  <li>script.js</li>
  <li>style.css</li>
  <li>README.md</li>
</ul>
<br>
How It Works
<br>
1.Team Registration:
Teams fill in player and team details and submit a registration form.
<br>
2.Organizer Review:
Organizers log in to review all submitted teams.
They can accept or reject each team based on eligibility.
<br>
3.Team Dashboard:
If Accepted → Team can view their status as Accepted (no edits allowed).
If Rejected → Team can view their status as Rejected and update team details.
<br>
4.Data Storage:
The data (team info, login credentials, and statuses) is stored in a simple database for persistence.
<br>
Setup Instructions
<br> 
1. Clone the repository
If you want to work on it locally:
git clone https://github.com/glgouri/Tech4goodrepo/.git

2. Open the project
You can open the folder directly in VS Code or any code editor.

3. Run the project
Since this is a static front-end project:
Just open the main file (homepage.html) in your browser
OR
Use VS Code’s Live Server extension (recommended) to preview changes dynamically.

UI Pages
<br>
<ul>
  <li>🏠 Homepage: Landing page for users and organizers</li>
  <li>📝 Register: Team registration form</li>
  <li>🔐 Login: For team login and status checking</li>
  <li>🧑‍💼 Organizer Login: For admin access</li>
  <li>📊 Organizer Dashboard: Approve/reject registered teams</li>
</ul>
<br>
<br>
<br>
Future Enhancements
<br>
<li>Email notifications for acceptance/rejection</li>
<li>Automated match scheduling</li>
<li>Live scoreboard integration</li>
<li>Player performance analytics</li>

Team Members
<br>
<ul>Anila Roy(Frontend Developer)</ul>
<ul>Gouri Lakshmi M S (Backend Developer)</ul>  
<ul>Anjana Krishna V (UI/UX Designer)</ul>      
<ul>devanandana KP (Database Manager)</ul>  

License

This project is open-source and available under the MIT License



