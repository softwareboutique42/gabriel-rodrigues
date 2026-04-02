import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createCharacterSprites, createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class SpotlightAnimation extends BaseAnimation {
  private nameChars: THREE.Sprite[] = [];
  private satellites: THREE.Sprite[] = [];
  private ring!: THREE.Mesh;
  private glow!: THREE.Mesh;
  private outerRing!: THREE.Mesh;
  private particles!: THREE.Points;

  protected createScene(): void {
    const moodPreset = this.getMoodPreset();
    const renderProfile = this.getRenderProfile();
    const elements = this.config.visualElements.slice(0, 5);
    const companyName = this.config.companyName.trim().toUpperCase() || 'COMPANY';
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
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
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
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.glow.position.z = 0.1;
    this.scene.add(this.glow);

    const { sprites, totalWidth } = createCharacterSprites(
      companyName,
      this.config.colors.primary,
      112,
    );
    let cursorX = -totalWidth / 2;
    sprites.forEach((sprite, index) => {
      const halfWidth = sprite.scale.x / 2;
      cursorX += halfWidth;
      sprite.position.set(cursorX, 0.4, 1.3);
      sprite.userData = { index, baseX: cursorX, baseY: 0.4 };
      this.scene.add(sprite);
      this.nameChars.push(sprite);
      cursorX += halfWidth;
    });

    elements.forEach((word, i) => {
      const angle = (i / Math.max(1, elements.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = 6.6 + (i % 2) * 0.7;
      const sprite = createTextSprite(word.toUpperCase(), colors[i % colors.length], 28);
      sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.9);
      sprite.material.opacity = 0;
      sprite.userData = { angle, radius, index: i };
      this.scene.add(sprite);
      this.satellites.push(sprite);
    });

    const count = this.getParticleBudget(Math.floor(150 * this.config.animationParams.density));
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
      opacity: 0.15 * renderProfile.opacity,
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(partGeo, partMat);
    this.particles.rotation.z = moodPreset.overshoot * 0.2;
    this.scene.add(this.particles);

    // Outer accent ring
    const outerGeo = new THREE.RingGeometry(5.5, 5.7, 64);
    const outerMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    this.outerRing = new THREE.Mesh(outerGeo, outerMat);
    this.outerRing.position.z = 0.05;
    this.scene.add(this.outerRing);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const moodPreset = this.getMoodPreset();
    const charStagger = Math.min(0.06, Math.max(0.02, moodPreset.staggerStep * 0.5));
    const holdRatio = Math.min(0.82, Math.max(0.42, moodPreset.holdRatio));

    const ringOpacity = Math.min(progress / 0.1, 1) * (0.24 + moodPreset.intensityScale * 0.12);
    (this.ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
    this.ring.rotation.z = elapsed * speed * 0.2;
    const ringPulse = 1 + Math.sin(elapsed * 2) * (0.04 + moodPreset.overshoot * 0.08);
    this.ring.scale.setScalar(ringPulse);

    (this.glow.material as THREE.MeshBasicMaterial).opacity = ringOpacity * 0.1;
    this.glow.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.03);

    (this.outerRing.material as THREE.MeshBasicMaterial).opacity = ringOpacity * 0.5;
    this.outerRing.rotation.z = -elapsed * speed * 0.15;

    this.nameChars.forEach((sprite) => {
      const { index, baseX, baseY } = sprite.userData as {
        index: number;
        baseX: number;
        baseY: number;
      };
      const revealStart = 0.08 + index * charStagger;
      const revealEnd = revealStart + 0.14;
      const holdEnd = revealEnd + holdRatio * 0.26;

      if (progress < revealStart) {
        sprite.material.opacity = 0;
        sprite.position.x = baseX;
        sprite.position.y = baseY - 0.7;
        return;
      }

      if (progress <= revealEnd) {
        const t = (progress - revealStart) / (revealEnd - revealStart);
        const eased = 1 - Math.pow(1 - t, 3);
        sprite.material.opacity = eased;
        sprite.position.x = baseX;
        sprite.position.y = baseY - (1 - eased) * (0.8 + moodPreset.overshoot * 0.7);
        const scale = 0.8 + eased * (0.34 + moodPreset.intensityScale * 0.08);
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale * baseScale, scale, 1);
        return;
      }

      if (progress <= holdEnd) {
        const pulse =
          1 + Math.sin(elapsed * (2.2 + moodPreset.intensityScale * 0.6) + index * 0.2) * 0.05;
        sprite.material.opacity = 1;
        sprite.position.x = baseX;
        sprite.position.y = baseY + Math.sin(elapsed * 1.2 + index * 0.17) * 0.04;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(baseScale * pulse, pulse, 1);
        return;
      }

      const fade = Math.min(1, (progress - holdEnd) / 0.14);
      sprite.material.opacity = 1 - fade;
      sprite.position.x = baseX;
      sprite.position.y = baseY + fade * 0.24;
    });

    this.satellites.forEach((sprite) => {
      const { angle, radius, index } = sprite.userData as {
        angle: number;
        radius: number;
        index: number;
      };
      const revealAt = 0.36 + index * 0.05;
      const fadeIn = Math.min(1, Math.max(0, (progress - revealAt) / 0.12));
      const fadeOut = Math.min(1, Math.max(0, (progress - 0.92) / 0.08));
      sprite.material.opacity = fadeIn * (1 - fadeOut) * 0.7;
      const orbit = elapsed * speed * 0.1 + index * 0.3;
      sprite.position.x = Math.cos(angle + orbit) * radius;
      sprite.position.y = Math.sin(angle + orbit) * radius;
    });

    this.particles.rotation.z = elapsed * speed * 0.05;
    (this.particles.material as THREE.PointsMaterial).opacity =
      (0.1 + Math.sin(elapsed * 0.8) * 0.05) * (0.9 + moodPreset.intensityScale * 0.05);
  }
}
