import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class SpotlightAnimation extends BaseAnimation {
  private words: THREE.Sprite[] = [];
  private ring!: THREE.Mesh;
  private particles!: THREE.Points;

  protected createScene(): void {
    const elements = this.config.visualElements.slice(0, 5);
    const primaryColor = this.hexToColor(this.config.colors.primary);
    const secondaryColor = this.hexToColor(this.config.colors.secondary);
    const accentColor = this.hexToColor(this.config.colors.accent);
    const colors = [
      this.config.colors.primary,
      this.config.colors.secondary,
      this.config.colors.accent,
    ];

    // Central spotlight ring
    const ringGeo = new THREE.RingGeometry(3.5, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.position.z = 0.2;
    this.scene.add(this.ring);

    // Inner glow disc
    const glowGeo = new THREE.CircleGeometry(3.5, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = 0.1;
    glow.userData = { isGlow: true };
    this.scene.add(glow);

    // Word sprites — one per element, centered
    elements.forEach((word, i) => {
      const sprite = createTextSprite(word.toUpperCase(), colors[i % colors.length], 56);
      sprite.position.set(0, 0, 1);
      sprite.material.opacity = 0;
      sprite.userData = { index: i, total: elements.length };
      this.scene.add(sprite);
      this.words.push(sprite);
    });

    // Radial particle burst
    const count = Math.floor(150 * this.config.animationParams.density);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 10;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = -0.5;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.08,
      color: secondaryColor,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particles);

    // Outer accent ring
    const outerGeo = new THREE.RingGeometry(5.5, 5.7, 64);
    const outerMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.position.z = 0.05;
    outer.userData = { isOuterRing: true };
    this.scene.add(outer);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const total = this.words.length;
    const segmentDuration = 1 / total;

    // Ring fades in during first 10%
    const ringOpacity = Math.min(progress / 0.1, 1) * 0.3;
    (this.ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
    this.ring.rotation.z = elapsed * speed * 0.2;
    const ringPulse = 1 + Math.sin(elapsed * 2) * 0.05;
    this.ring.scale.setScalar(ringPulse);

    // Inner glow + outer ring
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.isGlow) {
        (child.material as THREE.MeshBasicMaterial).opacity = ringOpacity * 0.08;
        const pulse = 1 + Math.sin(elapsed * 1.5) * 0.03;
        child.scale.setScalar(pulse);
      }
      if (child instanceof THREE.Mesh && child.userData.isOuterRing) {
        (child.material as THREE.MeshBasicMaterial).opacity = ringOpacity * 0.4;
        child.rotation.z = -elapsed * speed * 0.15;
      }
    });

    // Words cycle: fade in → zoom → hold → fade out
    this.words.forEach((sprite) => {
      const { index } = sprite.userData;
      const segStart = index * segmentDuration;
      const segEnd = segStart + segmentDuration;
      const localProgress = (progress - segStart) / segmentDuration;

      if (progress >= segStart && progress < segEnd) {
        let opacity: number;
        let scale: number;
        if (localProgress < 0.15) {
          // Zoom in from small
          const t = localProgress / 0.15;
          opacity = t;
          scale = 0.5 + t * 0.5;
        } else if (localProgress < 0.75) {
          // Hold with gentle pulse
          opacity = 1;
          scale = 1 + Math.sin(elapsed * 3) * 0.05;
        } else {
          // Zoom out and fade
          const t = (localProgress - 0.75) / 0.25;
          opacity = 1 - t;
          scale = 1 + t * 0.3;
        }
        sprite.material.opacity = opacity;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale * baseScale * 1.5, scale * 1.5, 1);
      } else {
        sprite.material.opacity = 0;
      }
    });

    // Particles rotate slowly
    this.particles.rotation.z = elapsed * speed * 0.05;
    (this.particles.material as THREE.PointsMaterial).opacity =
      0.1 + Math.sin(elapsed * 0.8) * 0.05;
  }
}
