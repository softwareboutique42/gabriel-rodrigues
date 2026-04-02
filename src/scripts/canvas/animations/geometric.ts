import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

type GeometricShapeData = {
  baseX: number;
  baseY: number;
  baseRotation: number;
  orbitRadius: number;
  orbitPhase: number;
  rotPhase: number;
  rotAmplitude: number;
  scale: number;
};

export class GeometricAnimation extends BaseAnimation {
  private shapes: THREE.Group = new THREE.Group();

  protected createScene(): void {
    const count = Math.floor(20 * this.config.animationParams.density);
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
          opacity: 0.5,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        }),
    );

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
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

      group.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 16, 0);

      group.userData = {
        baseX: group.position.x,
        baseY: group.position.y,
        baseRotation: (Math.random() - 0.5) * Math.PI,
        orbitRadius: Math.random() * 1.5,
        orbitPhase: Math.random() * Math.PI * 2,
        rotPhase: Math.random() * Math.PI * 2,
        rotAmplitude: 0.08 + Math.random() * 0.14,
        scale: 0.6 + Math.random() * 1.2,
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
    const phase = progress * Math.PI * 2;
    const speedScale = 0.7 + speed * 0.3;
    const pulseAmplitude = 0.08 + complexity * 0.07;

    this.shapes.children.forEach((group) => {
      const d = group.userData as GeometricShapeData;
      const orbitAngle = phase + d.orbitPhase;
      const rotationAngle = phase + d.rotPhase;

      group.position.x = d.baseX + Math.cos(orbitAngle) * d.orbitRadius * speedScale;
      group.position.y = d.baseY + Math.sin(orbitAngle) * d.orbitRadius * speedScale;

      group.rotation.z = d.baseRotation + Math.sin(rotationAngle) * d.rotAmplitude * speedScale;

      const pulse = 1 + Math.sin(phase + d.orbitPhase) * pulseAmplitude;
      group.scale.setScalar(d.scale * pulse);
    });
  }
}
