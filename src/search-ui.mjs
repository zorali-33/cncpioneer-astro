export const searchDialogMarkup = `
<dialog class="site-search-dialog" id="site-search-dialog" aria-labelledby="site-search-heading">
  <div class="site-search-panel">
    <div class="site-search-heading-row">
      <div><p class="site-search-eyebrow">CNCPIONEER SEARCH</p><h2 id="site-search-heading">What are you looking for?</h2></div>
      <button class="site-search-close" type="button" data-search-close aria-label="Close search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <form class="site-search-form" action="/search" method="get" role="search">
      <label class="site-search-sr-only" for="site-search-input">Search parts, services, materials and industries</label>
      <svg class="site-search-input-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
      <input id="site-search-input" name="q" type="search" placeholder="Search parts, materials, services…" autocomplete="off" maxlength="120" enterkeyhint="search" spellcheck="false" aria-describedby="site-search-status" />
      <button class="site-search-clear" type="button" data-search-clear aria-label="Clear search" hidden>×</button>
      <button class="site-search-submit" type="submit">Search <span aria-hidden="true">→</span></button>
    </form>
    <div class="site-search-filters" data-search-filters aria-label="Filter search results">
      <button type="button" data-search-type="all" aria-pressed="true">All</button>
      <button type="button" data-search-type="parts" aria-pressed="false">Parts</button>
      <button type="button" data-search-type="services" aria-pressed="false">Services</button>
      <button type="button" data-search-type="materials" aria-pressed="false">Materials</button>
      <button type="button" data-search-type="industries" aria-pressed="false">Industries</button>
      <button type="button" data-search-type="resources" aria-pressed="false">Resources</button>
    </div>
    <div class="site-search-content" data-search-content>
      <p class="site-search-status" id="site-search-status" data-search-status role="status" aria-live="polite"></p>
      <div data-search-output></div>
    </div>
    <div class="site-search-footer">
      <span class="site-search-keyboard"><kbd>↑</kbd><kbd>↓</kbd> Navigate <span>·</span> <kbd>Esc</kbd> Close</span>
      <a href="/cnc-machining-quote">Have a drawing? Request a quote <span aria-hidden="true">→</span></a>
    </div>
  </div>
</dialog>`;

export const searchAssetsMarkup = '<link rel="stylesheet" href="/site-search.css"><script type="module" src="/site-search.js"></script>';
