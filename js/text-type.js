/**
 * TextType — 原生 JS 打字机效果
 * 逐字打出文本，光标紧跟在最后一个字后面闪烁
 * 零依赖
 * 2026 — 为 ELYAS 定制
 */
(function () {
  'use strict';

  /**
   * typeWrite(selector, options)
   */
  window.typeWrite = function (selector, options) {
    var opts = Object.assign({
      texts: [],
      typingSpeed: 70,
      pauseDuration: 1500,
      deletingSpeed: 30,
      loop: false,
      showCursor: true,
      cursorChar: '_',
      initialDelay: 300,
      startOnVisible: true,
    }, options || {});

    if (!opts.texts.length) return;

    var el = document.querySelector(selector);
    if (!el) return;

    var textIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var timeout = null;
    var started = !opts.startOnVisible;

    /* 文字 span + 光标 span，都放在元素内部 */
    var textSpan = document.createElement('span');
    textSpan.className = 'type-text';
    el.innerHTML = '';
    el.appendChild(textSpan);

    var cursor = null;
    if (opts.showCursor) {
      cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      cursor.textContent = opts.cursorChar;
      el.appendChild(cursor);
    }

    /* 可见性检测 */
    if (opts.startOnVisible) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            schedule(300);
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(el);
    }

    function schedule(delay) {
      clearTimeout(timeout);
      timeout = setTimeout(tick, delay);
    }

    function tick() {
      var currentText = opts.texts[textIdx];

      if (isDeleting) {
        charIdx--;
        textSpan.textContent = currentText.substring(0, charIdx);
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % opts.texts.length;
          if (textIdx === 0 && !opts.loop) {
            removeCursor();
            return;
          }
          schedule(opts.typingSpeed * 3);
          return;
        }
        schedule(opts.deletingSpeed);
      } else {
        charIdx++;
        textSpan.textContent = currentText.substring(0, charIdx);
        if (charIdx === currentText.length) {
          if (!opts.loop && textIdx === opts.texts.length - 1) {
            removeCursor();
            return;
          }
          isDeleting = true;
          schedule(opts.pauseDuration);
          return;
        }
        schedule(opts.typingSpeed);
      }
    }

    function removeCursor() {
      if (cursor) { cursor.style.display = 'none'; }
    }

    if (started) {
      schedule(opts.initialDelay);
    } else if (!opts.startOnVisible) {
      schedule(opts.initialDelay);
    }
  };
})();
