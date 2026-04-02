import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class NarrativeAnimation extends BaseAnimation {
  private words: THREE.Sprite[] = [];
  private particles!: THREE.Points;

  protected createScene(): void {
    const elements = this.config.visualElements.slice(0, 5);
    const colors = [
      this.config.colors.primary,
      this.config.colors.secondary,
      this.config.colors.accent,
    ];

    elements.forEach((word, i) => {
      const sprite = createTextSprite(word.toUpperCase(), colors[i % colors.length], 48);
      sprite.position.set(0, 0, 1);
      sprite.material.opacity = 0;
      sprite.userData = { index: i, total: elements.length };
      this.scene.add(sprite);
      this.words.push(sprite);
    });

    // Background ambient particles
    const count = Math.floor(200 * this.config.animationParams.density);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = -1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color(this.config.colors.primary),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const total = this.words.length;
    const segmentDuration = 1 / total;

    this.words.forEach((sprite) => {
      const { index } = sprite.userData;
      const segStart = index * segmentDuration;
      const segEnd = segStart + segmentDuration;
      const localProgress = (progress - segStart) / segmentDuration;

      if (progress >= segStart && progress < segEnd) {
        // Fade in (0-0.2), hold (0.2-0.7), fade out (0.7-1.0)
        let opacity: number;
        if (localProgress < 0.2) {
          opacity = localProgress / 0.2;
        } else if (localProgress < 0.7) {
          opacity = 1;
        } else {
          opacity = 1 - (localProgress - 0.7) / 0.3;
        }
        sprite.material.opacity = opacity;

        // Rise from below
        const yOffset = (1 - localProgress) * -2;
        sprite.position.y = yOffset;

        // Slight scale pulse
        const scale = 0.9 + localProgress * 0.1;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale * baseScale * 1.5, scale * 1.5, 1);
      } else {
        sprite.material.opacity = 0;
      }
    });

    // Ambient particle drift
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(elapsed * speed + i * 0.1) * 0.003;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
