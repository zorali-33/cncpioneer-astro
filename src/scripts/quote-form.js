const maxBytes = 50 * 1024 * 1024;
const extensions = new Set(['pdf', 'step', 'stp', 'iges', 'igs', 'stl', 'dxf', 'dwg', 'zip']);

for (const form of document.querySelectorAll('[data-quote-form]')) {
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector('[data-submit-label]');
  const drawing = form.querySelector('input[name="drawing"]');
  const status = form.querySelector('[data-quote-status]');
  const show = (message, state) => { status.textContent = message; status.dataset.state = state; };
  drawing.addEventListener('change', () => drawing.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    const file = drawing.files[0];
    if (!file || file.size < 1 || file.size > maxBytes || !extensions.has(file.name.split('.').pop().toLowerCase())) {
      drawing.setCustomValidity('Attach a non-empty PDF, STEP, STP, IGES, IGS, STL, DXF, DWG or ZIP file, up to 50 MB.');
      drawing.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const body = new FormData(form);
    button.disabled = true;
    buttonLabel.textContent = 'Sending…';
    show('Sending your enquiry. Please keep this page open.', 'pending');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Your enquiry was not confirmed. Please email info@cncpioneer.com.');
      const result = await response.json();
      if (!response.ok || result.ok !== true || typeof result.id !== 'string' || !result.id) throw new Error(result.message || 'Your enquiry was not sent. Please email info@cncpioneer.com.');
      show(`Thank you. Your enquiry has been sent. Reference: ${result.id}`, 'success');
      form.reset();
    } catch (error) {
      show(error.name === 'AbortError' ? 'We could not confirm delivery. Please email info@cncpioneer.com before submitting again.' : error.message || 'Unable to send your enquiry. Please email info@cncpioneer.com.', 'error');
    } finally {
      clearTimeout(timer);
      button.disabled = false;
      buttonLabel.textContent = 'Send Quote Request';
      status.focus();
    }
  });
}
