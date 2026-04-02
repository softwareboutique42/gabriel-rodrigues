import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createCharacterSprites, createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class NarrativeAnimation extends BaseAnimation {
  private nameChars: THREE.Sprite[] = [];
  private supportingWords: THREE.Sprite[] = [];
  private particles!: THREE.Points;
  private particleBasePositions: Float32Array = new Float32Array(0);

  protected createScene(): void {
    const moodPreset = this.getMoodPreset();
    const renderProfile = this.getRenderProfile();
    const companyName = this.config.companyName.trim().toUpperCase() || 'COMPANY';

    const { sprites, totalWidth } = createCharacterSprites(
      companyName,
      this.config.colors.primary,
      108,
    );
    let cursorX = -totalWidth / 2;
    sprites.forEach((sprite, index) => {
      const halfWidth = sprite.scale.x / 2;
      cursorX += halfWidth;
      sprite.position.set(cursorX, 1.2, 1.4);
      sprite.userData = { index, baseX: cursorX, baseY: 1.2 };
      this.scene.add(sprite);
      this.nameChars.push(sprite);
      cursorX += halfWidth;
    });

    const labels = this.config.visualElements.slice(0, 4);
    labels.forEach((word, i) => {
      const sprite = createTextSprite(word.toUpperCase(), this.config.colors.secondary, 30);
      sprite.position.set((i - (labels.length - 1) / 2) * 3.1, -2.9 + (i % 2) * 0.4, 0.55);
      sprite.material.opacity = 0;
      sprite.userData = { index: i, baseY: sprite.position.y };
      this.scene.add(sprite);
      this.supportingWords.push(sprite);
    });

    const count = this.getParticleBudget(Math.floor(180 * this.config.animationParams.density));
    const positions = new Float32Array(count * 3);
    this.particleBasePositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = -2 + Math.random() * 1.2;

      this.particleBasePositions[i3] = positions[i3];
      this.particleBasePositions[i3 + 1] = positions[i3 + 1];
      this.particleBasePositions[i3 + 2] = positions[i3 + 2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color(this.config.colors.primary),
      transparent: true,
      opacity: Math.min(0.4, 0.32 * renderProfile.opacity),
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(geo, mat);
    this.particles.rotation.z = moodPreset.overshoot * 0.1;
    this.scene.add(this.particles);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const moodPreset = this.getMoodPreset();
    const revealStart = 0.06;
    const charStagger = Math.min(0.06, Math.max(0.02, moodPreset.staggerStep * 0.55));
    const holdRatio = Math.min(0.8, Math.max(0.4, moodPreset.holdRatio));

    this.nameChars.forEach((sprite) => {
      const { index, baseX, baseY } = sprite.userData as {
        index: number;
        baseX: number;
        baseY: number;
      };
      const charStart = revealStart + index * charStagger;
      const revealDuration = 0.16;
      const holdEnd = Math.min(0.95, charStart + revealDuration + holdRatio * 0.28);

      if (progress < charStart) {
        sprite.material.opacity = 0;
        sprite.position.y = baseY - 0.5;
        return;
      }

      if (progress <= charStart + revealDuration) {
        const t = (progress - charStart) / revealDuration;
        const eased = Math.pow(t, 0.75);
        sprite.material.opacity = eased;
        sprite.position.x = baseX;
        sprite.position.y = baseY - (1 - eased) * (1 + moodPreset.overshoot);
        const scale = 0.86 + eased * (0.28 + moodPreset.intensityScale * 0.08);
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(scale * baseScale, scale, 1);
        return;
      }

      if (progress <= holdEnd) {
        const pulse =
          1 + Math.sin(elapsed * (1.4 + moodPreset.intensityScale * 0.8) + index * 0.22) * 0.04;
        sprite.material.opacity = 1;
        sprite.position.x = baseX;
        sprite.position.y = baseY + Math.sin(elapsed * 1.2 + index * 0.25) * 0.05;
        const baseScale = sprite.scale.x / sprite.scale.y;
        sprite.scale.set(baseScale * pulse, pulse, 1);
        return;
      }

      const fade = Math.min(1, (progress - holdEnd) / 0.14);
      sprite.material.opacity = 1 - fade;
      sprite.position.x = baseX;
      sprite.position.y = baseY + fade * 0.25;
    });

    this.supportingWords.forEach((sprite) => {
      const { index, baseY } = sprite.userData as { index: number; baseY: number };
      const revealAt = 0.34 + index * 0.06;
      const fadeIn = Math.min(1, Math.max(0, (progress - revealAt) / 0.12));
      const fadeOut = Math.min(1, Math.max(0, (progress - 0.9) / 0.1));
      sprite.material.opacity = fadeIn * (1 - fadeOut) * 0.72;
      sprite.position.y = baseY + Math.sin(elapsed * 1.1 + index * 0.6) * 0.06;
    });

    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] =
        this.particleBasePositions[i3] + Math.cos(elapsed * speed * 0.4 + i * 0.09) * 0.2;
      positions[i3 + 1] =
        this.particleBasePositions[i3 + 1] +
        Math.sin(elapsed * speed * (0.6 + moodPreset.intensityScale * 0.3) + i * 0.11) * 0.25;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.z = Math.sin(progress * Math.PI * 2) * 0.05;
  }
}
