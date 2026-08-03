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
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    ctx.save();
    // clear and paint a dark face background for good contrast
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.translate(0, 0);
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

    // hour
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.sin((Math.PI * 2) * (h / 12)) * center * 0.45,
      -Math.cos((Math.PI * 2) * (h / 12)) * center * 0.45
    );
    ctx.stroke();

    // minute
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#dbeafe';
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.sin((Math.PI * 2) * (m / 60)) * center * 0.65,
      -Math.cos((Math.PI * 2) * (m / 60)) * center * 0.65
    );
    ctx.stroke();

    // second (smooth)
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#60a5fa';
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.sin((Math.PI * 2) * (s / 60)) * center * 0.72,
      -Math.cos((Math.PI * 2) * (s / 60)) * center * 0.72
    );
    ctx.stroke();

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
      displayEl.textContent = `${hh}:${mm}:${ss}`;
      // ensure digital display is visible even if legacy CSS exists
      displayEl.style.background = 'rgba(4,6,12,0.7)';
      displayEl.style.color = '#ffffff';
      displayEl.style.padding = '6px 10px';
      displayEl.style.borderRadius = '8px';
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
