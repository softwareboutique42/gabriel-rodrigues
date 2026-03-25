import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

export class GeometricAnimation extends BaseAnimation {
  private shapes: THREE.Group = new THREE.Group();

  protected createScene(): void {
    const count = Math.floor(20 * this.config.animationParams.density);
    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
    ];

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

      const material = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      group.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 16, 0);

      group.userData = {
        baseX: group.position.x,
        baseY: group.position.y,
        rotSpeed: (Math.random() - 0.5) * 2,
        orbitRadius: Math.random() * 1.5,
        orbitPhase: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 1.2,
      };

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
      const d = group.userData;

      group.position.x = d.baseX + Math.cos(phase * speed + d.orbitPhase) * d.orbitRadius;
      group.position.y = d.baseY + Math.sin(phase * speed + d.orbitPhase) * d.orbitRadius;

      group.rotation.z += d.rotSpeed * 0.01 * speed;

      const pulse = 1 + Math.sin(phase * speed * complexity + d.orbitPhase) * 0.15;
      group.scale.setScalar(d.scale * pulse);

      const mesh = group.children[0] as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(phase + d.orbitPhase) * 0.25;
    });
  }
}
