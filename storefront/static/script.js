// Toggle side panel visibility
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-panel");
    const sidePanel = document.getElementById("side-panel");

    toggleButton.addEventListener("click", () => {
      sidePanel.classList.toggle("collapsed");
    });
  });
