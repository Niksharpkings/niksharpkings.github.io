document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[title]");

  elements.forEach(element => {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = element.getAttribute("title");
    document.body.appendChild(tooltip);

    // Remove the title attribute to prevent the default tooltip
    element.removeAttribute("title");

    let timeout;

    element.addEventListener("mouseenter", (e) => {
      timeout = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 40}px`; // 40px higher
        tooltip.classList.add("show");
      }, 500); // Change delay time here (500ms = 0.5 seconds)
    });

    element.addEventListener("mouseleave", () => {
      clearTimeout(timeout);
      tooltip.classList.remove("show");
    });
  });
});