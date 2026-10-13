export function initializeSidebar(document, window) {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.getElementById("toggle-sidebar");
  if (!sidebar || !toggleButton) {
    return;
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
    toggleButton.classList.remove("hidden");
  }

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggleButton.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(event.target) &&
      !toggleButton.contains(event.target)
    ) {
      closeSidebar();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}
