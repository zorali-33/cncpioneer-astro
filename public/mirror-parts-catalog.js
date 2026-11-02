(function () {
  const root = document.querySelector("[data-parts-catalog]");
  const dataNode = document.getElementById("parts-catalog-data");
  if (!root || !dataNode) return;

  let parts = [];
  try {
    parts = JSON.parse(dataNode.textContent || "[]");
  } catch (error) {
    return;
  }

  const results = root.querySelector("[data-parts-results]");
  const pagination = root.querySelector("[data-parts-pagination]");
  const count = root.querySelector("[data-parts-count]");
  const empty = root.querySelector("[data-parts-empty]");
  const search = root.querySelector("[data-parts-search]");
  const category = root.querySelector("[data-parts-category]");
  const perPage = Number.parseInt(root.dataset.perPage || "24", 10);
  const rootPath = root.dataset.root || "/custom-cnc-parts";
  const staticState = {
    results: results ? results.innerHTML : "",
    pagination: pagination ? pagination.innerHTML : "",
    count: count ? count.textContent : "",
  };

  if (!results || !pagination || !count || !search || !category) return;

  const onRootPage = normalizePath(window.location.pathname) === rootPath;
  const params = new URLSearchParams(window.location.search);
  search.value = params.get("q") || "";
  category.value = params.get("type") || "all";

  if (!onRootPage && (search.value || category.value !== "all")) {
    window.location.href = buildRootUrl(1, search.value, category.value);
    return;
  }

  if (onRootPage && (search.value || category.value !== "all" || params.has("p"))) {
    render(Number.parseInt(params.get("p") || "1", 10), false);
  }

  search.addEventListener("input", () => {
    if (!onRootPage) {
      window.location.href = buildRootUrl(1, search.value, category.value);
      return;
    }
    render(1, true);
  });

  category.addEventListener("change", () => {
    if (!onRootPage) {
      window.location.href = buildRootUrl(1, search.value, category.value);
      return;
    }
    render(1, true);
  });

  window.addEventListener("popstate", () => {
    const next = new URLSearchParams(window.location.search);
    search.value = next.get("q") || "";
    category.value = next.get("type") || "all";
    render(Number.parseInt(next.get("p") || "1", 10), false);
  });

  function render(page, updateUrl) {
    const query = normalize(search.value);
    const type = category.value || "all";

    if (!query && type === "all" && !new URLSearchParams(window.location.search).has("p")) {
      restoreStatic();
      return;
    }

    const matched = parts.filter((part) => {
      const matchesType = type === "all" || part.category === type;
      const matchesQuery = !query || String(part.searchText || "").includes(query);
      return matchesType && matchesQuery;
    });

    const totalPages = Math.max(1, Math.ceil(matched.length / perPage));
    const current = Math.min(Math.max(Number.isFinite(page) ? page : 1, 1), totalPages);
    const start = (current - 1) * perPage;
    const visible = matched.slice(start, start + perPage);

    results.innerHTML = visible.map(renderCard).join("");
    empty.hidden = matched.length !== 0;
    count.textContent = renderCount(matched.length ? start + 1 : 0, Math.min(start + perPage, matched.length), matched.length);
    pagination.innerHTML = renderPagination(current, totalPages);

    pagination.querySelectorAll("button[data-page]").forEach((button) => {
      button.addEventListener("click", () => render(Number.parseInt(button.dataset.page || "1", 10), true));
    });

    if (updateUrl) {
      window.history.replaceState({}, "", buildRootUrl(current, search.value, type));
    }
  }

  function restoreStatic() {
    results.innerHTML = staticState.results;
    pagination.innerHTML = staticState.pagination;
    count.textContent = staticState.count;
    empty.hidden = true;
    window.history.replaceState({}, "", rootPath);
  }

  function renderCard(part) {
    return `
        <a class="cncp-parts-card" href="${escapeAttr(part.href)}" data-category="${escapeAttr(part.category)}">
          <span class="cncp-parts-card-media">
            <img src="${escapeAttr(part.image)}" alt="${escapeAttr(part.title)}" loading="lazy" decoding="async">
          </span>
          <span class="cncp-parts-card-body">
            <span class="cncp-parts-card-type">${escapeHtml(part.categoryLabel)}</span>
            <span class="cncp-parts-card-title">${escapeHtml(part.title)}</span>
            <span class="cncp-parts-card-link">View part</span>
          </span>
        </a>`;
  }

  function renderPagination(page, totalPages) {
    if (totalPages <= 1) return "";

    const items = [];
    if (page > 1) items.push(`<button class="cncp-parts-page-link cncp-parts-page-link--control" type="button" data-page="${page - 1}">Prev</button>`);

    for (const item of paginationItems(page, totalPages)) {
      if (item === "...") {
        items.push(`<span class="cncp-parts-page-ellipsis" aria-hidden="true">...</span>`);
      } else if (item === page) {
        items.push(`<span class="cncp-parts-page-link is-current" aria-current="page">${item}</span>`);
      } else {
        items.push(`<button class="cncp-parts-page-link" type="button" data-page="${item}">${item}</button>`);
      }
    }

    if (page < totalPages) items.push(`<button class="cncp-parts-page-link cncp-parts-page-link--control" type="button" data-page="${page + 1}">Next</button>`);
    return items.join("");
  }

  function paginationItems(page, totalPages) {
    const set = new Set([1, totalPages, page, page - 1, page + 1]);
    if (page <= 3) {
      set.add(2);
      set.add(3);
    }
    if (page >= totalPages - 2) {
      set.add(totalPages - 1);
      set.add(totalPages - 2);
    }

    const sorted = Array.from(set).filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
    return sorted.reduce((items, item) => {
      const previous = items[items.length - 1];
      if (typeof previous === "number" && item - previous > 1) items.push("...");
      items.push(item);
      return items;
    }, []);
  }

  function buildRootUrl(page, query, type) {
    const next = new URLSearchParams();
    const normalizedQuery = String(query || "").trim();
    if (normalizedQuery) next.set("q", normalizedQuery);
    if (type && type !== "all") next.set("type", type);
    if (page > 1) next.set("p", String(page));
    const suffix = next.toString();
    return suffix ? `${rootPath}?${suffix}` : rootPath;
  }

  function renderCount(start, end, total) {
    return total ? `Showing ${start}-${end} of ${total} CNC parts` : "0 CNC parts";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function normalizePath(pathname) {
    const normalized = pathname.replace(/\/+$/, "");
    return normalized || "/";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
