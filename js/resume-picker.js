// 简历版本选择菜单：点击按钮展开，点击外部或 ESC 关闭
(function () {
  const picker = document.querySelector('.resume-picker');
  if (!picker) return;
  const btn = picker.querySelector('.resume-picker__btn');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = picker.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) {
      picker.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      picker.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
