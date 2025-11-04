Y - Ultimate Frisbee Tournament Management System

Overview
The Frisbee Tournament Management System is an online platform designed to simplify and streamline the management of frisbee tournaments.
The system enables both team participants and organizers to interact seamlessly — from registration to approval and participation management — through an intuitive web interface.

Key Features

For Teams

Register your team and player details.
Login with unique credentials.
View team approval status.
If rejected, edit or update team/player information and resubmit.
If accepted, the team details become read-only to maintain data integrity.

For Organizers

View all registered teams in one place.
Approve or reject team applications.
Monitor registration updates dynamically.

Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: supabase (Hosted Backend as a Service)
Database: supabase + local storage
Version Control: Git & GitHub

Project Structure

📦 Frisbee-Tournament-Management
├── homepage.html
├── index.html
├── login.html
├── organiser_dashboard.html
├── organiser_dashboard_script.js
├── organiser_dashboard_style.css
├── organiser_login.html
├── organiser_login_style.css
├── register.html
├── script.js
├── style.css
└── README.md

How It Works

1.Team Registration:
Teams fill in player and team details and submit a registration form.

2.Organizer Review:
Organizers log in to review all submitted teams.
They can accept or reject each team based on eligibility.

3.Team Dashboard:
If Accepted → Team can view their status as Accepted (no edits allowed).
If Rejected → Team can view their status as Rejected and update team details.

4.Data Storage:
The data (team info, login credentials, and statuses) is stored in a simple database for persistence.

Setup Instructions 
1. Clone the repository
If you want to work on it locally:
git clone https://github.com/yourusername/your-repo-name.git

2. Open the project
You can open the folder directly in VS Code or any code editor.

3. Run the project
Since this is a static front-end project:
Just open the main file (homepage.html) in your browser
OR
Use VS Code’s Live Server extension (recommended) to preview changes dynamically.

UI Pages

🏠 Homepage: Landing page for users and organizers
📝 Register: Team registration form
🔐 Login: For team login and status checking
🧑‍💼 Organizer Login: For admin access
📊 Organizer Dashboard: Approve/reject registered teams

Future Enhancements

Email notifications for acceptance/rejection
Automated match scheduling
Live scoreboard integration
Player performance analytics

Team Members
Name               	Role
Anila Roy           Frontend Developer
Gouri Lakshmi MS	  Backend Developer
Anjana Krishna V    UI/UX Designer
devanandana KP     	Database Manager

License

This project is open-source and available under the MIT License



