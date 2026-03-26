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

    case 'narrative':
    case 'timeline':
    case 'constellation':
    case 'spotlight':
      return generateV2AnimationCode(config);
  }
}

function createTextSpriteCode(): string {
  return `
function createTextSprite(text, color, fontSize) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = 'bold ' + fontSize + "px 'Segoe UI', system-ui, sans-serif";
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const padding = fontSize * 0.4;
  canvas.width = Math.ceil(metrics.width + padding * 2);
  canvas.height = Math.ceil(fontSize * 1.4 + padding * 2);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  const scale = fontSize / 32;
  sprite.scale.set(scale * aspect, scale, 1);
  return sprite;
}`;
}

function generateV2AnimationCode(config: CompanyConfig): string {
  const { animationStyle, animationParams } = config;
  const speed = animationParams.speed;
  const density = animationParams.density;
  const elements = JSON.stringify((config.visualElements ?? []).slice(0, 5));
  const LOOP_DURATION = 12;

  const textHelper = createTextSpriteCode();

  switch (animationStyle) {
    case 'narrative':
      return `
${textHelper}
class Animation {
  setup(scene, config) {
    this.words = [];
    const elements = ${elements};
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];
    elements.forEach((word, i) => {
      const sprite = createTextSprite(word.toUpperCase(), colors[i % colors.length], 48);
      sprite.position.set(0, 0, 1);
      sprite.material.opacity = 0;
      sprite.userData = { index: i, total: elements.length };
      scene.add(sprite);
      this.words.push(sprite);
    });
    const count = Math.floor(200 * ${density});
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = -1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ size: 0.06, color: new THREE.Color(config.colors.primary), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    this.particles = new THREE.Points(geo, mat);
    scene.add(this.particles);
  }
  update(elapsed) {
    const progress = (elapsed % ${LOOP_DURATION}) / ${LOOP_DURATION};
    const total = this.words.length;
    const seg = 1 / total;
    this.words.forEach((sprite) => {
      const { index } = sprite.userData;
      const segStart = index * seg;
      const lp = (progress - segStart) / seg;
      if (progress >= segStart && progress < segStart + seg) {
        let opacity;
        if (lp < 0.2) opacity = lp / 0.2;
        else if (lp < 0.7) opacity = 1;
        else opacity = 1 - (lp - 0.7) / 0.3;
        sprite.material.opacity = opacity;
        sprite.position.y = (1 - lp) * -2;
        const scale = 0.9 + lp * 0.1;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale * baseScale * 1.5, scale * 1.5, 1);
      } else { sprite.material.opacity = 0; }
    });
    const pos = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 3; i++) pos[i * 3 + 1] += Math.sin(elapsed * ${speed} + i * 0.1) * 0.003;
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}`;

    case 'timeline':
      return `
${textHelper}
class Animation {
  setup(scene, config) {
    this.nodes = [];
    this.labels = [];
    this.connectors = [];
    const elements = ${elements};
    const primaryColor = new THREE.Color(config.colors.primary);
    const secondaryColor = new THREE.Color(config.colors.secondary);
    const accentColor = new THREE.Color(config.colors.accent);
    const spread = 22;
    const nodeCount = elements.length;
    const linePoints = [new THREE.Vector3(-spread/2-2, 0, 0), new THREE.Vector3(spread/2+2, 0, 0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.3 });
    this.mainLine = new THREE.Line(lineGeo, lineMat);
    scene.add(this.mainLine);
    elements.forEach((word, i) => {
      const x = (i / (nodeCount - 1) - 0.5) * spread;
      const nodeGeo = new THREE.CircleGeometry(0.25, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? accentColor : secondaryColor, transparent: true, opacity: 0 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, 0, 0.5);
      node.userData = { index: i, total: nodeCount };
      scene.add(node);
      this.nodes.push(node);
      const yDir = i % 2 === 0 ? 1 : -1;
      const connPoints = [new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, yDir * 2.5, 0)];
      const connGeo = new THREE.BufferGeometry().setFromPoints(connPoints);
      const connMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0 });
      const conn = new THREE.Line(connGeo, connMat);
      conn.userData = { index: i };
      scene.add(conn);
      this.connectors.push(conn);
      const label = createTextSprite(word.toUpperCase(), i % 2 === 0 ? config.colors.accent : config.colors.secondary, 36);
      label.position.set(x, yDir * 3.5, 1);
      label.material.opacity = 0;
      label.userData = { index: i };
      scene.add(label);
      this.labels.push(label);
    });
  }
  update(elapsed) {
    const progress = (elapsed % ${LOOP_DURATION}) / ${LOOP_DURATION};
    const total = this.nodes.length;
    this.mainLine.material.opacity = Math.min(progress / 0.15, 1) * 0.4;
    this.nodes.forEach((node) => {
      const { index } = node.userData;
      const revealAt = 0.1 + (index / total) * 0.6;
      const lp = Math.max(0, (progress - revealAt) / 0.12);
      const opacity = Math.min(lp, 1);
      node.material.opacity = opacity;
      node.scale.setScalar(1 + Math.sin(elapsed * 3 + index * 1.5) * 0.15 * opacity);
    });
    this.connectors.forEach((conn) => {
      const { index } = conn.userData;
      const revealAt = 0.15 + (index / total) * 0.6;
      conn.material.opacity = Math.min(Math.max(0, (progress - revealAt) / 0.1), 1) * 0.3;
    });
    this.labels.forEach((label) => {
      const { index } = label.userData;
      const revealAt = 0.2 + (index / total) * 0.6;
      label.material.opacity = Math.min(Math.max(0, (progress - revealAt) / 0.1), 1);
    });
  }
}`;

    case 'constellation':
      return `
${textHelper}
class Animation {
  setup(scene, config) {
    this.stars = [];
    this.connections = [];
    this.labels = [];
    this.nodePositions = [];
    const elements = ${elements};
    const primaryColor = new THREE.Color(config.colors.primary);
    const secondaryColor = new THREE.Color(config.colors.secondary);
    const accentColor = new THREE.Color(config.colors.accent);
    const colors = [primaryColor, secondaryColor, accentColor];
    const colorHex = [config.colors.primary, config.colors.secondary, config.colors.accent];
    const radius = 6;
    elements.forEach((word, i) => {
      const angle = (i / elements.length) * Math.PI * 2 - Math.PI / 2;
      const r = radius + (Math.random() - 0.5) * 3;
      const pos = new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      this.nodePositions.push(pos);
      const starGeo = new THREE.CircleGeometry(0.2, 16);
      const starMat = new THREE.MeshBasicMaterial({ color: colors[i % 3], transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.copy(pos); star.position.z = 0.5;
      star.userData = { index: i, total: elements.length };
      scene.add(star);
      this.stars.push(star);
      const label = createTextSprite(word.toUpperCase(), colorHex[i % 3], 32);
      label.position.set(pos.x, pos.y - 1.2, 1);
      label.material.opacity = 0;
      label.userData = { index: i };
      scene.add(label);
      this.labels.push(label);
    });
    for (let i = 0; i < this.nodePositions.length; i++) {
      const next = (i + 1) % this.nodePositions.length;
      const points = [this.nodePositions[i], this.nodePositions[next]];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const line = new THREE.Line(geo, mat);
      line.userData = { index: i };
      scene.add(line);
      this.connections.push(line);
    }
    const bgCount = Math.floor(100 * ${density});
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      bgPos[i*3] = (Math.random()-0.5)*35; bgPos[i*3+1] = (Math.random()-0.5)*25; bgPos[i*3+2] = -1;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ size: 0.04, color: secondaryColor, transparent: true, opacity: 0.2 })));
  }
  update(elapsed) {
    const progress = (elapsed % ${LOOP_DURATION}) / ${LOOP_DURATION};
    const total = this.stars.length;
    this.stars.forEach((star) => {
      const { index } = star.userData;
      const revealAt = (index / total) * 0.5;
      const opacity = Math.min(Math.max(0, (progress - revealAt) / 0.1), 1);
      star.material.opacity = opacity * 0.9;
      const basePos = this.nodePositions[index];
      const orbitR = 0.3 * Math.sin(elapsed * ${speed} * 0.5 + index);
      star.position.x = basePos.x + Math.cos(elapsed * ${speed} * 0.3 + index * 2) * orbitR;
      star.position.y = basePos.y + Math.sin(elapsed * ${speed} * 0.3 + index * 2) * orbitR;
      star.scale.setScalar(1 + Math.sin(elapsed * 2 + index * 1.2) * 0.3);
    });
    this.connections.forEach((line, i) => {
      const revealAt = 0.1 + (i / total) * 0.5;
      line.material.opacity = Math.min(Math.max(0, (progress - revealAt) / 0.15), 1) * 0.25;
      const pos = line.geometry.attributes.position.array;
      const next = (i + 1) % this.stars.length;
      pos[0] = this.stars[i].position.x; pos[1] = this.stars[i].position.y;
      pos[3] = this.stars[next].position.x; pos[4] = this.stars[next].position.y;
      line.geometry.attributes.position.needsUpdate = true;
    });
    this.labels.forEach((label) => {
      const { index } = label.userData;
      const revealAt = 0.15 + (index / total) * 0.5;
      label.material.opacity = Math.min(Math.max(0, (progress - revealAt) / 0.1), 1) * 0.85;
      label.position.x = this.stars[index].position.x;
      label.position.y = this.stars[index].position.y - 1.2;
    });
  }
}`;

    case 'spotlight':
      return `
${textHelper}
class Animation {
  setup(scene, config) {
    this.words = [];
    const elements = ${elements};
    const primaryColor = new THREE.Color(config.colors.primary);
    const secondaryColor = new THREE.Color(config.colors.secondary);
    const accentColor = new THREE.Color(config.colors.accent);
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];
    const ringGeo = new THREE.RingGeometry(3.5, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.position.z = 0.2;
    scene.add(this.ring);
    const glowGeo = new THREE.CircleGeometry(3.5, 64);
    const glowMat = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.glow.position.z = 0.1;
    scene.add(this.glow);
    elements.forEach((word, i) => {
      const sprite = createTextSprite(word.toUpperCase(), colors[i % colors.length], 56);
      sprite.position.set(0, 0, 1);
      sprite.material.opacity = 0;
      sprite.userData = { index: i, total: elements.length };
      scene.add(sprite);
      this.words.push(sprite);
    });
    const count = Math.floor(150 * ${density});
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 10;
      positions[i*3] = Math.cos(angle)*r; positions[i*3+1] = Math.sin(angle)*r; positions[i*3+2] = -0.5;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.08, color: secondaryColor, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending }));
    scene.add(this.particles);
    const outerGeo = new THREE.RingGeometry(5.5, 5.7, 64);
    this.outerRing = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    this.outerRing.position.z = 0.05;
    scene.add(this.outerRing);
  }
  update(elapsed) {
    const progress = (elapsed % ${LOOP_DURATION}) / ${LOOP_DURATION};
    const total = this.words.length;
    const seg = 1 / total;
    const ringOpacity = Math.min(progress / 0.1, 1) * 0.3;
    this.ring.material.opacity = ringOpacity;
    this.ring.rotation.z = elapsed * ${speed} * 0.2;
    this.ring.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.05);
    this.glow.material.opacity = ringOpacity * 0.08;
    this.glow.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.03);
    this.outerRing.material.opacity = ringOpacity * 0.4;
    this.outerRing.rotation.z = -elapsed * ${speed} * 0.15;
    this.words.forEach((sprite) => {
      const { index } = sprite.userData;
      const segStart = index * seg;
      const lp = (progress - segStart) / seg;
      if (progress >= segStart && progress < segStart + seg) {
        let opacity, scale;
        if (lp < 0.15) { const t = lp/0.15; opacity = t; scale = 0.5+t*0.5; }
        else if (lp < 0.75) { opacity = 1; scale = 1+Math.sin(elapsed*3)*0.05; }
        else { const t = (lp-0.75)/0.25; opacity = 1-t; scale = 1+t*0.3; }
        sprite.material.opacity = opacity;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale*baseScale*1.5, scale*1.5, 1);
      } else { sprite.material.opacity = 0; }
    });
    this.particles.rotation.z = elapsed * ${speed} * 0.05;
    this.particles.material.opacity = 0.1 + Math.sin(elapsed * 0.8) * 0.05;
  }
}`;

    default:
      return '';
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
