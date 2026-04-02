import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

type GeometricShapeData = {
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRotation: number;
  orbitRadius: number;
  orbitPhase: number;
  rotPhase: number;
  rotAmplitude: number;
  scale: number;
  layerSpeedScale: number;
  layerPulseScale: number;
};

export class GeometricAnimation extends BaseAnimation {
  private shapes: THREE.Group = new THREE.Group();

  protected createScene(): void {
    const count = this.getParticleBudget(Math.floor(20 * this.config.animationParams.density));
    const renderProfile = this.getRenderProfile();
    const moodPreset = this.getMoodPreset();
    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
    ];

    // One reusable material per palette bucket keeps material allocations bounded.
    const materialPool = palette.map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: Math.min(0.7, 0.55 * renderProfile.opacity),
          side: THREE.DoubleSide,
          blending:
            renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
        }),
    );

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const isForeground = Math.random() < 0.4;
      const shapeType = i % 3;
      let geometry: THREE.BufferGeometry;

      if (shapeType === 0) {
        geometry = new THREE.RingGeometry(0.5, 0.7, 6);
      } else if (shapeType === 1) {
        geometry = new THREE.RingGeometry(0.4, 0.55, 4);
      } else {
        geometry = new THREE.RingGeometry(0.3, 0.45, 3);
      }

      const paletteIndex = i % materialPool.length;
      const mesh = new THREE.Mesh(geometry, materialPool[paletteIndex]);
      group.add(mesh);

      group.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 16,
        isForeground ? 0.65 + Math.random() * 1.8 : -2.8 + Math.random() * 1.8,
      );

      group.userData = {
        baseX: group.position.x,
        baseY: group.position.y,
        baseZ: group.position.z,
        baseRotation: (Math.random() - 0.5) * Math.PI,
        orbitRadius: Math.random() * 1.5,
        orbitPhase: Math.random() * Math.PI * 2,
        rotPhase: Math.random() * Math.PI * 2,
        rotAmplitude: 0.08 + Math.random() * 0.14,
        scale: (isForeground ? 0.9 : 0.55) + Math.random() * (isForeground ? 1.1 : 0.75),
        layerSpeedScale: (isForeground ? 1.2 : 0.72) * (0.9 + moodPreset.intensityScale * 0.16),
        layerPulseScale: (isForeground ? 1.1 : 0.7) * (1 + moodPreset.overshoot * 0.5),
      } satisfies GeometricShapeData;

      group.scale.setScalar(group.userData.scale);
      this.shapes.add(group);
    }

    this.scene.add(this.shapes);
  }

  update(elapsed: number): void {
    const t = this.loopTime(elapsed);
    const progress = t / LOOP_DURATION;
    const speed = this.config.animationParams.speed;
    const complexity = this.config.animationParams.complexity;
    const moodPreset = this.getMoodPreset();
    const phase = progress * Math.PI * 2;
    const speedScale = 0.68 + speed * 0.34;
    const pulseAmplitude = (0.07 + complexity * 0.08) * (0.9 + moodPreset.intensityScale * 0.2);

    this.shapes.children.forEach((group) => {
      const d = group.userData as GeometricShapeData;
      const orbitAngle = phase + d.orbitPhase;
      const rotationAngle = phase + d.rotPhase;
      const layerSpeed = speedScale * d.layerSpeedScale;

      group.position.x = d.baseX + Math.cos(orbitAngle) * d.orbitRadius * layerSpeed;
      group.position.y = d.baseY + Math.sin(orbitAngle) * d.orbitRadius * layerSpeed;
      group.position.z = d.baseZ + Math.sin(phase * 0.8 + d.orbitPhase) * 0.18 * d.layerPulseScale;

      group.rotation.z = d.baseRotation + Math.sin(rotationAngle) * d.rotAmplitude * layerSpeed;

      const pulse = 1 + Math.sin(phase + d.orbitPhase) * pulseAmplitude * d.layerPulseScale;
      group.scale.setScalar(d.scale * pulse);
    });
  }
}
