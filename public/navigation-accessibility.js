// Preserve the existing menu design while making the checkbox-based blog menu
// operable with a keyboard. Native product headers keep their own click logic.
const state = document.querySelector('header #menu-state');
if (state) {
  const toggle = document.querySelector('header label[for="menu-state"]');
  const nav = document.querySelector('header .primary-nav');
  if (toggle && nav) {
    const submenuControls = [...nav.querySelectorAll('.has-submenu')].map((item,index) => {
      const link = item.querySelector(':scope > a');
      const existing = item.querySelector(':scope > [data-dropdown-trigger]');
      const submenu = item.querySelector(':scope > .submenu');
      if ((!link && !existing) || !submenu) return null;
      submenu.id ||= `legacy-submenu-${index}`;
      const button = existing || document.createElement('button');
      button.type = 'button';
      if (!existing) { button.className = 'legacy-submenu-toggle'; button.textContent = '▾'; }
      button.setAttribute('aria-controls', submenu.id);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', `Open ${(link || existing).textContent.trim()} menu`);
      if (!existing) item.insertBefore(button, submenu);
      const setOpen = open => {
        item.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
      };
      button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
      return {item,button,setOpen};
    }).filter(Boolean);
    nav.id ||= 'blog-primary-nav';
    toggle.setAttribute('role', 'button');
    toggle.tabIndex = 0;
    toggle.setAttribute('aria-controls', nav.id);
    const update = () => {
      toggle.setAttribute('aria-expanded', String(state.checked));
      toggle.setAttribute('aria-label', state.checked ? 'Close navigation menu' : 'Open navigation menu');
    };
    const close = () => { state.checked = false; submenuControls.forEach(control => control.setOpen(false)); update(); };
    update();
    state.addEventListener('change', () => { if (!state.checked) submenuControls.forEach(control => control.setOpen(false)); update(); });
    toggle.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault(); state.click();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.checked) {
        const open = submenuControls.find(control => control.item.contains(event.target) && control.button.getAttribute('aria-expanded') === 'true');
        if (open) { open.setOpen(false); open.button.focus(); }
        else { close(); toggle.focus(); }
      }
    });
    document.addEventListener('click', event => {
      if (event.target instanceof Element && !event.target.closest('header')) close();
    });
    window.matchMedia('(max-width: 1024px)').addEventListener('change', close);
  }
}
