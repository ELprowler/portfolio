/**
 * 献血证 — 点击放大
 */
(function () {
  document.querySelectorAll('.blood-thumb').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var zoomed = document.querySelector('.blood-thumb.zoomed');
      if (zoomed && zoomed !== el) zoomed.classList.remove('zoomed');
      el.classList.toggle('zoomed');
    });
  });
  /* 点击空白处收起 */
  document.addEventListener('click', function () {
    var zoomed = document.querySelector('.blood-thumb.zoomed');
    if (zoomed) zoomed.classList.remove('zoomed');
  });
})();
