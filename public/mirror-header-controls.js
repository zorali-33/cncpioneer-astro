document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header.elementor-location-header");
  if (!header) return;

  function onActivate(element, callback) {
    element.addEventListener("click", callback);
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      callback(event);
    });
  }

  for (const widget of header.querySelectorAll(".elementor-widget-nav-menu")) {
    const toggle = widget.querySelector(".elementor-menu-toggle");
    const dropdown = widget.querySelector("nav.elementor-nav-menu--dropdown");
    if (!toggle || !dropdown) continue;

    function alignDropdown() {
      const widgetBounds = widget.getBoundingClientRect();
      const headerBounds = header.getBoundingClientRect();
      dropdown.style.left = `${-widgetBounds.left}px`;
      dropdown.style.top = `${headerBounds.bottom - widgetBounds.top}px`;
      dropdown.style.width = `${document.documentElement.clientWidth}px`;
    }

    function setOpen(open) {
      if (open) alignDropdown();
      toggle.classList.toggle("elementor-active", open);
      toggle.setAttribute("aria-expanded", String(open));
      dropdown.setAttribute("aria-hidden", String(!open));
      dropdown.style.maxHeight = open ? `${dropdown.scrollHeight}px` : "0px";
      dropdown.style.transform = open ? "scaleY(1)" : "scaleY(0)";
      for (const link of dropdown.querySelectorAll("a")) link.tabIndex = open ? 0 : -1;
    }

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (event.target instanceof Node && !header.contains(event.target)) setOpen(false);
    });
    toggle.addEventListener("click", () => {
      const wasOpen = isOpen();
      setTimeout(() => {
        if (isOpen() === wasOpen) setOpen(!wasOpen);
      }, 0);
    }, true);
    toggle.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle.click();
    });
    window.addEventListener("resize", () => {
      if (toggle.getAttribute("aria-expanded") === "true") alignDropdown();
    });

    for (const arrow of dropdown.querySelectorAll(".menu-item-has-children > a > .sub-arrow")) {
      arrow.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = arrow.closest(".menu-item-has-children");
        const submenu = item?.querySelector(":scope > .sub-menu");
        if (!submenu) return;
        const open = !item.classList.contains("elementor-active");
        item.classList.toggle("elementor-active", open);
        submenu.style.display = open ? "block" : "none";
        dropdown.style.maxHeight = `${dropdown.scrollHeight}px`;
      });
    }
  }

  for (const item of header.querySelectorAll(".elementor-nav-menu--main .menu-item-has-children")) {
    const submenu = item.querySelector(":scope > .sub-menu");
    if (!submenu) continue;
    let closeTimer;
    const open = () => {
      clearTimeout(closeTimer);
      submenu.style.display = "block";
    };
    const close = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        submenu.style.display = "";
      }, 180);
    };
    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", close);
    item.addEventListener("focusin", open);
    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) close();
    });
  }

  for (const widget of header.querySelectorAll(".elementor-search-form--skin-full_screen")) {
    const toggle = widget.querySelector(".elementor-search-form__toggle");
    const container = widget.querySelector(".elementor-search-form__container");
    const close = widget.querySelector(".dialog-lightbox-close-button");
    if (!toggle || !container || !close) continue;

    const setOpen = (open) => {
      container.classList.toggle("elementor-search-form--full-screen", open);
      if (open) container.querySelector("input")?.focus();
      else toggle.focus();
    };
    onActivate(toggle, () => setOpen(true));
    onActivate(close, () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && container.classList.contains("elementor-search-form--full-screen")) {
        setOpen(false);
      }
    });
  }
});
