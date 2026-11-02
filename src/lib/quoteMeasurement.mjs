// Integration adapter only: deliberately not loaded on public pages until consent,
// a transport and server-confirmed quote/upload receipts have been configured.
export function createQuoteMeasurement({ enabled = false, consent = () => false, transport } = {}) {
  const emitted = new Set();
  const allowedLocations = new Set(["hero", "article", "procurement", "footer", "form"]);
  const allowedCategories = new Set(["product", "material", "industry", "service", "blog", "other"]);
  function emit(event, context = {}, receipt) {
    if (!enabled || !consent() || typeof transport !== "function") return false;
    const allowed = ["quote_cta_click", "quote_form_start", "quote_submit_success", "drawing_upload_success"];
    if (!allowed.includes(event)) return false;
    const success = event.endsWith("_success");
    if (success && (receipt?.confirmed !== true || typeof receipt.id !== "string" || !receipt.id)) return false;
    // Accept only known site route shapes. Query strings, fragments and arbitrary
    // form fields never enter the payload. Receipt IDs are used locally only.
    const raw = String(context.page_path || "").split(/[?#]/, 1)[0];
    const page_path = /^(?:\/(?:blog|materials|industries|services|custom-cnc-parts)(?:\/[a-z0-9-]+)?\/?|\/cnc-machining-quote\/?|\/)$/i.test(raw) ? raw : "/";
    const payload = { page_path, form_id: "quote", cta_location: allowedLocations.has(context.cta_location) ? context.cta_location : "form", part_category: allowedCategories.has(context.part_category) ? context.part_category : "other" };
    const key = success ? `${event}:${receipt.id}` : event === "quote_form_start" ? `${event}:${page_path}` : null;
    if (key && emitted.has(key)) return false;
    if (key) emitted.add(key);
    try { transport(event, payload); return true; } catch { return false; }
  }
  return { emit };
}
