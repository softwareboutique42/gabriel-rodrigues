import * as THREE from 'three';

export function createTextSprite(text: string, color: string, fontSize = 64): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
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
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  const scale = fontSize / 32;
  sprite.scale.set(scale * aspect, scale, 1);

  return sprite;
}
