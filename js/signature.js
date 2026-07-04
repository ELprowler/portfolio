/**
 * ELYAS AKBAR 手写签名动画
 * 从原始坐标点阵生成 SVG 贝塞尔路径，描边绘制
 * 2026 — 为 ELYAS 定制
 */
(function () {
  'use strict';

  var svg = document.querySelector('.avatar-signature');
  if (!svg) return;

  /* 手写坐标点阵（来自原始签名生成器） */
  var points = [
    /* E */ [120,50],[70,20],[30,60],[60,100],[90,100],[40,120],[20,180],[60,220],[120,200],
    /* l */ [140,150],[160,40],[140,30],[130,90],[135,190],[160,200],
    /* y */ [175,160],[170,200],[195,200],[205,160],[205,160],[195,250],[175,280],[150,260],[165,230],
    /* a */ [200,180],[225,160],[210,180],[220,200],[240,190],[245,160],[245,200],[260,200],
    /* s */ [285,160],[285,160],[275,145],[260,180],[285,200],[260,200],[285,170],
    /* 连接 */ [320,180],[360,30],[375,20],[375,20],
    /* A */ [390,190],[390,190],[380,140],[340,130],[390,130],[410,110],
    /* k */ [440,30],[420,30],[415,110],[415,190],[415,190],[415,130],[450,120],[425,150],[425,150],[460,190],[480,190],
    /* b */ [500,110],[510,30],[490,30],[480,110],[480,190],[515,190],[530,150],[500,140],[490,150],[520,150],
    /* a */ [540,130],[560,150],[545,170],[555,190],[575,180],[575,150],[575,190],[595,190],
    /* r */ [610,150],[600,140],[620,140],[620,155],[620,190],[640,190],[670,180],[690,170],[690,170],
    /* 下划线 */ [680,200],[580,230],[250,250],[150,240],[110,210],[130,195],[320,220],[530,220],[740,190],[780,170]
  ];

  /* Catmull-Rom → 贝塞尔曲线 */
  function catmullRom2bezier(pts) {
    var d = 'M ' + pts[0][0] + ',' + pts[0][1] + ' ';
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = i === 0 ? pts[0] : pts[i - 1];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = i + 2 < pts.length ? pts[i + 2] : p2;
      var cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      var cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      var cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      var cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C ' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + p2[0] + ',' + p2[1] + ' ';
    }
    return d;
  }

  /* 创建路径 */
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', catmullRom2bezier(points));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#e6e3e0');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  /* 计算路径长度，设置动画参数 */
  var len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  /* 笔尖光晕 */
  var tip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  tip.setAttribute('r', '3');
  tip.setAttribute('fill', '#fff');
  tip.setAttribute('filter', 'drop-shadow(0 0 4px rgba(230,227,224,0.6))');
  tip.setAttribute('opacity', '0');
  svg.appendChild(tip);

  var animated = false;
  var observer = null;
  var drawTimer = null;
  var rafId = null;

  /* 重置动画状态（供重播使用） */
  function resetAnimation() {
    animated = false;
    draw._start = null;
    path.style.strokeDashoffset = len;
    tip.setAttribute('opacity', '0');
    if (drawTimer) { clearTimeout(drawTimer); drawTimer = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function draw(timestamp) {
    if (!draw._start) draw._start = timestamp;
    var progress = Math.min((timestamp - draw._start) / 3500, 1);

    path.style.strokeDashoffset = len * (1 - progress);

    /* 笔尖跟随 */
    if (progress < 1 && progress > 0.01) {
      var pt = path.getPointAtLength(len * progress);
      tip.setAttribute('cx', pt.x);
      tip.setAttribute('cy', pt.y);
      tip.setAttribute('opacity', '1');
    } else if (progress >= 1) {
      tip.setAttribute('opacity', '0');
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(draw);
  }

  /* 初始化 IntersectionObserver — 离开视口自动重置，回来重播 */
  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animated) {
          /* 进入视口 → 开始书写 */
          animated = true;
          drawTimer = setTimeout(function () {
            draw._start = null;
            rafId = requestAnimationFrame(draw);
          }, 1200);
        }
        if (!entry.isIntersecting && animated) {
          /* 离开视口 → 重置，下次回来重播 */
          resetAnimation();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(svg);
  }

  /* 首次加载 */
  setupObserver();

  /* 浏览器后退/前进 → bfcache 恢复时也重播 */
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      resetAnimation();
      setupObserver();
    }
  });
})();
