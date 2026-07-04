/* ============================================================
   Masonry 瀑布流布局 — vanilla JS
   移植自 ReactBits Masonry (GSAP → CSS transitions)
   响应式列数 + 入场动画 + hover 缩放
   ============================================================ */

class Masonry {
  constructor(el, opts = {}) {
    this.el = el;
    this.items = Array.from(el.children);
    if (!this.items.length) return;

    this.opts = Object.assign({
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      duration: 0.7,
      stagger: 0.06,
      animateFrom: 'bottom',
      scaleOnHover: true,
      hoverScale: 0.95,
      blurToFocus: true,
    }, opts);

    this.columns = 4;
    this.ready = false;

    this._init();
  }

  _init() {
    this.el.classList.add('masonry-list');
    this.items.forEach((item, i) => {
      item.classList.add('masonry-item');
      item.setAttribute('data-masonry-key', i);
      item.style.position = 'absolute';
      item.style.top = '0';
      item.style.left = '0';
      item.style.padding = '6px';
      item.style.cursor = 'pointer';
      item.style.willChange = 'transform, width, height, opacity';

      // 入场初始状态
      if (this.opts.blurToFocus) item.style.filter = 'blur(10px)';
      item.style.opacity = '0';
    });

    this._calcColumns();
    this._layout();
    this._animateIn();
    this._bindHover();
    this._bindLightbox();

    window.addEventListener('resize', () => {
      this._calcColumns();
      this._layout();
    });
  }

  /* ---- 响应式列数 ---- */
  _calcColumns() {
    const w = window.innerWidth;
    if (w >= 1500) this.columns = 5;
    else if (w >= 1000) this.columns = 4;
    else if (w >= 600) this.columns = 3;
    else if (w >= 400) this.columns = 2;
    else this.columns = 1;
  }

  /* ---- 瀑布流布局 ---- */
  _layout() {
    const width = this.el.offsetWidth;
    const colW = width / this.columns;
    const colHeights = new Array(this.columns).fill(0);

    this.items.forEach(item => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const h = parseFloat(item.dataset.height) || 200;
      const x = colW * col;
      const y = colHeights[col];

      colHeights[col] += h + 12; // 12px gap

      item.style.width = colW + 'px';
      item.style.height = h + 'px';
      item.style.transform = `translate(${x}px, ${y}px)`;
    });

    this.el.style.height = Math.max(...colHeights) + 'px';
  }

  /* ---- 入场动画 (CSS transition) ---- */
  _animateIn() {
    this.items.forEach((item, i) => {
      const delay = i * this.opts.stagger;

      // 从下方入场
      if (this.opts.animateFrom === 'bottom') {
        const current = item.style.transform;
        item.style.transform = current + ' translateY(60px)';
      }

      requestAnimationFrame(() => {
        item.style.transition =
          `opacity ${this.opts.duration}s ${this.opts.ease} ${delay}s,
           filter ${this.opts.duration}s ${this.opts.ease} ${delay}s,
           transform ${this.opts.duration}s ${this.opts.ease} ${delay}s`;

        item.style.opacity = '1';
        if (this.opts.blurToFocus) item.style.filter = 'blur(0px)';

        // 移除入场偏移，保留布局 transform
        this._layout();
        // 需要重设每个 item 的 transform（layout 设置的）
        setTimeout(() => this._layout(), delay * 1000 + 50);
      });
    });

    setTimeout(() => {
      // 动画完成后移除 transition，避免干扰 layout
      this.items.forEach(item => {
        item.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease';
      });
      this.ready = true;
    }, (this.items.length * this.opts.stagger + this.opts.duration) * 1000 + 200);
  }

  /* ---- Lightbox: 点击放大 / 点击还原 ---- */
  _bindLightbox() {
    // 创建全局 overlay（只创建一次）
    if (!Masonry._overlay) {
      Masonry._overlay = document.createElement('div');
      Masonry._overlay.className = 'masonry-lightbox';
      Object.assign(Masonry._overlay.style, {
        position: 'fixed', inset: '0', zIndex: '9999',
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: '0', pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
      });
      document.body.appendChild(Masonry._overlay);

      Masonry._overlay.addEventListener('click', () => {
        Masonry._overlay.style.opacity = '0';
        Masonry._overlay.style.pointerEvents = 'none';
        Masonry._overlay.innerHTML = '';
      });
    }

    this.items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const clone = item.cloneNode(true);
        clone.style.position = 'static';
        clone.style.width = 'min(90vw, 700px)';
        clone.style.height = 'auto';
        clone.style.aspectRatio = item.offsetWidth / item.offsetHeight || 'auto';
        clone.style.padding = '0';
        clone.style.cursor = 'default';
        clone.style.transform = 'none';
        clone.style.filter = 'none';
        clone.style.opacity = '1';
        clone.style.transition = 'none';
        clone.style.borderRadius = '12px';
        clone.style.overflow = 'hidden';

        Masonry._overlay.innerHTML = '';
        Masonry._overlay.appendChild(clone);
        Masonry._overlay.style.opacity = '1';
        Masonry._overlay.style.pointerEvents = 'auto';
      });
    });
  }

  /* ---- Hover ---- */
  _bindHover() {
    this.items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (!this.opts.scaleOnHover) return;
        item.style.transform = item.style.transform.replace(/scale\([^)]+\)/, '') + ` scale(${this.opts.hoverScale})`;
      });
      item.addEventListener('mouseleave', () => {
        if (!this.opts.scaleOnHover) return;
        item.style.transform = item.style.transform.replace(/ scale\([^)]+\)/, '');
      });
    });
  }
}

/* ---- 自动初始化 ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-masonry]').forEach(el => new Masonry(el));
});
