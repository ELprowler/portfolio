/**
 * 语言区 — 大气排版浮动 v6
 * 固定分布：≥1 中文 + ≥2 英文 + ≥2 维语，超大字体限 1 个
 */
(function () {
  var stage = document.getElementById('voiceprint-stage');
  if (!stage) return;

  var poolEN = ['Peace', 'Freedom', 'Hope', 'Love', 'Dream', 'Light', 'Kind', 'Brave', 'True', 'Rise', 'Shine', 'Bloom'];
  var poolUG = ['تىنچلىق', 'ئەركىنلىك', 'ئۈمىد', 'مۇھەببەت', 'گۈزەللىك', 'يورۇقلۇق', 'كۈچ', 'يېڭىلىق', 'سەمىمىيەت', 'ئاراملىق'];
  var poolCN = ['平安', '自由', '希望', '美好', '温暖', '幸福', '梦想'];

  var maxVisible = 5;
  var active = []; /* { lang: 'en'|'ug'|'cn', jumbo: bool } */

  /* 18 个固定槽位 */
  var slots = [];
  [
    { r: 38, count: 6, yScale: 0.55 },
    { r: 50, count: 6, yScale: 0.55 },
    { r: 60, count: 6, yScale: 0.55 }
  ].forEach(function (ring) {
    for (var i = 0; i < ring.count; i++) {
      var angle = (i / ring.count) * Math.PI * 2 + ring.r * 0.02;
      slots.push({
        left: 50 + Math.cos(angle) * ring.r,
        top:  50 + Math.sin(angle) * ring.r * ring.yScale,
        free: true
      });
    }
  });

  function findSlot() {
    var free = slots.filter(function (s) { return s.free; });
    if (!free.length) {
      var any = slots[Math.floor(Math.random() * slots.length)];
      any.free = true; return any;
    }
    return free[Math.floor(Math.random() * free.length)];
  }

  /* 统计当前各语言数量 */
  function counts() {
    var en = 0, ug = 0, cn = 0, jumbo = 0;
    active.forEach(function (a) {
      if (a.lang === 'en') en++;
      if (a.lang === 'ug') ug++;
      if (a.lang === 'cn') cn++;
      if (a.jumbo) jumbo++;
    });
    return { en: en, ug: ug, cn: cn, jumbo: jumbo, total: active.length };
  }

  /* 决定下一个词的语言和字号 */
  function decide() {
    var c = counts();
    var lang, pool, isArabic, jumbo = false;

    /* 优先补充不足的语言 */
    if (c.cn < 1) { lang = 'cn'; pool = poolCN; isArabic = false; }
    else if (c.en < 2) { lang = 'en'; pool = poolEN; isArabic = false; }
    else if (c.ug < 2) { lang = 'ug'; pool = poolUG; isArabic = true; }
    else {
      /* 都够了，随机 */
      var r = Math.random();
      if (r < 0.35) { lang = 'en'; pool = poolEN; isArabic = false; }
      else if (r < 0.7) { lang = 'ug'; pool = poolUG; isArabic = true; }
      else { lang = 'cn'; pool = poolCN; isArabic = false; }
    }

    /* 字号：只有当没有 jumbo 时才可能超大 */
    var roll = Math.random();
    var size;
    if (c.jumbo > 0 || roll > 0.15) {
      /* 主力：2~5.5rem */
      if (roll < 0.7) size = 2 + Math.random() * 3.5;
      else size = 5.5 + Math.random() * 3.5;
    } else {
      size = 9 + Math.random() * 6;
      jumbo = true;
    }

    return {
      word: pool[Math.floor(Math.random() * pool.length)],
      lang: lang, isArabic: isArabic, size: size, jumbo: jumbo
    };
  }

  function spawn() {
    if (active.length >= maxVisible) return;

    var d = decide();
    var slot = findSlot();
    slot.free = false;

    var span = document.createElement('span');
    span.className = 'vp-big-word';
    span.textContent = d.word;
    if (d.isArabic) span.setAttribute('dir', 'rtl');

    span.style.cssText =
      'position:absolute;pointer-events:none;z-index:3;' +
      'font-size:' + d.size.toFixed(1) + 'rem;' +
      'font-weight:600;color:var(--accent);white-space:nowrap;' +
      'left:' + slot.left.toFixed(1) + '%;top:' + slot.top.toFixed(1) + '%;' +
      'transform:translate(-50%,-50%) rotate(' + ((Math.random()-0.5)*5).toFixed(1) + 'deg);' +
      'opacity:0;transition:opacity 1.2s ease-out;';

    stage.appendChild(span);

    var entry = { lang: d.lang, jumbo: d.jumbo };
    active.push(entry);

    var targetOpacity = 0.15 + Math.random() * 0.15;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        span.style.opacity = targetOpacity.toFixed(2);
      });
    });

    var stay = 3000 + Math.random() * 3000;
    setTimeout(function () {
      span.style.transition = 'opacity 1s ease-out';
      span.style.opacity = '0';
      span.addEventListener('transitionend', function () {
        if (span.parentNode) span.parentNode.removeChild(span);
        var idx = active.indexOf(entry);
        if (idx > -1) active.splice(idx, 1);
        slot.free = true;
      });
    }, stay);
  }

  /* 启动：按需补满 5 个 */
  function fill() {
    if (active.length >= maxVisible) return;
    spawn();
    setTimeout(fill, 400);
  }
  fill();

  /* 持续维护 */
  setInterval(function () { spawn(); }, 2000);
})();
