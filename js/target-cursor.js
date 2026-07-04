/**
 * TargetCursor — 自定义光标
 * 默认：橘色正常箭头指针
 * hover .cursor-target：四角括号展开框住元素
 * 点击：火花粒子由 click-spark.js 负责，互不干扰
 * 依赖：GSAP 3
 */
(function () {
  if (typeof gsap === 'undefined') return;

  var isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    && window.innerWidth <= 768;
  if (isMobile) return;

  var targetSelector = '.cursor-target';
  var cursorColor = '#c08060';          /* 橘色 */
  var cursorColorOnTarget = '#a06050';  /* 勃艮第红 */
  var cornerSize = 10;
  var borderWidth = 2;

  /* ---- 橘色箭头光标 SVG（base64 编码，避免特殊字符问题） ---- */
  var orangeArrow = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">'
    + '<path d="M2 2l5 20 4-6 7-4z" fill="#f09058" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>'
    + '</svg>';
  var cursorURI = 'url("data:image/svg+xml;base64,' + btoa(orangeArrow) + '") 2 2, auto';

  /* ---- 创建 DOM（只有四角，没有点） ---- */
  var wrapper = document.createElement('div');
  wrapper.className = 'target-cursor-wrapper';

  var corners = [];
  ['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'].forEach(function (cls) {
    var c = document.createElement('div');
    c.className = 'target-cursor-corner ' + cls;
    c.style.borderColor = cursorColor;
    c.style.opacity = '0';  /* 默认隐藏 */
    wrapper.appendChild(c);
    corners.push(c);
  });

  document.body.appendChild(wrapper);

  /* ---- 橘色默认光标 ---- */
  var cursorStyle = document.createElement('style');
  cursorStyle.textContent = 'body, a, a *, button, [role="button"] { cursor: ' + cursorURI + ' !important; }';
  document.head.appendChild(cursorStyle);

  /* ---- 状态 ---- */
  var activeTarget = null;
  var targetCornerPositions = null;
  var activeStrength = { val: 0 };
  var isActive = false;
  var currentLeaveHandler = null;

  /* 初始定位 */
  gsap.set(wrapper, {
    xPercent: -50, yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  /* 鼠标跟踪 — wrapper 跟随但不旋转 */
  window.addEventListener('mousemove', function (e) {
    gsap.to(wrapper, {
      x: e.clientX, y: e.clientY,
      duration: 0.08, ease: 'power3.out'
    });
  });

  /* ---- GSAP ticker：角标平滑跟随目标 ---- */
  function tickCorners() {
    if (!targetCornerPositions || !isActive) return;
    var s = activeStrength.val;
    if (s === 0) return;
    var cx = gsap.getProperty(wrapper, 'x');
    var cy = gsap.getProperty(wrapper, 'y');
    corners.forEach(function (corner, i) {
      var tx = targetCornerPositions[i].x - cx;
      var ty = targetCornerPositions[i].y - cy;
      gsap.to(corner, {
        x: tx, y: ty,
        duration: s >= 0.99 ? 0.18 : 0.05,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    });
  }

  /* ---- 进入目标：角标亮起 + 展开框住 ---- */
  function enterTarget(target) {
    if (!target || activeTarget === target) return;
    if (activeTarget) leaveTarget(activeTarget);
    activeTarget = target;
    isActive = true;

    /* 角标变色 + 显示 */
    corners.forEach(function (c) {
      gsap.to(c, { borderColor: cursorColorOnTarget, opacity: 1, duration: 0.15 });
    });

    /* 计算四个角在目标元素上的位置 */
    var rect = target.getBoundingClientRect();
    targetCornerPositions = [
      { x: rect.left - borderWidth,                y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize,  y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize,  y: rect.bottom + borderWidth - cornerSize },
      { x: rect.left - borderWidth,                y: rect.bottom + borderWidth - cornerSize }
    ];

    gsap.ticker.add(tickCorners);

    /* 强度渐入 */
    gsap.to(activeStrength, {
      val: 1, duration: 0.2, ease: 'power2.out',
      onUpdate: function () { activeStrength.val = this.targets()[0].val || 0; }
    });
    activeStrength.val = 1;

    /* 角标飞到目标四角 */
    var cx = gsap.getProperty(wrapper, 'x');
    var cy = gsap.getProperty(wrapper, 'y');
    corners.forEach(function (corner, i) {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cx,
        y: targetCornerPositions[i].y - cy,
        duration: 0.2, ease: 'power2.out'
      });
    });

    currentLeaveHandler = function () { leaveTarget(target); };
    target.addEventListener('mouseleave', currentLeaveHandler);
  }

  /* ---- 离开目标：角标淡出 ---- */
  function leaveTarget(target) {
    gsap.ticker.remove(tickCorners);
    isActive = false;
    targetCornerPositions = null;
    activeStrength.val = 0;
    activeTarget = null;

    if (currentLeaveHandler) {
      target.removeEventListener('mouseleave', currentLeaveHandler);
      currentLeaveHandler = null;
    }

    /* 角标变色 + 隐藏 */
    corners.forEach(function (c) {
      gsap.to(c, { borderColor: cursorColor, opacity: 0, duration: 0.2 });
    });

    /* 角标归位到光标附近 */
    var positions = [
      { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
      { x:  cornerSize * 0.5, y: -cornerSize * 1.5 },
      { x:  cornerSize * 0.5, y:  cornerSize * 0.5 },
      { x: -cornerSize * 1.5, y:  cornerSize * 0.5 }
    ];
    corners.forEach(function (corner, i) {
      gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.25, ease: 'power3.out' });
    });
  }

  /* ---- 事件委托：检测进入 .cursor-target ---- */
  window.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest('header')) return;
    if (activeTarget && activeTarget.contains && activeTarget.contains(e.target)) return;
    var el = e.target;
    while (el && el !== document.body) {
      if (el.matches && el.matches(targetSelector)) {
        enterTarget(el);
        return;
      }
      el = el.parentElement;
    }
  }, { passive: true });

  /* ---- 滚动检测：目标滚出视口则离开 ---- */
  window.addEventListener('scroll', function () {
    if (!activeTarget || !wrapper) return;
    var mx = gsap.getProperty(wrapper, 'x');
    var my = gsap.getProperty(wrapper, 'y');
    var elUnder = document.elementFromPoint(mx, my);
    var stillOver = elUnder && (elUnder === activeTarget || elUnder.closest(targetSelector) === activeTarget);
    if (!stillOver && currentLeaveHandler) currentLeaveHandler();
  }, { passive: true });

  /* ---- 点击反馈：wrapper 缩放 ---- */
  window.addEventListener('mousedown', function () {
    gsap.to(wrapper, { scale: 0.9, duration: 0.15 });
  });
  window.addEventListener('mouseup', function () {
    gsap.to(wrapper, { scale: 1, duration: 0.15 });
  });

  /* ---- 导航栏内隐藏角标 ---- */
  var header = document.querySelector('header');
  if (header) {
    header.addEventListener('mouseenter', function () {
      corners.forEach(function (c) { gsap.to(c, { opacity: 0, duration: 0.15 }); });
    });
    header.addEventListener('mouseleave', function () {
      if (!isActive) {
        corners.forEach(function (c) { gsap.to(c, { opacity: 0, duration: 0.15 }); });
      }
    });
  }

  /* ---- 自动标记交互元素为 cursor-target ---- */
  var cssTargets = '.btn-primary, .btn-ghost, .spotlight-card, .orbit-badge, .skills-extra span, .about-identity span, #experience .edu-list li, #experience h4, section h2, .sm-item a, .metric, .pmetric, .proj-header h4, .hm-zone, .ab-cell:not(.ab-text)';

  function stampTargets() {
    document.querySelectorAll(cssTargets).forEach(function (el) {
      el.classList.add('cursor-target');
    });
    /* 清除 header 内的标记 */
    document.querySelectorAll('header .cursor-target').forEach(function (el) {
      el.classList.remove('cursor-target');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stampTargets);
  } else {
    stampTargets();
  }

  console.log('TargetCursor ready');
})();
