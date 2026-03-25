import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

export class ParticlesAnimation extends BaseAnimation {
  private points!: THREE.Points;
  private velocities: Float32Array = new Float32Array(0);
  private basePositions: Float32Array = new Float32Array(0);

  protected createScene(): void {
    const count = Math.floor(800 * this.config.animationParams.density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.basePositions = new Float32Array(count * 3);

    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 5;

      this.basePositions[i3] = positions[i3];
      this.basePositions[i3 + 1] = positions[i3 + 1];
      this.basePositions[i3 + 2] = positions[i3 + 2];

      this.velocities[i3] = (Math.random() - 0.5) * 0.02;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      this.velocities[i3 + 2] = 0;

      const color = palette[i % palette.length];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  update(elapsed: number): void {
    const t = this.loopTime(elapsed);
    const progress = t / LOOP_DURATION;
    const speed = this.config.animationParams.speed;
    const complexity = this.config.animationParams.complexity;

    const positions = this.points.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = this.basePositions[i3];
      const by = this.basePositions[i3 + 1];

      const wave = Math.sin(progress * Math.PI * 2 + bx * 0.3 * complexity) * 2;
      const drift = Math.cos(progress * Math.PI * 2 + by * 0.2 * complexity) * 1.5;

      positions[i3] = bx + drift * speed + this.velocities[i3] * t * 60;
      positions[i3 + 1] = by + wave * speed + this.velocities[i3 + 1] * t * 60;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.rotation.z = Math.sin(progress * Math.PI * 2) * 0.05;
  }
}
