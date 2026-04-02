import * as THREE from 'three';

/**
 * Creates a 64x64 radial gradient texture suitable for PointsMaterial rendering.
 * The texture fades from solid white in the center to transparent at edges,
 * creating soft round particles.
 */
export function createRadialParticleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Create radial gradient from center (white, opaque) to edges (transparent)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// Cache the texture to avoid recreating it for every material
let cachedRadialTexture: THREE.Texture | null = null;

/**
 * Gets or creates the shared radial particle texture.
 * Uses a cache to avoid recreating the texture multiple times.
 */
export function getRadialParticleTexture(): THREE.Texture {
  if (!cachedRadialTexture) {
    cachedRadialTexture = createRadialParticleTexture();
  }
  return cachedRadialTexture;
}
