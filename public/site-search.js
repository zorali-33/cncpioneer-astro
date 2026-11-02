import { prepareSearchIndex, searchPages, searchTypes, normalizeSearch } from "/site-search-core.js";

let indexPromise;
function loadIndex() {
  if (!indexPromise) indexPromise = fetch("/search-index.json")
    .then(response => { if (!response.ok) throw new Error("Search unavailable"); return response.json(); })
    .then(pages => { if (!Array.isArray(pages)) throw new Error("Invalid search index"); return prepareSearchIndex(pages); })
    .catch(error => { indexPromise = null; throw error; });
  return indexPromise;
}

const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

function searchHref(query, type = "all") {
  const params = new URLSearchParams({ q: query });
  if (type !== "all") params.set("type", type);
  return `/search?${params}`;
}

function resultLink(page) {
  const link = node("a", "site-search-result");
  link.href = page.href;
  const copy = node("div", "site-search-result-copy");
  copy.append(node("span", "site-search-result-type", searchTypes[page.type]), node("span", "site-search-result-title", page.title));
  if (page.description) copy.append(node("span", "site-search-result-description", page.description));
  const arrow = node("span", "site-search-result-arrow", "↗");
  arrow.setAttribute("aria-hidden", "true");
  link.append(copy, arrow);
  return link;
}

function setupSearch(root, isPage = false) {
  const input = root.querySelector('input[name="q"]');
  const form = root.querySelector("form");
  const output = root.querySelector("[data-search-output]");
  const status = root.querySelector("[data-search-status]");
  const clear = root.querySelector("[data-search-clear]");
  const filterButtons = [...root.querySelectorAll("[data-search-type]")];
  let type = "all";
  let limit = isPage ? 20 : 6;
  let revision = 0;
  let timer;

  function updateFilters() {
    for (const button of filterButtons) button.setAttribute("aria-pressed", String(button.dataset.searchType === type));
  }

  function updateUrl() {
    if (!isPage) return;
    const query = input.value.trim();
    const href = query ? searchHref(query, type) : "/search";
    if (`${location.pathname}${location.search}` !== href) history.replaceState(null, "", href);
  }

  function showSuggestions() {
    const suggestions = node("div", "site-search-suggestions");
    suggestions.append(node("h3", "site-search-small-heading", "Popular searches"));
    const chips = node("div", "site-search-chips");
    for (const term of ["Titanium nuts", "Aerospace fasteners", "Stainless steel", "Swiss machining"]) {
      const button = node("button", "", term);
      button.type = "button";
      button.addEventListener("click", () => { input.value = term; type = "all"; limit = isPage ? 20 : 6; input.focus(); render(); });
      chips.append(button);
    }
    suggestions.append(chips, node("h3", "site-search-small-heading", "Quick links"));
    const links = node("div", "site-search-quick-links");
    for (const [title, href] of [["Browse CNC parts", "/custom-cnc-parts"], ["CNC turning & milling", "/services/cnc-turning-and-milling"], ["Explore materials", "/materials"], ["Semiconductor machining", "/industries/semiconductor"]]) {
      const link = node("a", "", title);
      link.href = href;
      const arrow = node("span", "", "→"); arrow.setAttribute("aria-hidden", "true"); link.append(arrow);
      links.append(link);
    }
    suggestions.append(links);
    output.replaceChildren(suggestions);
  }

  async function render() {
    clearTimeout(timer);
    const current = ++revision;
    const query = input.value.trim();
    clear.hidden = !query;
    updateFilters();
    updateUrl();
    if (normalizeSearch(query).length < 2) {
      root.setAttribute("aria-busy", "false");
      status.textContent = query ? "Enter at least 2 letters or numbers to search." : "Search parts, services, materials, industries and resources.";
      showSuggestions();
      return;
    }
    status.textContent = "Searching…";
    root.setAttribute("aria-busy", "true");
    try {
      const index = await loadIndex();
      if (current !== revision) return;
      const { items, total } = searchPages(index, query, type);
      const shown = items.slice(0, limit);
      status.textContent = `${total} result${total === 1 ? "" : "s"} for “${query}”${type !== "all" ? ` in ${searchTypes[type]}` : ""}${total > limit ? ` · Showing ${shown.length}` : ""}`;
      const fragment = document.createDocumentFragment();
      if (!total) {
        const empty = node("div", "site-search-empty");
        empty.append(node("h3", "", "No matching pages yet."), node("p", "", "Try a material or part name such as titanium, connector or bushing. You can also send us your drawing."));
        if (type !== "all") {
          const reset = node("button", "site-search-text-button", "Search all categories →"); reset.type = "button";
          reset.addEventListener("click", () => { type = "all"; render(); }); empty.append(reset);
        }
        const link = node("a", "site-search-text-button", "Request a custom part quote →"); link.href = "/cnc-machining-quote"; empty.append(link);
        fragment.append(empty);
      } else {
        const list = node("div", "site-search-results");
        for (const page of shown) list.append(resultLink(page));
        fragment.append(list);
        if (!isPage) {
          const all = node("a", "site-search-all-results", `View all ${total} result${total === 1 ? "" : "s"} →`);
          all.href = searchHref(query, type); fragment.append(all);
        } else if (total > limit) {
          const more = node("button", "site-search-all-results", "Show more results ↓"); more.type = "button";
          more.addEventListener("click", async () => { const previous = limit; limit += 20; await render(); output.querySelectorAll(".site-search-result")[previous]?.focus(); });
          fragment.append(more);
        }
      }
      output.replaceChildren(fragment);
    } catch {
      if (current !== revision) return;
      status.textContent = "Search is temporarily unavailable.";
      const error = node("div", "site-search-empty");
      error.append(node("p", "", "Please try again, or browse our parts library."));
      const retry = node("button", "site-search-text-button", "Try again →"); retry.type = "button"; retry.addEventListener("click", render);
      const browse = node("a", "site-search-text-button", "Browse CNC parts →"); browse.href = "/custom-cnc-parts";
      error.append(retry, browse); output.replaceChildren(error);
    } finally {
      if (current === revision) root.setAttribute("aria-busy", "false");
    }
  }

  input.addEventListener("input", () => { revision++; limit = isPage ? 20 : 6; clear.hidden = !input.value; clearTimeout(timer); timer = setTimeout(render, 120); });
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") { const first = output.querySelector(".site-search-result"); if (first) { event.preventDefault(); first.focus(); } }
  });
  output.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    const links = [...output.querySelectorAll(".site-search-result")];
    const index = links.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    if (event.key === "ArrowUp" && index === 0) input.focus();
    else links[Math.max(0, Math.min(links.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))]?.focus();
  });
  clear.addEventListener("click", () => { input.value = ""; input.focus(); render(); });
  filterButtons.forEach(button => button.addEventListener("click", () => { type = button.dataset.searchType; limit = isPage ? 20 : 6; render(); }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (normalizeSearch(input.value).length < 2) { input.focus(); render(); return; }
    if (isPage) render(); else location.assign(searchHref(input.value.trim(), type));
  });
  return { input, render, setQuery(query, category = "all") { input.value = query.slice(0, 120); type = Object.hasOwn(searchTypes, category) ? category : "all"; limit = isPage ? 20 : 6; render(); } };
}

