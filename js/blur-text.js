/* ============================================================
   BlurText 模糊文字动画 — vanilla JS
   移植自 ReactBits · 逐词/逐字 模糊→清晰 入场
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-blur-text]').forEach(el => {
    const text = el.textContent;
    const by = el.dataset.blurBy || 'words'; // words | letters
    const delay = parseFloat(el.dataset.blurDelay) || 120;
    const dir = el.dataset.blurDir || 'top';

    const segments = by === 'words' ? text.trim().split(/\s+/) : text.split('');
    el.textContent = '';
    el.style.display = 'flex';
    el.style.flexWrap = 'wrap';

    const spans = segments.map((seg, i) => {
      const span = document.createElement('span');
      span.textContent = seg;
      span.style.opacity = '0';
      span.style.filter = 'blur(8px)';
      span.style.transform = dir === 'top' ? 'translateY(-30px)' : 'translateY(30px)';
      span.style.transition = `opacity 0.6s ease ${i * delay}ms, filter 0.6s ease ${i * delay}ms, transform 0.6s ease ${i * delay}ms`;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, filter, opacity';
      if (by === 'words' && i < segments.length - 1) {
        span.style.marginRight = '0.3em';
      }
      el.appendChild(span);
      return span;
    });

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        spans.forEach(s => {
          s.style.opacity = '1';
          s.style.filter = 'blur(0px)';
          s.style.transform = 'translateY(0)';
        });
        obs.unobserve(el);
      }
    }, { threshold: 0.2 });

    obs.observe(el);
  });
});
