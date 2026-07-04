/**
 * 技能轨道环绕 — OrbitImages 原生 JS 适配
 * 椭圆轨道 + 匀速环绕 + 徽章始终保持正向
 */
(function () {
  var rotator = document.getElementById('orbit-rotator');
  if (!rotator) return;

  var badges = rotator.querySelectorAll('.orbit-badge');
  var count = badges.length;
  if (count === 0) return;

  /* -- 轨道参数 -- */
  var radiusX = 300;   // 水平半径 px
  var radiusY = 120;   // 垂直半径 px
  var duration = 40;   // 一圈秒数
  var startTime = performance.now();

  function tick(now) {
    var elapsed = (now - startTime) / 1000;
    var baseAngle = (elapsed / duration) * 360;  // 整体旋转角度

    for (var i = 0; i < count; i++) {
      var angleDeg = baseAngle + (i / count) * 360;
      var rad = (angleDeg * Math.PI) / 180;
      var x = Math.cos(rad) * radiusX;
      var y = Math.sin(rad) * radiusY;

      badges[i].style.transform =
        'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
