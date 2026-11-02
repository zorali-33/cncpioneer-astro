document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector('[data-id="dcbcd94"][data-widget_type="media-carousel.default"]');
  const viewport = widget?.querySelector(".elementor-main-swiper");
  const track = viewport?.querySelector(".swiper-wrapper");
  const pagination = viewport?.querySelector(".swiper-pagination");
  if (!widget || !viewport || !track || !pagination) return;

  const originals = [...track.children];
  const count = originals.length;
  if (count < 2) return;

  const settings = JSON.parse(widget.dataset.settings || "{}");
  const speed = Number(settings.speed) || 500;
  const interval = Number(settings.autoplay_speed) || 5000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  widget.classList.add("mirror-factory-carousel");

  const loadImage = (slide) => {
    const image = slide.querySelector(".elementor-carousel-image[data-bg]");
    if (image) image.style.backgroundImage = `url("${image.dataset.bg}")`;
  };
  originals.forEach(loadImage);
  const clone = (slide) => {
    const copy = slide.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    loadImage(copy);
    return copy;
  };
  const cloneCount = Math.min(3, count);
  track.prepend(...originals.slice(-cloneCount).map(clone));
  track.append(...originals.slice(0, cloneCount).map(clone));

  const dots = originals.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "swiper-pagination-bullet";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    pagination.append(dot);
    return dot;
  });
  pagination.classList.add("swiper-pagination-bullets", "swiper-pagination-horizontal");

  let active = 0;
  let positionIndex = cloneCount;
  let moving = false;
  let hovered = false;
  let interacted = false;
  let timer;
  const step = () => track.firstElementChild.getBoundingClientRect().width
    + parseFloat(getComputedStyle(track).columnGap);
  const position = (animate) => {
    track.style.transitionDuration = animate && !reducedMotion.matches ? `${speed}ms` : "0ms";
    track.style.transform = `translate3d(${-positionIndex * step()}px, 0, 0)`;
  };
  const update = () => {
    dots.forEach((dot, index) => {
      const selected = index === active;
      dot.classList.toggle("swiper-pagination-bullet-active", selected);
      if (selected) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
      originals[index].classList.toggle("swiper-slide-active", selected);
    });
  };
  const go = (next, direction = 0) => {
    if (moving) return;
    moving = true;
    active = (next + count) % count;
    positionIndex = direction === 1 && active === 0 ? count + cloneCount
      : direction === -1 && active === count - 1 ? cloneCount - 1
        : active + cloneCount;
    update();
    position(true);
    window.setTimeout(() => {
      positionIndex = active + cloneCount;
      position(false);
      track.getBoundingClientRect();
      moving = false;
    }, reducedMotion.matches ? 0 : speed);
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (settings.autoplay === "yes" && !hovered && !interacted && !reducedMotion.matches && !document.hidden) {
      timer = window.setInterval(() => go(active + 1, 1), interval);
    }
  };
  const manual = (next, direction) => {
    interacted = settings.pause_on_interaction === "yes";
    stop();
    go(next, direction);
    if (!interacted) start();
  };

  position(false);
  update();
  start();
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", start);
  window.addEventListener("resize", () => position(false));

  if (settings.pause_on_hover === "yes") {
    viewport.addEventListener("mouseenter", () => { hovered = true; stop(); });
    viewport.addEventListener("mouseleave", () => { hovered = false; start(); });
  }
  const bindButton = (button, direction) => {
    if (!button) return;
    const activate = () => manual(active + direction, direction);
    button.addEventListener("click", activate);
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  };
  bindButton(viewport.querySelector(".elementor-swiper-button-prev"), -1);
  bindButton(viewport.querySelector(".elementor-swiper-button-next"), 1);
  dots.forEach((dot, index) => dot.addEventListener("click", () => manual(index)));

  let pointerStart = null;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = event.clientX;
  });
  viewport.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(distance) < 40) return;
    manual(active + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
  });
  viewport.addEventListener("pointercancel", () => { pointerStart = null; });
  viewport.tabIndex = 0;
  viewport.addEventListener("keydown", (event) => {
    if (event.target !== viewport || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    manual(active + direction, direction);
  });
});