const dialog = document.querySelector("#site-search-dialog");
if (dialog && !dialog.dataset.initialized) {
  dialog.dataset.initialized = "true";
  const search = setupSearch(dialog);
  let opener;
  const triggers = '[data-site-search-open], header [aria-label="Search"], [data-elementor-type="header"] .elementor-search-form__toggle';
  for (const legacy of document.querySelectorAll('[data-elementor-type="header"] .elementor-search-form__container')) { legacy.hidden = true; legacy.inert = true; }
  const setExpanded = value => document.querySelectorAll(triggers).forEach(trigger => trigger.setAttribute("aria-expanded", String(value)));
  document.querySelectorAll(triggers).forEach(trigger => { trigger.setAttribute("aria-haspopup", "dialog"); trigger.setAttribute("aria-controls", dialog.id); trigger.setAttribute("aria-expanded", "false"); });
  const open = (trigger, query) => {
    if (dialog.open) return;
    opener = trigger || document.activeElement;
    // Close the mobile navigation before placing focus in the modal.
    const menu = document.querySelector('[data-native-header] .menu-toggle[aria-expanded="true"]');
    menu?.click();
    dialog.showModal();
    document.documentElement.classList.add("site-search-open");
    setExpanded(true);
    if (query !== undefined) search.setQuery(query); else search.render();
    search.input.focus({ preventScroll: true });
    search.input.select();
  };
  document.addEventListener("click", event => {
    const trigger = event.target instanceof Element ? event.target.closest(triggers) : null;
    if (!trigger || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); event.stopImmediatePropagation(); open(trigger);
  }, true);
  dialog.querySelector("[data-search-close]").addEventListener("click", () => dialog.close());
  // A search input normally clears itself on Escape; the modal should close first.
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.isComposing) { event.preventDefault(); event.stopPropagation(); dialog.close(); }
    if (event.key === "Tab") {
      const focusable = [...dialog.querySelectorAll('a[href], button, input, [tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, true);
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { document.documentElement.classList.remove("site-search-open"); setExpanded(false); if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  document.addEventListener("keydown", event => {
    const trigger = event.target instanceof Element ? event.target.closest(triggers) : null;
    if (trigger && ["Enter", " "].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); open(trigger); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
  }, true);
  // Old WordPress search URLs remain useful during the static-site migration.
  const legacyQuery = new URLSearchParams(location.search).get("s");
  if (location.pathname === "/" && legacyQuery !== null) open(null, legacyQuery);
}

const page = document.querySelector("[data-search-page]");
if (page) {
  const search = setupSearch(page, true);
  const restore = () => { const params = new URLSearchParams(location.search); search.setQuery(params.get("q") || "", params.get("type") || "all"); };
  restore();
  window.addEventListener("popstate", restore);
}
