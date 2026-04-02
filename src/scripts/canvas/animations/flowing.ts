import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

export class FlowingAnimation extends BaseAnimation {
  private curves: THREE.Line[] = [];

  protected createScene(): void {
    const renderProfile = this.getRenderProfile();
    const curveCount = Math.floor(8 * this.config.animationParams.density);
    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
    ];

    for (let c = 0; c < curveCount; c++) {
      const points: THREE.Vector3[] = [];
      const segments = 80;
      const yOffset = (c - curveCount / 2) * 2.5;

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * 30 - 15;
        points.push(new THREE.Vector3(x, yOffset, 0));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: palette[c % palette.length],
        transparent: true,
        opacity: 0.6 * renderProfile.opacity,
        blending:
          renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.curves.push(line);
    }
  }

  update(elapsed: number): void {
    const t = this.loopTime(elapsed);
    const progress = t / LOOP_DURATION;
    const speed = this.config.animationParams.speed;
    const complexity = this.config.animationParams.complexity;

    this.curves.forEach((line, c) => {
      const positions = line.geometry.attributes.position.array as Float32Array;
      const segments = positions.length / 3 - 1;
      const yBase = (c - this.curves.length / 2) * 2.5;

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * 30 - 15;
        const phase = progress * Math.PI * 2;

        const y =
          yBase +
          Math.sin(x * 0.3 * complexity + phase * speed + c * 0.8) * 2 +
          Math.sin(x * 0.15 * complexity + phase * speed * 0.7) * 1.5;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
      }

      line.geometry.attributes.position.needsUpdate = true;

      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.3 + Math.sin(progress * Math.PI * 2 + c) * 0.3;
    });
  }
}
