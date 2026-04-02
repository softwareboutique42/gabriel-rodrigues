import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createCharacterSprites, createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

type SatelliteNode = {
  sprite: THREE.Sprite;
  baseAngle: number;
  radius: number;
  speed: number;
  bobPhase: number;
};

export class OrbitAnimation extends BaseAnimation {
  private nameChars: THREE.Sprite[] = [];
  private satellites: SatelliteNode[] = [];
  private rings: THREE.Mesh[] = [];
  private particles!: THREE.Points;

  protected createScene(): void {
    const moodPreset = this.getMoodPreset();
    const renderProfile = this.getRenderProfile();
    const companyName = this.config.companyName.trim().toUpperCase() || 'COMPANY';
    const words = this.config.visualElements.slice(0, 6);
    const orbitLabels = words.length > 0 ? words : ['BRAND', 'STORY', 'SIGNAL'];
    const brandColors = [
      this.config.colors.primary,
      this.config.colors.secondary,
      this.config.colors.accent,
    ];

    const { sprites, totalWidth } = createCharacterSprites(
      companyName,
      this.config.colors.primary,
      110,
    );
    let cursorX = -totalWidth / 2;
    sprites.forEach((sprite, index) => {
      const halfWidth = sprite.scale.x / 2;
      cursorX += halfWidth;
      sprite.position.set(cursorX, 0, 1.45);
      sprite.material.opacity = 0;
      sprite.userData = { index, baseX: cursorX, baseY: 0 };
      this.scene.add(sprite);
      this.nameChars.push(sprite);
      cursorX += halfWidth;
    });

    const ringRadii = [4.8, 6.4, 8.1];
    ringRadii.forEach((radius, index) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(brandColors[index % brandColors.length]),
        transparent: true,
        opacity: 0.14 * renderProfile.opacity,
        side: THREE.DoubleSide,
        blending:
          renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.15 - index * 0.04;
      this.scene.add(ring);
      this.rings.push(ring);
    });

    orbitLabels.forEach((label, index) => {
      const color = brandColors[index % brandColors.length];
      const sprite = createTextSprite(label.toUpperCase(), color, 28);
      const radius = 5.2 + (index % 3) * 1.35;
      const baseAngle = (index / orbitLabels.length) * Math.PI * 2;
      const speed = 0.28 + (index % 3) * 0.09 + moodPreset.intensityScale * 0.07;
      const node: SatelliteNode = {
        sprite,
        radius,
        baseAngle,
        speed,
        bobPhase: index * 0.7,
      };
      sprite.material.opacity = 0;
      sprite.position.set(Math.cos(baseAngle) * radius, Math.sin(baseAngle) * radius, 0.9);
      this.scene.add(sprite);
      this.satellites.push(node);
    });

    const particleCount = this.getParticleBudget(
      Math.floor(170 * this.config.animationParams.density),
    );
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 9;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = -0.6 + Math.random() * 0.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color(this.config.colors.secondary),
      transparent: true,
      opacity: 0.22 * renderProfile.opacity,
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const moodPreset = this.getMoodPreset();
    const speed = this.config.animationParams.speed;

    const centerReveal = Math.min(1, Math.max(0, (progress - 0.05) / 0.2));
    const centerFade = Math.min(1, Math.max(0, (progress - 0.9) / 0.1));

    this.nameChars.forEach((sprite) => {
      const { index, baseX, baseY } = sprite.userData as {
        index: number;
        baseX: number;
        baseY: number;
      };
      const stagger = index * Math.min(0.045, Math.max(0.02, moodPreset.staggerStep * 0.55));
      const reveal = Math.min(1, Math.max(0, (progress - 0.08 - stagger) / 0.16));
      const eased = 1 - Math.pow(1 - reveal, 3);
      const visible = eased * (1 - centerFade);
      sprite.material.opacity = visible;
      sprite.position.x = baseX;
      sprite.position.y =
        baseY + (1 - eased) * -0.7 + Math.sin(elapsed * 1.1 + index * 0.22) * 0.03;
    });

    this.rings.forEach((ring, index) => {
      const material = ring.material as THREE.MeshBasicMaterial;
      const ringPulse = 1 + Math.sin(elapsed * (0.8 + index * 0.25)) * 0.03;
      ring.scale.setScalar(ringPulse);
      ring.rotation.z = elapsed * speed * (0.08 + index * 0.03) * (index % 2 === 0 ? 1 : -1);
      material.opacity = (0.1 + centerReveal * 0.08) * (1 - centerFade);
    });

    this.satellites.forEach((node, index) => {
      const revealAt = 0.24 + index * 0.035;
      const reveal = Math.min(1, Math.max(0, (progress - revealAt) / 0.12));
      const fade = Math.min(1, Math.max(0, (progress - 0.92) / 0.08));
      const alpha = reveal * (1 - fade) * 0.84;

      const orbitAngle = node.baseAngle + elapsed * speed * node.speed;
      const bob = Math.sin(elapsed * 1.7 + node.bobPhase) * 0.18;
      node.sprite.position.x = Math.cos(orbitAngle) * (node.radius + bob);
      node.sprite.position.y = Math.sin(orbitAngle) * (node.radius + bob);
      node.sprite.material.opacity = alpha;
    });

    this.particles.rotation.z = elapsed * speed * 0.06;
    (this.particles.material as THREE.PointsMaterial).opacity =
      (0.12 + Math.sin(elapsed * 0.8) * 0.05) * (1 - centerFade * 0.8);
  }
}
