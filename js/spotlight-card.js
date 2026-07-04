/**
 * 聚光灯效果 — 工作经历卡片 + 软技能卡片
 * 鼠标 hover 时，卡片表面浮现跟随光标位置的暖色光晕
 * 适配深色玻璃主题，纯 CSS 自定义属性驱动
 */
(function () {
  /* 工作经历时间线卡片 */
  document.querySelectorAll('.exp-card').forEach(function (card) {
    card.classList.add('spotlight-card');
    bindSpotlight(card);
  });

  /* 软技能卡片 */
  document.querySelectorAll('.stack-card').forEach(function (card) {
    card.classList.add('spotlight-card');
    bindSpotlight(card);
  });

  function bindSpotlight(card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  }
})();
