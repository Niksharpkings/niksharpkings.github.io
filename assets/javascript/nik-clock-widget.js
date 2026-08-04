(function () {
  // Ensure single initialization
  if (window.__nikClockInitialized) {
    return;
  }
  window.__nikClockInitialized = true;

  let animationFrameId = null;
  let widgetEl = null;
  let canvasEl = null;
  let displayEl = null;
  let ctx = null;
  let sizePx = 220;

  function getOrCreateWidget() {
    const existing = document.querySelector('.clock-widget');
    if (existing) return existing;
    const w = document.createElement('div');
    w.className = 'clock-widget';
    document.body.appendChild(w);
    return w;
  }

  function getOrCreateCanvas(widget) {
    const existingCanvas = widget.querySelector('canvas');
    if (existingCanvas) return existingCanvas;

    const c = document.createElement('canvas');
    c.id = 'canvas';
    c.className = 'clock-canvas';
    widget.appendChild(c);
    return c;
  }

  function getOrCreateDisplay(widget) {
    const existing = widget.querySelector('.clock-digital');
    if (existing) return existing;

    const d = document.createElement('div');
    d.className = 'clock-digital';
    widget.appendChild(d);
    return d;
  }

  function resizeCanvas() {
    if (!canvasEl) return;
    // responsive size
    const preferred = Math.min(260, Math.max(160, window.innerWidth < 700 ? 160 : 220));
    sizePx = preferred;
    const ratio = window.devicePixelRatio || 1;
    canvasEl.width = Math.round(sizePx * ratio);
    canvasEl.height = Math.round(sizePx * ratio);
    canvasEl.style.width = `${sizePx}px`;
    canvasEl.style.height = `${sizePx}px`;
    // optional chaining when getting context to avoid exceptions
    ctx = canvasEl?.getContext?.('2d') || null;
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, sizePx, sizePx);
  }
  
  

  function drawClock(now) {
    if (!ctx) return;
    const center = sizePx / 2;
    const perf = performance.now();
    const ms = perf % 1000;
    const us = ms * 1e3;
    const ns = ms * 1e6;
    const ps = ms * 1e9;
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    ctx.save();
    // clear and paint a dark face background for good contrast
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.fillStyle = '#071024';
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.translate(center, center);

    // face outline
    ctx.beginPath();
    ctx.arc(0, 0, center - 12, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.stroke();

    // ticks
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI / 6) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (center - 28), Math.sin(angle) * (center - 28));
      ctx.lineTo(Math.cos(angle) * (center - 12), Math.sin(angle) * (center - 12));
      ctx.strokeStyle = 'rgba(240,240,240,0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    function drawHand(angle, length, width, color) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.sin(angle) * length,
          -Math.cos(angle) * length
        );
       ctx.stroke();
}

drawHand(
  Math.PI * 2 * (h / 12),
  center * 0.45,
  8,
  "#fff"
);

drawHand(
  Math.PI * 2 * (m / 60),
  center * 0.65,
  6,
  "#dbeafe"
);

drawHand(
  Math.PI * 2 * (s / 60),
  center * 0.72,
  3,
  "#60a5fa"
);

drawHand(
  Math.PI * 2 * (ms / 1000),
  center * 0.75,
  2,
  "#3b82f6"
);

drawHand(
  Math.PI * 2 * (us / 1e6),
  center * 0.78,
  1,
  "#2563eb"
);

drawHand(
  Math.PI * 2 * (ns / 1e9),
  center * 0.8,
  0.5,
  "#1d4ed8"
);


    // hub
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();

    ctx.restore();

    if (displayEl) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3,'0');
      const us = String(performance.now() % 1000 * 1000).padStart(6,'0');
      const ns = String(performance.now() * 1e6).padStart(9,'0');

displayEl.textContent = `${hh}:${mm}:${ss}:${ms}:${us}:${ns}`;
    }
  }

  function tick() {
    drawClock(new Date());
    animationFrameId = window.requestAnimationFrame(tick);
  }

  function init() {
    widgetEl = getOrCreateWidget();
    canvasEl = getOrCreateCanvas(widgetEl);
    displayEl = getOrCreateDisplay(widgetEl);
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
