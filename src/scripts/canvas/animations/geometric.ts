import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

type GeometricShapeData = {
  baseX: number;
  baseY: number;
  rotSpeed: number;
  orbitRadius: number;
  orbitPhase: number;
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
        rotSpeed: (Math.random() - 0.5) * 2,
        orbitRadius: Math.random() * 1.5,
        orbitPhase: Math.random() * Math.PI * 2,
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

    this.shapes.children.forEach((group) => {
      const d = group.userData as GeometricShapeData;

      group.position.x = d.baseX + Math.cos(phase * speed + d.orbitPhase) * d.orbitRadius;
      group.position.y = d.baseY + Math.sin(phase * speed + d.orbitPhase) * d.orbitRadius;

      group.rotation.z += d.rotSpeed * 0.01 * speed;

      const pulse = 1 + Math.sin(phase * speed * complexity + d.orbitPhase) * 0.15;
      group.scale.setScalar(d.scale * pulse);
    });
  }
}
