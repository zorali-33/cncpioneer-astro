document.addEventListener("DOMContentLoaded", () => {
  function onActivate(element, callback) {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      callback(event);
    });
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      callback(event);
    });
  }

  function setToggleItem(title, open) {
    const contentId = title.getAttribute("aria-controls");
    const content = contentId ? document.getElementById(contentId) : null;
    title.classList.toggle("elementor-active", open);
    title.setAttribute("aria-expanded", String(open));
    if (content) {
      content.classList.toggle("elementor-active", open);
      content.style.display = open ? "block" : "none";
    }
  }

  for (const widget of document.querySelectorAll(".elementor-widget-toggle, .elementor-widget-accordion")) {
    const singleOpen = widget.classList.contains("elementor-widget-accordion");

    for (const title of widget.querySelectorAll(".elementor-tab-title[role='button']")) {
      const contentId = title.getAttribute("aria-controls");
      const content = contentId ? document.getElementById(contentId) : null;
      title.tabIndex = 0;
      if (content && title.getAttribute("aria-expanded") !== "true") {
        content.style.display = "none";
      }

      onActivate(title, () => {
        const open = title.getAttribute("aria-expanded") !== "true";
        if (singleOpen && open) {
          for (const sibling of widget.querySelectorAll(".elementor-tab-title[role='button']")) {
            if (sibling !== title) setToggleItem(sibling, false);
          }
        }
        setToggleItem(title, open);
      });
    }
  }

  for (const tabs of document.querySelectorAll(".e-n-tabs")) {
    const titles = [...tabs.querySelectorAll(":scope > .e-n-tabs-heading > .e-n-tab-title[role='tab']")];
    const panels = [...tabs.querySelectorAll(":scope > .e-n-tabs-content > [role='tabpanel']")];
    if (!titles.length || !panels.length) continue;

    function activateTab(activeTitle) {
      for (const title of titles) {
        const selected = title === activeTitle;
        title.setAttribute("aria-selected", String(selected));
        title.tabIndex = selected ? 0 : -1;
      }

      for (const panel of panels) {
        const selected = panel.id === activeTitle.getAttribute("aria-controls");
        panel.classList.toggle("e-active", selected);
        panel.style.display = selected ? "" : "none";
      }
    }

    for (const title of titles) {
      onActivate(title, () => activateTab(title));
      title.addEventListener("keydown", (event) => {
        const currentIndex = titles.indexOf(title);
        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const next = titles[(currentIndex + direction + titles.length) % titles.length];
        activateTab(next);
        next.focus();
      });
    }

    activateTab(titles.find((title) => title.getAttribute("aria-selected") === "true") || titles[0]);
  }
});
