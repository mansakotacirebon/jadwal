const THEME_KEY = "theme-preference";

export function initializeTheme(document, window) {
  const button = document.getElementById("toggle-theme");
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      button.textContent = "☀️";
      button.title = "Switch to Dark Mode";
    } else {
      root.removeAttribute("data-theme");
      button.textContent = "🌙";
      button.title = "Switch to Light Mode";
    }
    window.sessionStorage.setItem(THEME_KEY, theme);
  }

  function clearAppStorage() {
    try {
      window.sessionStorage.removeItem(THEME_KEY);

      if (window.caches && window.caches.keys) {
        window.caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => window.caches.delete(cacheName));
        });
      }
    } catch (error) {
      console.warn("Tidak dapat membersihkan cache secara penuh:", error);
    }
  }

  window.addEventListener("beforeunload", clearAppStorage);
  window.addEventListener("unload", clearAppStorage);

  const savedTheme = window.sessionStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (button) {
    button.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || "dark";
      applyTheme(currentTheme === "light" ? "dark" : "light");
    });
  }
}
