import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createCharacterSprites } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class PulseAnimation extends BaseAnimation {
  private rings: THREE.Mesh[] = [];
  private centerChars: THREE.Sprite[] = [];
  private particles!: THREE.Points;

  protected createScene(): void {
    const renderProfile = this.getRenderProfile();
    const moodPreset = this.getMoodPreset();
    const companyName = this.config.companyName.trim().toUpperCase() || 'COMPANY';
    const colors = [
      new THREE.Color(this.config.colors.primary),
      new THREE.Color(this.config.colors.secondary),
      new THREE.Color(this.config.colors.accent),
    ];

    const { sprites, totalWidth } = createCharacterSprites(
      companyName,
      this.config.colors.primary,
      108,
    );
    let cursorX = -totalWidth / 2;
    sprites.forEach((sprite, index) => {
      const halfWidth = sprite.scale.x / 2;
      cursorX += halfWidth;
      sprite.position.set(cursorX, 0, 1.3);
      sprite.material.opacity = 0;
      sprite.userData = { index, baseX: cursorX, baseY: 0 };
      this.scene.add(sprite);
      this.centerChars.push(sprite);
      cursorX += halfWidth;
    });

    const ringCount = 7;
    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.RingGeometry(1.05, 1.2, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending:
          renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.15 - i * 0.015;
      ring.userData = {
        phaseOffset: i / ringCount,
        sizeBias: 0.5 + (i % 3) * 0.12,
      };
      this.scene.add(ring);
      this.rings.push(ring);
    }

    const particleCount = this.getParticleBudget(
      Math.floor(140 * this.config.animationParams.density),
    );
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 11;
      particlePositions[i3] = Math.cos(angle) * radius;
      particlePositions[i3 + 1] = Math.sin(angle) * radius;
      particlePositions[i3 + 2] = -0.8 + Math.random() * 0.3;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      color: colors[1],
      transparent: true,
      opacity: 0.18 * renderProfile.opacity,
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.particles.rotation.z = moodPreset.overshoot * 0.1;
    this.scene.add(this.particles);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const loopAngle = progress * Math.PI * 2;
    const speed = this.config.animationParams.speed;
    const moodPreset = this.getMoodPreset();

    this.rings.forEach((ring) => {
      const material = ring.material as THREE.MeshBasicMaterial;
      const { phaseOffset, sizeBias } = ring.userData as { phaseOffset: number; sizeBias: number };
      const localProgress = (progress + phaseOffset) % 1;
      const pulseCurve =
        localProgress < 0.6 ? localProgress / 0.6 : 1 - (localProgress - 0.6) / 0.4;
      const easedPulse = Math.max(0, Math.min(1, pulseCurve));

      const scale = 0.75 + easedPulse * (2.6 + sizeBias + moodPreset.intensityScale * 0.3);
      ring.scale.setScalar(scale);
      material.opacity = easedPulse * 0.32;
      ring.rotation.z = loopAngle * speed * 0.06 * (1 + sizeBias);
    });

    const titleFade = Math.min(1, Math.max(0, (progress - 0.08) / 0.18));
    const titleOut = Math.min(1, Math.max(0, (progress - 0.88) / 0.12));
    this.centerChars.forEach((sprite) => {
      const { index, baseX, baseY } = sprite.userData as {
        index: number;
        baseX: number;
        baseY: number;
      };
      const stagger = index * Math.min(0.045, Math.max(0.02, moodPreset.staggerStep * 0.5));
      const reveal = Math.min(1, Math.max(0, (progress - 0.08 - stagger) / 0.16));
      const eased = 1 - Math.pow(1 - reveal, 3);
      const alpha = eased * titleFade * (1 - titleOut);
      sprite.material.opacity = alpha;
      sprite.position.x = baseX;
      sprite.position.y =
        baseY + (1 - eased) * -0.5 + Math.sin(loopAngle * 1.1 + index * 0.2) * 0.025;
    });

    this.particles.rotation.z = loopAngle * speed * 0.08;
    (this.particles.material as THREE.PointsMaterial).opacity =
      (0.12 + Math.sin(loopAngle * (0.8 + moodPreset.intensityScale * 0.2)) * 0.05) *
      (1 - titleOut * 0.75);
  }
}
