/**
 * MagicRings — 语言区声纹背景 (Three.js WebGL)
 * 宽幅同心光环，无鼠标交互，纯自动呼吸
 */
(function () {
  if (typeof THREE === 'undefined') return;

  var stage = document.getElementById('voiceprint-stage');
  if (!stage) return;

  /* 容器 */
  var mount = document.createElement('div');
  mount.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  stage.insertBefore(mount, stage.firstChild);

  /* Three.js */
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true }); }
  catch (e) { return; }
  if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return; }
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  /* 着色器 — 跟 ReactBits 同款 */
  var vertexShader = 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

  var fragmentShader = [
    'precision highp float;',
    'uniform float uTime, uAttenuation, uLineThickness;',
    'uniform float uBaseRadius, uRadiusStep, uScaleRate;',
    'uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;',
    'uniform float uFadeIn, uFadeOut;',
    'uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;',
    'uniform vec2 uResolution, uMouse;',
    'uniform vec3 uColor, uColorTwo;',
    'uniform int uRingCount;',
    'const float HP = 1.5707963;',
    'const float CYCLE = 3.45;',
    'float fade(float t) { return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t); }',
    'float ring(vec2 p, float ri, float cut, float t0, float px) {',
    '  float t = mod(uTime + t0, CYCLE);',
    '  float r = ri + t / CYCLE * uScaleRate;',
    '  float d = abs(length(p) - r);',
    '  float a = atan(abs(p.y), abs(p.x)) / HP;',
    '  float th = max(1.0 - a, 0.5) * px * uLineThickness;',
    '  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;',
    '  d += pow(cut * a, 3.0) * r;',
    '  return h * exp(-uAttenuation * d) * fade(t);',
    '}',
    'void main() {',
    '  float px = 1.0 / min(uResolution.x, uResolution.y);',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;',
    '  float cr = cos(uRotation), sr = sin(uRotation);',
    '  p = mat2(cr, -sr, sr, cr) * p;',
    '  p -= uMouse * uMouseInfluence;',
    '  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;',
    '  p /= sc;',
    '  vec3 c = vec3(0.0);',
    '  float rcf = max(float(uRingCount) - 1.0, 1.0);',
    '  for (int i = 0; i < 10; i++) {',
    '    if (i >= uRingCount) break;',
    '    float fi = float(i);',
    '    vec2 pr = p - fi * uParallax * uMouse;',
    '    vec3 rc = mix(uColor, uColorTwo, fi / rcf);',
    '    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));',
    '  }',
    '  c *= 1.0 + uBurst * 2.0;',
    '  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);',
    '  c += (n - 0.5) * uNoiseAmount;',
    '  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);',
    '}'
  ].join('\n');

  /* Uniforms */
  var uniforms = {
    uTime:         { value: 0 },
    uAttenuation:  { value: 6 },
    uResolution:   { value: new THREE.Vector2() },
    uColor:        { value: new THREE.Color('#a06050') },
    uColorTwo:     { value: new THREE.Color('#c89860') },
    uLineThickness:{ value: 3 },
    uBaseRadius:   { value: 0.22 },
    uRadiusStep:   { value: 0.13 },
    uScaleRate:    { value: 0.06 },
    uRingCount:    { value: 6 },
    uOpacity:      { value: 0.8 },
    uNoiseAmount:  { value: 0.06 },
    uRotation:     { value: 0 },
    uRingGap:      { value: 1.4 },
    uFadeIn:       { value: 0.6 },
    uFadeOut:      { value: 0.55 },
    uMouse:        { value: new THREE.Vector2() },
    uMouseInfluence:{ value: 0 },
    uHoverAmount:  { value: 0 },
    uHoverScale:   { value: 1 },
    uParallax:     { value: 0 },
    uBurst:        { value: 0 }
  };

  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShader, fragmentShader: fragmentShader,
    uniforms: uniforms, transparent: true
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));

  /* 自适应 */
  function resize() {
    var w = mount.clientWidth, h = mount.clientHeight;
    var dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    uniforms.uResolution.value.set(w * dpr, h * dpr);
  }
  resize();
  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(mount);

  /* 纯自动渲染 */
  function animate(t) {
    requestAnimationFrame(animate);
    uniforms.uTime.value = t * 0.001 * 0.8;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
