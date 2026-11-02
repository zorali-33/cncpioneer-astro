document.addEventListener("DOMContentLoaded", () => {
  for (const widget of document.querySelectorAll('[data-widget_type="table-of-contents.default"]')) {
    const body = widget.querySelector(".elementor-toc__body");
    if (!body || !body.querySelector(".elementor-toc__spinner-container")) continue;

    let settings;
    try {
      settings = JSON.parse(widget.dataset.settings || "{}");
    } catch {
      continue;
    }

    const container = document.querySelector(settings.container || "#main-article-content");
    if (!container) continue;

    const tags = (settings.headings_by_tags || ["h2"]).filter((tag) => /^h[1-6]$/i.test(tag));
    const excluded = (settings.exclude_headings_by_selector || []).filter(Boolean);
    const headings = tags.length
      ? [...container.querySelectorAll(tags.join(","))].filter(
          (heading) => !excluded.some((selector) => heading.matches(selector)),
        )
      : [];

    body.replaceChildren();
    if (!headings.length) {
      body.textContent = settings.no_headings_message || "No headings were found on this page.";
    } else {
      const list = document.createElement(settings.marker_view === "numbers" ? "ol" : "ul");
      list.className = "elementor-toc__list-wrapper";

      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `elementor-toc__heading-anchor-${widget.dataset.id}-${index}`;

        const item = document.createElement("li");
        item.className = "elementor-toc__list-item";
        const wrapper = document.createElement("div");
        wrapper.className = "elementor-toc__list-item-text-wrapper";
        const link = document.createElement("a");
        link.className = "elementor-toc__list-item-text elementor-toc__top-level";
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim().replace(/\s+/g, " ");
        wrapper.append(link);
        item.append(wrapper);
        list.append(item);
      });
      body.append(list);
    }

    if (settings.minimize_box !== "yes") continue;
    const expand = widget.querySelector(".elementor-toc__toggle-button--expand");
    const collapse = widget.querySelector(".elementor-toc__toggle-button--collapse");
    const setCollapsed = (collapsed) => {
      widget.classList.toggle("elementor-toc--collapsed", collapsed);
      body.hidden = collapsed;
      for (const toggle of [expand, collapse]) {
        toggle?.setAttribute("aria-expanded", String(!collapsed));
      }
    };
    for (const [toggle, collapsed] of [[expand, false], [collapse, true]]) {
      if (!toggle) continue;
      toggle.addEventListener("click", () => setCollapsed(collapsed));
      toggle.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        setCollapsed(collapsed);
      });
    }
  }
});
