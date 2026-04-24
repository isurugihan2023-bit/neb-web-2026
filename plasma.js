/**
 * Plasma WebGL2 Background
 * Vanilla JS port — no React, no OGL, no dependencies.
 */

(function () {
  'use strict';

  /* ─── Hex → RGB [0..1] ─────────────────────────────────────── */
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return [1, 0.5, 0.2];
    return [
      parseInt(r[1], 16) / 255,
      parseInt(r[2], 16) / 255,
      parseInt(r[3], 16) / 255
    ];
  }

  /* ─── Shaders ───────────────────────────────────────────────── */
  const VERT = `#version 300 es
precision highp float;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const FRAG = `#version 300 es
precision highp float;
uniform vec2  iResolution;
uniform float iTime;
uniform vec3  uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2  uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w / d * o.xyz) {
    p = z * normalize(vec3(C - .5 * r, r.y));
    p.z -= 4.;
    S = p;
    d = p.y - T;
    p.x += .4 * (1. + p.y) * sin(d + p.x * 0.1) * cos(.34 * d + p.x * 0.05);
    Q = p.xz *= mat2(cos(p.y + vec4(0, 11, 33, 0) - T));
    z += d = abs(sqrt(length(Q * Q)) - .25 * (5. + S.y)) / 3. + 8e-4;
    o = 1. + sin(S.y + p.z * .5 + S.z - length(S - p) + vec4(2, 1, 0, 8));
  }
  o.xyz = tanh(O / 1e4);
}

bool finite1(float x) { return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c) {
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

  /* ─── Helpers ───────────────────────────────────────────────── */
  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[Plasma] shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function createProgram(gl, vert, frag) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vert);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[Plasma] link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  /* ─── Main init ─────────────────────────────────────────────── */
  function initPlasma(opts) {
    opts = Object.assign({
      container:        document.body,
      color:            '#ff1f1f',   // red tint matching site theme
      speed:            0.6,
      direction:        'forward',   // 'forward' | 'reverse' | 'pingpong'
      scale:            1.0,
      opacity:          0.18,        // subtle so content stays readable
      mouseInteractive: true
    }, opts);

    const container = typeof opts.container === 'string'
      ? document.querySelector(opts.container)
      : opts.container;

    if (!container) { console.warn('[Plasma] container not found'); return; }

    /* Canvas */
    const canvas = document.createElement('canvas');
    canvas.className = 'plasma-canvas';
    canvas.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'display:block', 'pointer-events:none', 'z-index:0'
    ].join(';');
    container.appendChild(canvas);

    /* WebGL2 Context */
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      console.warn('[Plasma] WebGL2 not supported, skipping plasma background.');
      canvas.remove();
      return;
    }

    const prog = createProgram(gl, VERT, FRAG);
    if (!prog) { canvas.remove(); return; }

    /* Full-screen triangle */
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  3, -1,  -1,  3]),
      gl.STATIC_DRAW
    );

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    /* Uniform locations */
    const u = {};
    ['iTime','iResolution','uCustomColor','uUseCustomColor',
     'uSpeed','uDirection','uScale','uOpacity','uMouse','uMouseInteractive'
    ].forEach(n => u[n] = gl.getUniformLocation(prog, n));

    /* State */
    const color = hexToRgb(opts.color);
    const dirMap = { forward: 1.0, reverse: -1.0, pingpong: 1.0 };
    const dirMult = dirMap[opts.direction] ?? 1.0;
    const mousePos = [0, 0];
    let w = 0, h = 0;

    /* Resize */
    function resize() {
      const rect = container.getBoundingClientRect();
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width  * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    /* Mouse */
    function onMouse(e) {
      if (!opts.mouseInteractive) return;
      const rect = container.getBoundingClientRect();
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      // Flip Y — WebGL origin is bottom-left
      mousePos[0] = (e.clientX - rect.left)  * dpr;
      mousePos[1] = h - (e.clientY - rect.top) * dpr;
    }

    if (opts.mouseInteractive) {
      container.addEventListener('mousemove', onMouse, { passive: true });
    }

    /* Render loop */
    const t0 = performance.now();
    let raf = 0;

    function loop(now) {
      if (!canvas.offsetParent && canvas.style.display !== 'block') {
         raf = requestAnimationFrame(loop);
         return;
      }
      let t = (now - t0) * 0.001;
      let dir = dirMult;

      if (opts.direction === 'pingpong') {
        const D = 10;
        const seg = t % D;
        const fwd = Math.floor(t / D) % 2 === 0;
        const u01 = seg / D;
        const s   = u01 * u01 * (3 - 2 * u01);
        t   = (fwd ? s : 1 - s) * D;
        dir = 1.0;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(prog);

      gl.uniform1f(u.iTime,             t);
      gl.uniform2f(u.iResolution,       w, h);
      gl.uniform3f(u.uCustomColor,      color[0], color[1], color[2]);
      gl.uniform1f(u.uUseCustomColor,   opts.color ? 1.0 : 0.0);
      gl.uniform1f(u.uSpeed,            opts.speed * 0.4);
      gl.uniform1f(u.uDirection,        dir);
      gl.uniform1f(u.uScale,            opts.scale);
      gl.uniform1f(u.uOpacity,          opts.opacity);
      gl.uniform2f(u.uMouse,            mousePos[0], mousePos[1]);
      gl.uniform1f(u.uMouseInteractive, opts.mouseInteractive ? 1.0 : 0.0);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    /* Return teardown fn */
    return function destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (opts.mouseInteractive) {
        container.removeEventListener('mousemove', onMouse);
      }
      canvas.remove();
      gl.deleteProgram(prog);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }

  /* ─── Expose globally ───────────────────────────────────────── */
  window.Plasma = { init: initPlasma };
})();
