document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = document.getElementById("homeBtn");

  if (!homeBtn) return;

  const token = localStorage.getItem("token");

  if (token) {
    homeBtn.textContent = "Dashboard";
  } else {
    homeBtn.textContent = "Home";
  }

  homeBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (token) {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "index.html";
    }
  });
});
