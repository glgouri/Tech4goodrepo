document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error || !data.user) {
      alert("Login failed: " + (error?.message || "Invalid credentials."));
    } else {
      alert("Login successful!");
      window.location.href = "organiser_dashboard.html";
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Something went wrong. Please try again.");
  }
});
