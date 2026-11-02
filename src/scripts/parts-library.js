const root = document.querySelector("[data-parts-library]");
if (root) {
  const parts = JSON.parse(root.querySelector("#pl-catalog-data").textContent);
  const perPage = Number(root.dataset.perPage);
  const search = root.querySelector("[data-pl-search]");
  const material = root.querySelector("[data-pl-material]");
  const sort = root.querySelector("[data-pl-sort]");
  const results = root.querySelector("[data-pl-results]");
  const count = root.querySelector("[data-pl-count]");
  const empty = root.querySelector("[data-pl-empty]");
  const clear = root.querySelector("[data-pl-clear]");
  const pagination = root.querySelector("[data-pl-pagination]");
  const heading = root.querySelector("[data-pl-heading]");
  const defaultHeading = heading.textContent;
  const categoryLabels = new Map(parts.map(part => [part.category, part.categoryLabel]));
  const categories = [...root.querySelectorAll("[data-pl-category]")];
  const categoryIds = new Set(categories.map(button => button.dataset.plCategory));
  const materialValues = new Set([...material.options].map(option => option.value));
  const normalize = value => value.toLowerCase().replace(/aluminium/g, "aluminum").replace(/[^a-z0-9]+/g, " ").trim();
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const state = { q: "", category: "all", material: "all", sort: "featured", page: Number(root.dataset.page) };
  const active = () => Boolean(state.q || state.category !== "all" || state.material !== "all" || state.sort !== "featured");

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get("q") || "";
    state.category = categoryIds.has(params.get("type")) ? params.get("type") : "all";
    state.material = materialValues.has(params.get("material")) ? params.get("material") : "all";
    state.sort = ["az", "za"].includes(params.get("sort")) ? params.get("sort") : "featured";
    const pathPage = Number(window.location.pathname.match(/\/page\/(\d+)/)?.[1] || 1);
    state.page = Math.max(1, Number.parseInt(params.get("p"), 10) || (active() ? 1 : pathPage));
    search.value = state.q;
    material.value = state.material;
    sort.value = state.sort;
  }
  function hrefFor(page) {
    if (!active()) return page === 1 ? "/custom-cnc-parts" : `/custom-cnc-parts/page/${page}`;
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.category !== "all") params.set("type", state.category);
    if (state.material !== "all") params.set("material", state.material);
    if (state.sort !== "featured") params.set("sort", state.sort);
    if (page > 1) params.set("p", String(page));
    return `/custom-cnc-parts?${params}`;
  }
  function card(part) {
    return `<article class="pl-card"><a class="pl-card-main" href="${escape(part.href)}"><div class="pl-card-media"><img src="${escape(part.image)}" alt="${escape(part.title)}" width="600" height="450" loading="lazy" decoding="async"><span class="pl-card-arrow" aria-hidden="true">↗</span></div><div class="pl-card-content"><p class="pl-card-category">${escape(part.categoryLabel)}</p><h3>${escape(part.title)}</h3><dl><div><dt>Material</dt><dd>${escape(part.material)}</dd></div><div><dt>Process</dt><dd>${escape(part.process)}</dd></div></dl><span class="pl-card-link">Explore component <span aria-hidden="true">→</span></span></div></a></article>`;
  }
  function render(updateUrl = false, push = false) {
    heading.textContent = categoryLabels.get(state.category) || defaultHeading;
    const terms = normalize(state.q).split(" ").filter(Boolean);
    const candidates = parts.filter(part => terms.every(term => part.searchText.includes(term)) && (state.material === "all" || part.material === state.material));
    const filtered = candidates.filter(part => state.category === "all" || part.category === state.category);
    if (state.sort !== "featured") filtered.sort((a, b) => (state.sort === "za" ? -1 : 1) * a.title.localeCompare(b.title, "en"));
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * perPage;
    results.innerHTML = filtered.slice(start, start + perPage).map(card).join("");
    count.textContent = filtered.length ? `Showing ${start + 1}–${Math.min(start + perPage, filtered.length)} of ${filtered.length} parts` : "0 matching parts";
    empty.hidden = filtered.length > 0;
    results.hidden = filtered.length === 0;
    clear.hidden = !active();
    root.querySelector("[data-pl-note]").hidden = active();
    for (const button of categories) {
      const id = button.dataset.plCategory;
      const selected = id === state.category;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.querySelector("[data-pl-category-count]").textContent = id === "all" ? candidates.length : candidates.filter(part => part.category === id).length;
    }
    const links = [];
    const link = (page, label, rel = "") => `<a href="${escape(hrefFor(page))}" data-pl-page="${page}" ${rel ? `rel="${rel}"` : `aria-label="Page ${page}"`}>${label}</a>`;
    if (state.page > 1) links.push(link(state.page - 1, "← <span>Previous</span>", "prev"));
    for (let page = 1; page <= pages; page++) links.push(page === state.page ? `<span class="is-current" aria-current="page">${page}</span>` : link(page, page));
    if (state.page < pages) links.push(link(state.page + 1, "<span>Next</span> →", "next"));
    pagination.innerHTML = pages > 1 ? links.join("") : "";
    pagination.hidden = pages <= 1;
    if (updateUrl) window.history[push ? "pushState" : "replaceState"]({}, "", hrefFor(state.page));
  }
  function change() {
    state.q = search.value.trim();
    state.material = material.value;
    state.sort = sort.value;
    state.page = 1;
    render(true);
  }
  let inputTimer;
  search.addEventListener("input", () => { clearTimeout(inputTimer); inputTimer = setTimeout(change, 160); });
  material.addEventListener("change", () => { clearTimeout(inputTimer); change(); });
  sort.addEventListener("change", () => { clearTimeout(inputTimer); change(); });
  root.querySelector("[data-pl-tools]").addEventListener("submit", event => { event.preventDefault(); clearTimeout(inputTimer); change(); });
  root.querySelector("[data-pl-categories]").addEventListener("click", event => {
    const button = event.target.closest("[data-pl-category]");
    if (!button) return;
    clearTimeout(inputTimer);
    state.category = button.dataset.plCategory;
    change();
  });
  function reset() {
    clearTimeout(inputTimer);
    search.value = ""; material.value = "all"; sort.value = "featured";
    state.category = "all";
    change();
  }
  clear.addEventListener("click", reset);
  root.querySelector("[data-pl-reset]").addEventListener("click", reset);
  root.querySelector("[data-pl-explore]").addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.querySelector("#parts-catalog").scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  });
  pagination.addEventListener("click", event => {
    const link = event.target.closest("[data-pl-page]");
    // Unfiltered links remain normal, crawlable links to the static pages.
    if (!link || !active() || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    state.page = Number(link.dataset.plPage);
    render(true, true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.querySelector("#parts-catalog").scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    root.querySelector("[data-pl-count]").setAttribute("tabindex", "-1");
    root.querySelector("[data-pl-count]").focus({ preventScroll: true });
  });
  window.addEventListener("popstate", () => { readUrl(); render(); });
  readUrl();
  // Keep server-rendered cards and their in-flight image requests on first load.
  if (active() || new URLSearchParams(window.location.search).has("p")) render();
  else pagination.querySelectorAll("a").forEach(link => {
    const page = Number(link.getAttribute("href").match(/\/page\/(\d+)/)?.[1] || 1);
    link.dataset.plPage = String(page);
  });
}
