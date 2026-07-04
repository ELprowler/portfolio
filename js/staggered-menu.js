/* ============================================================
   StaggeredMenu 交错菜单 — vanilla JS
   适配自 ReactBits StaggeredMenu (GSAP → CSS transitions)
   滚动浮现按钮 + 右侧滑出面板 + 菜单项交错入场
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- 滚动隐藏标题栏 ---- */
  const header = document.querySelector('header');
  let lastScroll = 0;
  let headerVisible = true;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < 100) {
      // 顶部区域始终显示
      header.classList.remove('hidden');
      headerVisible = true;
    } else if (y > lastScroll + 5 && headerVisible) {
      // 向下滚动 → 隐藏
      header.classList.add('hidden');
      headerVisible = false;
    } else if (y < lastScroll - 5 && !headerVisible) {
      // 向上滚动 → 显示
      header.classList.remove('hidden');
      headerVisible = true;
    }
    lastScroll = y;
  }, { passive: true });

  /* ---- 创建 DOM ---- */
  const wrapper = document.createElement('div');
  wrapper.className = 'sm-wrapper';
  wrapper.setAttribute('data-position', 'right');
  wrapper.innerHTML = `
    <button class="sm-toggle-btn" aria-label="菜单" aria-expanded="false">
      <span class="sm-toggle-icon">←</span>
    </button>
    <nav class="sm-panel" aria-hidden="true">
      <ul class="sm-list">
        <li class="sm-item"><a href="#about">关于</a></li>
        <li class="sm-item"><a href="#experience">经历</a></li>
        <li class="sm-item"><a href="#projects">项目</a></li>
        <li class="sm-item"><a href="#skills">技能</a></li>
        <li class="sm-item"><a href="#honors">荣誉</a></li>
        <li class="sm-item"><a href="#media">媒体</a></li>
        <li class="sm-item"><a href="#contact">联系</a></li>
      </ul>
    </nav>
  `;
  document.body.appendChild(wrapper);

  /* ---- 元素引用 ---- */
  const btn    = wrapper.querySelector('.sm-toggle-btn');
  const icon   = wrapper.querySelector('.sm-toggle-icon');
  const panel  = wrapper.querySelector('.sm-panel');
  const items  = wrapper.querySelectorAll('.sm-item');
  let open = false;
  let busy = false;

  /* ---- 滚动: Hero 过后显示按钮 ---- */
  const hero = document.getElementById('hero');
  if (hero) {
    const obs = new IntersectionObserver(([e]) => {
      btn.classList.toggle('sm-visible', !e.isIntersecting);
    }, { threshold: 0 });
    obs.observe(hero);
  } else {
    btn.classList.add('sm-visible');
  }

  /* ---- 面板打开时滚动页面 → 自动收回 ---- */
  window.addEventListener('scroll', () => {
    if (open) toggle();
  }, { passive: true });

  /* ---- 开关 ---- */
  function toggle() {
    if (busy) return;
    busy = true;
    open = !open;

    wrapper.setAttribute('data-open', open ? '' : null);
    btn.setAttribute('aria-expanded', open);
    panel.setAttribute('aria-hidden', !open);

    icon.textContent = open ? '×' : '←';

    if (open) {
      panel.classList.add('sm-panel-open');
      items.forEach((item, i) => {
        item.style.transition = `opacity 0.5s ease ${0.15 + i * 0.08}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.08}s`;
        item.classList.add('sm-item-visible');
      });
      setTimeout(() => { busy = false; }, 800);
    } else {
      items.forEach(item => {
        item.style.transition = 'opacity 0.2s ease, transform 0.3s ease';
        item.classList.remove('sm-item-visible');
      });
      panel.classList.remove('sm-panel-open');
      setTimeout(() => { busy = false; }, 400);
    }
  }

  btn.addEventListener('click', toggle);

  /* ---- 点击遮罩关闭 ---- */
  wrapper.addEventListener('click', (e) => {
    if (open && e.target === wrapper) toggle();
  });

  /* ---- ESC 关闭 ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) toggle();
  });

  /* ---- 菜单项点击关闭 ---- */
  items.forEach(item => {
    item.addEventListener('click', () => {
      if (open) toggle();
    });
  });
});
