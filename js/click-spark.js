/**
 * ClickSpark — ReactBits 原生 JS 适配
 * 点击页面任意位置时，从点击点绽放火花粒子
 * 与 TargetCursor 协作：dot + 角标跟踪鼠标，点击爆炸粒子
 */
(function () {
  if (typeof gsap === 'undefined') return;

  /* ---- 配置 ---- */
  var sparkColor = '#a06050';
  var sparkSize = 14;
  var sparkRadius = 22;
  var sparkCount = 10;
  var duration = 500;

  /* ---- 创建全屏 Canvas ---- */
  var canvas = document.createElement('canvas');
  canvas.id = 'click-spark-canvas';
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;display:block;';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var sparks = [];

  /* ---- Canvas 自适应 ---- */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- 火花数据结构 ---- */
  function createSparks(x, y) {
    var now = performance.now();
    for (var i = 0; i < sparkCount; i++) {
      sparks.push({
        x: x, y: y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      });
    }
  }

  /* ---- 缓动 ---- */
  function easeOut(t) {
    return t * (2 - t);
  }

  /* ---- 渲染循环 ---- */
  function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks = sparks.filter(function (s) {
      var elapsed = timestamp - s.startTime;
      if (elapsed >= duration) return false;

      var progress = elapsed / duration;
      var eased = easeOut(progress);

      var dist = eased * sparkRadius;
      var len = sparkSize * (1 - eased);

      var x1 = s.x + dist * Math.cos(s.angle);
      var y1 = s.y + dist * Math.sin(s.angle);
      var x2 = s.x + (dist + len) * Math.cos(s.angle);
      var y2 = s.y + (dist + len) * Math.sin(s.angle);

      /* 透明度随进度衰减 */
      var alpha = 1 - progress;
      ctx.strokeStyle = sparkColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      return true;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  /* ---- 全局点击事件 ---- */
  document.addEventListener('click', function (e) {
    createSparks(e.clientX, e.clientY);
  });
})();
