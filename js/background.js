/* ============================================================
   ShapeGrid 六边形网格背景 — vanilla JS
   移植自 ReactBits · 参数 hexagon / #38363a / #6a4949 / trail 4
   ============================================================ */

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '-1', pointerEvents: 'none',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');

  /* ---- 参数 ---- */
  const SIZE       = 27;
  const SPEED      = 0.16;
  const BORDER     = '#38363a';
  const HOVER_FILL = '#2a1818';
  const TRAIL      = 4;

  const HEX_H = SIZE * 1.5;
  const HEX_V = SIZE * Math.sqrt(3);

  let W, H, dpr;
  let offset  = { x: 0, y: 0 };
  let hover   = null;
  let trail   = [];
  let map     = new Map();  // "col,row" → opacity
  let raf;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = window.innerWidth;
    H = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- 六边形 ---- */
  function hex(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  /* ---- 找出鼠标所在的六边形 ---- */
  function cellAt(mx, my) {
    const shift  = Math.floor(offset.x / HEX_H);
    const ox     = ((offset.x % HEX_H) + HEX_H) % HEX_H;
    const oy     = ((offset.y % HEX_V) + HEX_V) % HEX_V;
    const adjX   = mx - ox;
    const adjY   = my - oy;
    const col    = Math.round(adjX / HEX_H);
    const rowOff = (col + shift) % 2 !== 0 ? HEX_V / 2 : 0;
    const row    = Math.round((adjY - rowOff) / HEX_V);
    return { col, row };
  }

  /* ---- 渲染 ---- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    const shift = Math.floor(offset.x / HEX_H);
    const ox = ((offset.x % HEX_H) + HEX_H) % HEX_H;
    const oy = ((offset.y % HEX_V) + HEX_V) % HEX_V;
    const cols = Math.ceil(W / HEX_H) + 3;
    const rows = Math.ceil(H / HEX_V) + 3;

    for (let col = -2; col < cols; col++) {
      for (let row = -2; row < rows; row++) {
        const cx = col * HEX_H + ox;
        const cy = row * HEX_V
          + ((col + shift) % 2 !== 0 ? HEX_V / 2 : 0) + oy;

        const a = map.get(col + ',' + row) || 0;

        if (a > 0.003) {
          ctx.globalAlpha = a;
          hex(cx, cy, SIZE);
          ctx.fillStyle = HOVER_FILL;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        hex(cx, cy, SIZE);
        ctx.strokeStyle = BORDER;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  /* ---- 动画更新 ---- */
  function tick() {
    // 偏移
    const wx = HEX_H * 2;
    const wy = HEX_V;
    offset.x = (offset.x - SPEED + wx) % wx;
    offset.y = (offset.y - SPEED + wy) % wy;

    // 透明度目标
    const tgt = new Map();
    if (hover) tgt.set(hover.col + ',' + hover.row, 1);
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const k = t.col + ',' + t.row;
      if (!tgt.has(k)) tgt.set(k, (trail.length - i) / (trail.length + 1));
    }

    // 初始化新键
    for (const [k] of tgt) {
      if (!map.has(k)) map.set(k, 0);
    }

    // 渐变
    for (const [k, v] of map) {
      const target = tgt.get(k) || 0;
      const next = v + (target - v) * 0.15;
      if (next < 0.003) map.delete(k);
      else map.set(k, next);
    }

    draw();
    raf = requestAnimationFrame(tick);
  }

  /* ---- 鼠标 (监听 window, 绕过内容层遮挡) ---- */
  window.addEventListener('mousemove', function (e) {
    const prev = hover;
    hover = cellAt(e.clientX, e.clientY);

    if (prev && TRAIL > 0 && (hover.col !== prev.col || hover.row !== prev.row)) {
      trail.unshift({ col: prev.col, row: prev.row });
      if (trail.length > TRAIL) trail.length = TRAIL;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', function () {
    if (hover && TRAIL > 0) {
      trail.unshift({ col: hover.col, row: hover.row });
      if (trail.length > TRAIL) trail.length = TRAIL;
    }
    hover = null;
  });

  /* ---- 启动 ---- */
  raf = requestAnimationFrame(tick);

  window.addEventListener('beforeunload', function () {
    cancelAnimationFrame(raf);
  });
})();
