import * as THREE from 'three';
import type { CompanyConfig } from '../types';
import { getIconDrawFn } from './draw';

const ICON_CANVAS_SIZE = 128;

/**
 * Creates an animated industry icon sprite and adds it to the scene.
 * Returns an update function to be called each frame.
 */
export function createIndustryIcon(
  scene: THREE.Scene,
  config: CompanyConfig,
): (elapsed: number) => void {
  const drawFn = getIconDrawFn(config.industry);

  // Draw icon to an offscreen canvas as white template
  const canvas = document.createElement('canvas');
  canvas.width = ICON_CANVAS_SIZE;
  canvas.height = ICON_CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, '#ffffff');

  // Convert to Three.js sprite
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const accentColor = new THREE.Color(config.colors.accent);
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: accentColor,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const sprite = new THREE.Sprite(material);
  const scale = 3.5;
  sprite.scale.set(scale, scale, 1);

  // Position: bottom-right corner
  sprite.position.set(7, -6, 2);

  scene.add(sprite);

  // Return the per-frame update function
  return (elapsed: number) => {
    // Fade in over 1.5 seconds
    const fadeIn = Math.min(1, elapsed / 1.5);
    const baseOpacity = 0.15 + fadeIn * 0.1;
    material.opacity = baseOpacity;

    // Gentle float: slow up/down bob
    sprite.position.y = -6 + Math.sin(elapsed * 0.5) * 0.3;

    // Subtle pulse: scale oscillation
    const pulse = 1 + Math.sin(elapsed * 0.8) * 0.03;
    sprite.scale.set(scale * pulse, scale * pulse, 1);

    // Slow rotation
    material.rotation = Math.sin(elapsed * 0.3) * 0.08;
  };
}
