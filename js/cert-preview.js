/**
 * 证书预览 — 点击放大，黑色遮罩背景
 */
(function () {
  /* 创建遮罩 + 大图容器 */
  var overlay = document.createElement('div');
  overlay.className = 'cert-overlay';
  overlay.innerHTML = '<img src="" alt="">';
  overlay.addEventListener('click', function () {
    overlay.classList.remove('open');
  });
  document.body.appendChild(overlay);

  /* 学历勋章 + 志愿卡片的图片 — 献血证走自己的放大 */
  document.querySelectorAll('.honor-badge img, .vol-card img, .dual-pages img').forEach(function (img) {
    img.style.setProperty('cursor', 'pointer', 'important');
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      var big = overlay.querySelector('img');
      big.src = img.src;
      overlay.classList.add('open');
    });
  });

  /* 献血证已有点击放大，不冲突——blood-thumb 点击同时触发两个效果，
     预览优先，zoom 也保留 */
})();
