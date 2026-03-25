import type { CompanyConfig } from './types';

const THREE_CDN = 'https://unpkg.com/three@0.183.2/build/three.module.js';

function generateAnimationCode(config: CompanyConfig): string {
  const { animationStyle, animationParams } = config;
  const speed = animationParams.speed;
  const density = animationParams.density;
  const complexity = animationParams.complexity;

  switch (animationStyle) {
    case 'particles':
      return `
class Animation {
  setup(scene, config) {
    const count = Math.floor(800 * ${density});
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.15,
      color: new THREE.Color(config.colors.primary),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(geo, mat);
    scene.add(this.points);
    this.positions = pos;
    this.count = count;
  }
  update(elapsed) {
    const t = elapsed * ${speed};
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      pos[i * 3 + 1] += Math.sin(t + i * 0.1) * 0.005;
      pos[i * 3] += Math.cos(t + i * 0.05) * 0.003;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.rotation.z = Math.sin(t * 0.1) * 0.05;
  }
}`;

    case 'flowing':
      return `
class Animation {
  setup(scene, config) {
    this.curves = [];
    const count = Math.floor(12 * ${density});
    for (let i = 0; i < count; i++) {
      const points = [];
      const y = (i / count - 0.5) * 16;
      for (let j = 0; j <= 60; j++) {
        const x = (j / 60 - 0.5) * 30;
        points.push(new THREE.Vector3(x, y, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? new THREE.Color(config.colors.primary) : new THREE.Color(config.colors.secondary),
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      this.curves.push({ line, baseY: y, points: geo.attributes.position.array });
    }
  }
  update(elapsed) {
    const t = elapsed * ${speed};
    this.curves.forEach((c, ci) => {
      const arr = c.points;
      for (let j = 0; j <= 60; j++) {
        arr[j * 3 + 1] = c.baseY + Math.sin(t + j * 0.15 + ci * 0.5) * ${complexity} * 2;
      }
      c.line.geometry.attributes.position.needsUpdate = true;
      c.line.material.opacity = 0.3 + Math.sin(t + ci) * 0.3;
    });
  }
}`;

    case 'geometric':
      return `
class Animation {
  setup(scene, config) {
    this.rings = [];
    const count = Math.floor(20 * ${density});
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];
    for (let i = 0; i < count; i++) {
      const inner = 0.3 + Math.random() * 0.5;
      const outer = inner + 0.2 + Math.random() * 0.3;
      const segments = [3, 4, 6][Math.floor(Math.random() * 3)];
      const geo = new THREE.RingGeometry(inner, outer, segments);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors[i % colors.length]),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, 0);
      scene.add(mesh);
      this.rings.push({ mesh, baseX: mesh.position.x, baseY: mesh.position.y, phase: Math.random() * Math.PI * 2 });
    }
  }
  update(elapsed) {
    const t = elapsed * ${speed};
    this.rings.forEach((r) => {
      r.mesh.rotation.z = t * 0.3 + r.phase;
      r.mesh.position.x = r.baseX + Math.sin(t + r.phase) * 0.5;
      r.mesh.position.y = r.baseY + Math.cos(t * 0.7 + r.phase) * 0.3;
      const s = 0.8 + Math.sin(t * 1.5 + r.phase) * 0.2;
      r.mesh.scale.set(s, s, 1);
    });
  }
}`;

    case 'typographic':
      return `
class Animation {
  setup(scene, config) {
    this.tiles = [];
    const cols = Math.floor(12 * ${density});
    const rows = Math.floor(8 * ${density});
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const geo = new THREE.PlaneGeometry(0.8, 0.8);
        const isColored = Math.random() > 0.6;
        const mat = new THREE.MeshBasicMaterial({
          color: isColored ? new THREE.Color(colors[Math.floor(Math.random() * colors.length)]) : new THREE.Color(config.colors.background),
          transparent: true,
          opacity: isColored ? 0.7 : 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const x = (c - cols / 2) * 1.1;
        const y = (r - rows / 2) * 1.1;
        mesh.position.set(x, y, 0);
        scene.add(mesh);
        this.tiles.push({ mesh, isColored, delay: (r + c) * 0.1 });
      }
    }
  }
  update(elapsed) {
    const t = elapsed * ${speed};
    this.tiles.forEach((tile) => {
      if (tile.isColored) {
        const wave = Math.sin(t * 2 + tile.delay) * 0.5 + 0.5;
        tile.mesh.material.opacity = 0.3 + wave * 0.7;
        const s = 0.9 + wave * 0.15;
        tile.mesh.scale.set(s, s, 1);
      }
    });
  }
}`;
  }
}

export function generateExportHTML(config: CompanyConfig, version: string): string {
  const animCode = generateAnimationCode(config);
  const configJSON = JSON.stringify(config);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.companyName} - Brand Animation</title>
  <meta name="generator" content="Company Canvas ${version} by Gabriel Rodrigues">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${config.colors.background}; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .overlay {
      position: fixed; bottom: 2rem; left: 2rem; z-index: 10;
      pointer-events: none;
    }
    .overlay h1 {
      font-size: clamp(1.5rem, 5vw, 3rem);
      font-weight: 700;
      color: ${config.colors.primary};
      letter-spacing: -0.03em;
      text-shadow: 0 2px 20px rgba(0,0,0,0.8);
    }
    .overlay p {
      font-size: clamp(0.75rem, 1.5vw, 1rem);
      color: ${config.colors.secondary};
      margin-top: 0.25rem;
      font-family: monospace;
      text-shadow: 0 1px 10px rgba(0,0,0,0.8);
    }
    .watermark {
      position: fixed; bottom: 0.5rem; right: 0.75rem;
      font-size: 0.6rem; color: rgba(255,255,255,0.2);
      font-family: monospace; pointer-events: none;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="overlay">
    <h1>${config.companyName}</h1>
    <p>${config.tagline}</p>
  </div>
  <div class="watermark">Company Canvas ${version} &mdash; gabriel-rodrigues.com</div>

  <script type="importmap">
    { "imports": { "three": "${THREE_CDN}" } }
  </script>
  <script type="module">
    import * as THREE from 'three';

    const config = ${configJSON};

    ${animCode}

    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(config.colors.background), 1);

    const aspect = window.innerWidth / window.innerHeight;
    const frustum = 10;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 100
    );
    camera.position.z = 10;

    const scene = new THREE.Scene();
    const anim = new Animation();
    anim.setup(scene, config);

    const clock = new THREE.Clock();
    function loop() {
      requestAnimationFrame(loop);
      anim.update(clock.getElapsedTime());
      renderer.render(scene, camera);
    }
    loop();

    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      const a = w / h;
      camera.left = -frustum * a;
      camera.right = frustum * a;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  </script>
</body>
</html>`;
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
