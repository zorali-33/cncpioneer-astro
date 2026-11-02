document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector('[data-id="106ea122"][data-widget_type="image-carousel.default"]');
  const viewport = widget?.querySelector(".elementor-image-carousel-wrapper");
  const track = viewport?.querySelector(".swiper-wrapper");
  if (!widget || !viewport || !track) return;

  const originals = [...track.children];
  const count = originals.length;
  if (count < 2) return;

  const settings = JSON.parse(widget.dataset.settings || "{}");
  const speed = Number(settings.speed) || 500;
  const interval = Number(settings.autoplay_speed) || 5000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  widget.classList.add("mirror-logo-carousel");
  widget.style.setProperty("--mirror-desktop", Math.min(count, Number(settings.slides_to_show) || count));
  widget.style.setProperty("--mirror-tablet", Math.min(count, Number(settings.slides_to_show_tablet) || count));

  const loadLogo = (slide) => {
    const image = slide.querySelector("img[data-lazy-src]");
    if (image) image.src = image.dataset.lazySrc;
    if (image) image.draggable = false;
  };
  const clone = (slide) => {
    const copy = slide.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.removeAttribute("aria-label");
    loadLogo(copy);
    return copy;
  };
  originals.forEach(loadLogo);
  track.prepend(...originals.map(clone));
  track.append(...originals.map(clone));

  let index = count;
  let moving = false;
  let timer;
  const step = () => {
    const slide = track.querySelector(".swiper-slide");
    return slide.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  };
  const position = (animate) => {
    track.style.transitionDuration = animate && !reducedMotion.matches ? `${speed}ms` : "0ms";
    track.style.transform = `translate3d(${-index * step()}px, 0, 0)`;
  };
  const move = (direction) => {
    if (moving) return;
    moving = true;
    index += direction;
    position(true);
    window.setTimeout(() => {
      if (index >= count * 2) index -= count;
      if (index < count) index += count;
      position(false);
      track.getBoundingClientRect();
      moving = false;
    }, reducedMotion.matches ? 0 : speed);
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (settings.autoplay === "yes" && !reducedMotion.matches && !document.hidden) {
      timer = window.setInterval(() => move(1), interval);
    }
  };

  position(false);
  start();
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", start);
  window.addEventListener("resize", () => {
    index = count + ((index - count + count) % count);
    position(false);
  });

  let pointerStart = null;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = event.clientX;
  });
  viewport.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(distance) < 30) return;
    move(distance < 0 ? 1 : -1);
    start();
  });
  viewport.addEventListener("pointercancel", () => { pointerStart = null; });
  viewport.tabIndex = 0;
  viewport.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
    start();
  });
});
