import * as THREE from 'three';
import { BaseAnimation } from './base';
import { getRadialParticleTexture } from './particle-utils';

export class ParticlesAnimation extends BaseAnimation {
  private points!: THREE.Points;
  private basePositions: Float32Array = new Float32Array(0);
  private phaseOffsets: Float32Array = new Float32Array(0);
  private frequencySeeds: Float32Array = new Float32Array(0);
  private amplitudeSeeds: Float32Array = new Float32Array(0);

  protected createScene(): void {
    const count = Math.floor(800 * this.config.animationParams.density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.basePositions = new Float32Array(count * 3);
    this.phaseOffsets = new Float32Array(count);
    this.frequencySeeds = new Float32Array(count);
    this.amplitudeSeeds = new Float32Array(count);

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

      this.phaseOffsets[i] = Math.random() * Math.PI * 2;
      this.frequencySeeds[i] = 0.8 + Math.random() * 1.4;
      this.amplitudeSeeds[i] = 0.6 + Math.random() * 1.1;

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
      map: getRadialParticleTexture(),
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  update(elapsed: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const complexity = this.config.animationParams.complexity;
    const theta = progress * Math.PI * 2;

    const positions = this.points.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = this.basePositions[i3];
      const by = this.basePositions[i3 + 1];
      const phase = this.phaseOffsets[i];
      const frequency = this.frequencySeeds[i] * (0.8 + complexity * 0.3);
      const amplitude = this.amplitudeSeeds[i] * (0.9 + complexity * 0.4);

      // Deterministic closed-form offsets from loop progress (no unbounded accumulation)
      // This ensures seamless loop wrapping at 12s interval
      const wave = Math.sin(theta * frequency + phase + bx * 0.08) * (1.4 * amplitude);
      const drift =
        Math.cos(theta * (frequency + 0.35) + phase * 0.7 + by * 0.07) * (1.1 * amplitude);

      positions[i3] = bx + drift * speed;
      positions[i3 + 1] = by + wave * speed;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.rotation.z = Math.sin(progress * Math.PI * 2) * 0.05;
  }
}
