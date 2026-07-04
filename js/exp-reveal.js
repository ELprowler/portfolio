/**
 * 工作经历时间线 — 滚动揭示
 * 卡片从左右两侧滑入，Intersection Observer 驱动
 */
(function () {
  var cards = document.querySelectorAll('.exp-card');
  if (!cards.length) return;

  /* 方向：左列从左滑入，右列从右滑入 */
  cards.forEach(function (card) {
    var row = card.closest('.exp-row');
    if (!row) return;
    var isRight = row.classList.contains('exp-right');
    card.style.setProperty('--rx', isRight ? '30px' : '-30px');
    card.classList.add('reveal');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(function (card) { observer.observe(card); });
})();
