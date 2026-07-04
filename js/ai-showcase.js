/**
 * AI 文献研判展示 — 思考流 + 交互 Demo
 */
(function () {
  /* 思考流只播一次，不重复 */

  /* ---- 清洗演示 ---- */
  var cleanRunBtn = document.getElementById('clean-run');
  var cleanSteps = document.getElementById('clean-steps');
  if (cleanRunBtn && cleanSteps) {

    var flow = [
      { icon: '▶', msg: '加载原始数据...', detail: 'ئالىي مەكتەپ  12345 Ⓜ  |  【注意事项】بەلگىلەر  |  身份证号:650102199901011234  |  手机号:13812345678  |  جۇڭگو · تەكشۈرۈش' },
      { icon: '▶', msg: '匹配正则 r/[Ⓜ①②③★☆●○]/g，删除无效特殊符号...', detail: '移除 Ⓜ → 结果: ئالىي مەكتەپ  12345  |  【注意事项】بەلگىلەر  |  身份证号:650102199901011234  |  手机号:13812345678  |  جۇڭگو · تەكشۈرۈش' },
      { icon: '▶', msg: '匹配正则 r/【(.*?)】/，提取括号内文本、丢弃装饰括号...', detail: '【注意事项】→ 注意事项 → 结果: 注意事项 بەلگىلەر' },
      { icon: '▶', msg: '匹配正则 r/(\\d{6})\\d{8}(\\d{4})/，身份证中间 8 位脱敏...', detail: '650102199901011234 → 650102********1234' },
      { icon: '▶', msg: '匹配正则 r/(\\d{3})\\d{4}(\\d{4})/，手机号中间 4 位脱敏...', detail: '13812345678 → 138****5678' },
      { icon: '✓', msg: '合并多余空格，首尾 trim，清洗完成。', detail: '最终结果 → ئالىي مەكتەپ 12345 | 注意事项 بەلگىلەر | 身份证号:650102********1234 | 手机号:138****5678 | جۇڭگو تەكشۈرۈش', final: true }
    ];

    cleanRunBtn.addEventListener('click', function () {
      cleanSteps.innerHTML = '';
      cleanSteps.hidden = false;
      cleanRunBtn.disabled = true;
      cleanRunBtn.textContent = '清洗中...';

      flow.forEach(function (step, i) {
        setTimeout(function () {
          var div = document.createElement('div');
          div.className = 'think-step' + (step.final ? ' result-step' : '');
          div.innerHTML =
            '<span class="think-icon"' + (step.final ? ' style="background:rgba(80,160,80,0.15);color:#50a050;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700"' : '') + '>' + step.icon + '</span>' +
            '<div class="think-text"><code>' + step.msg + '</code><p>' + step.detail + '</p></div>';
          cleanSteps.appendChild(div);
        }, i * 900);
      });

      setTimeout(function () {
        cleanRunBtn.disabled = false;
        cleanRunBtn.textContent = '重新清洗';
      }, flow.length * 900 + 300);
    });
  }

  /* ---- 互动 Demo ---- */
  var input = document.getElementById('demo-input');
  var run   = document.getElementById('demo-run');
  var rand  = document.getElementById('demo-random');
  var output = document.getElementById('demo-output');
  var verdict = document.getElementById('demo-verdict');
  var label  = document.getElementById('demo-label');
  var reason = document.getElementById('demo-reason');
  if (!input || !run) return;

  /* 10 篇预存摘要 */
  var samples = [
    'This paper examines how the launch of a new mobile app channel affects customer retention. Using a natural experiment with 50,000 users, we find that adding a mobile channel increases retention by 23% and order frequency by 17%.',
    'We study the impact of introducing a buy-online-pick-up-in-store (BOPS) channel on a retailer\'s sales. Using transaction data from 200 stores over 3 years, we find the omnichannel addition boosts offline sales by 8% and online by 12%.',
    'This research explores how live streaming commerce as a new social media channel influences consumer purchase behavior. Through a field experiment on TikTok, we demonstrate a 34% increase in conversion rates.',
    'We propose a mathematical model for optimizing inventory across existing distribution channels. Using game theory, we derive equilibrium strategies for manufacturers and retailers.',
    'This literature review synthesizes 15 years of omnichannel marketing research. We identify key themes including channel integration, customer experience, and digital transformation.',
    'The paper investigates how brands adopt social media platforms as new communication channels. A survey of 500 marketing managers and secondary data analysis reveals that social media adoption significantly improves brand engagement metrics.',
    'We examine the effect of pricing strategies on customer loyalty within an existing e-commerce platform. Using regression analysis on 100,000 transactions, we find that dynamic pricing reduces repeat purchases.',
    'This conceptual framework proposes a model for understanding consumer behavior in multi-channel environments. No empirical data is presented; the paper focuses on theoretical propositions.',
    'The study explores how adding a virtual try-on feature to an existing online store impacts return rates. Using an A/B test with 10,000 participants, we show a 22% reduction in returns.',
    'We analyze supply chain coordination mechanisms between manufacturers and retailers. The simulation study models various contract types without empirical validation using real-world data.'
  ];

  function pickRandom() {
    input.value = samples[Math.floor(Math.random() * samples.length)];
  }
  pickRandom();
  if (rand) rand.addEventListener('click', pickRandom);

  /* 模拟判断规则 — 基于真实项目指令文档 */
  function mockClassify(text) {
    var t = text.toLowerCase();

    /* 渠道新增关键词 */
    var channelPatterns = [
      /new\s(channel|platform|app|store|website|market|service|product\sline)/i,
      /(launch|introduce|add|adopt|deploy|open|establish)(ing|ed)?\s(a\s)?(new\s)?(channel|platform|app|store|website|marketplace)/i,
      /(omnichannel|omni.channel|multi.channel\s(expansion|addition|strategy))/i,
      /(go(\s|\-)online|digital\stransformation.*channel|channel\s(addition|expansion|diversification))/i,
      /(enter\s(online|digital)\smarket|expand\s(to|into)\s(online|digital|mobile))/i,
      /(crowdsourcing\splatform|virtual\scommunity|online\scommunity|social\scommerce|live\sstreaming\sshopping)/i,
      /(buy\sonline.*pick.*store|click.*collect|virtual\sreality\sshopping)/i
    ];
    var hasChannel = channelPatterns.some(function (p) { return p.test(t); });

    /* 实证分析方法关键词 */
    var empiricalPatterns = [
      /(survey|questionnaire|interview|field\sstudy|field\sexperiment)/i,
      /(experiment|randomized\scontrol|RCT|A\/B\stest|natural\sexperiment)/i,
      /(secondary\sdata|archival\sdata|panel\sdata|longitudinal|transaction\sdata)/i,
      /(empirical|quantitative|econometric|statistical\sanalysis)/i,
      /(regression|difference.in.difference|instrumental\svariable|propensity\sscore)/i,
      /(structural\sequation|hierarchical\slinear|multilevel\smodel|fixed\seffects)/i,
      /(quasi.experiment|field\sresearch|observational\sstudy|case\sstudy\swith\s(data|quantitative))/i
    ];
    var hasEmpirical = empiricalPatterns.some(function (p) { return p.test(t); });

    /* 排除：综述/理论/建模/纯优化 */
    var excludePatterns = [
      /(literature\sreview|systematic\sreview|meta.analysis|bibliometric)/i,
      /(conceptual\sframework|theoretical\sframework|proposition|conceptual\smodel)/i,
      /(review\s(of|article)|survey\sof\s(the|literature)|state.of.the.art)/i,
      /(mathematical\smodel|analytical\smodel|game\stheory|nash\sequilibrium)/i,
      /(algorithm\s(design|optimization|development)|simulation\sstudy)/i,
      /(proof|theorem|lemma|corollary|heuristic)/i,
      /(within\sexisting|optimiz|pricing\sstrategy|inventory|supply\schain\s(coordination|optimization))/i
    ];
    var isExcluded = excludePatterns.some(function (p) { return p.test(t); });

    if (isExcluded) {
      return { v: 'N', l: '不相关 — 非实证/纯优化', r: '该文献属于综述、理论模型、纯建模或现有渠道内优化研究。即使提及渠道相关词汇，也未研究"新增渠道"带来的影响，或缺乏实证数据验证。不符合两项核心筛选标准。' };
    }
    if (hasChannel && hasEmpirical) {
      return { v: 'Y', l: '相关 — 双条件匹配', r: '文献同时满足：(1) 涉及企业/平台新增渠道（平台/应用/商店/社交媒体等），且聚焦新增渠道对用户或企业产生的影响；(2) 采用实证分析方法（实验/调研/二手数据/计量回归等）。符合两项核心筛选标准，建议纳入。' };
    }
    if (hasChannel || hasEmpirical) {
      var detail = [];
      if (hasChannel) detail.push('检索到渠道新增相关表述，但需全文确认是否聚焦"新增"而非"现有渠道内优化"');
      if (hasEmpirical) detail.push('检索到实证分析方法特征词，但需全文确认样本量与研究方法规范性');
      return { v: '?', l: '待确认 — 部分匹配', r: '文献仅匹配部分筛选条件，无法从摘要中确定是否同时满足两项标准。' + detail.join('；') + '。建议下载全文后进行详细判定。' };
    }
    return { v: 'N', l: '不相关 — 双条件不匹配', r: '摘要中未检索到渠道新增相关表述（或仅为现有渠道内运营优化），且未显示明确的实证分析方法特征。不符合筛选标准。' };
  }

  run.addEventListener('click', function () {
    var text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }

    /* 模拟思考延迟 */
    run.disabled = true;
    run.textContent = '研判中...';
    output.hidden = true;

    setTimeout(function () {
      var result = mockClassify(text);
      verdict.textContent = result.v;
      label.textContent = result.l;
      reason.textContent = result.r;

      /* 颜色 */
      if (result.v === 'Y') {
        verdict.style.background = 'rgba(80,160,80,0.15)';
        verdict.style.color = '#50a050';
      } else if (result.v === 'N') {
        verdict.style.background = 'rgba(200,80,80,0.15)';
        verdict.style.color = '#c85050';
      } else {
        verdict.style.background = 'rgba(200,170,50,0.15)';
        verdict.style.color = '#caa832';
      }

      output.hidden = false;
      run.disabled = false;
      run.textContent = '重新研判';
    }, 1200 + Math.random() * 800);
  });

  /* Enter 键触发 */
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.ctrlKey) run.click();
  });
})();
