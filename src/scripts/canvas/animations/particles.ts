import * as THREE from 'three';
import { BaseAnimation } from './base';
import { getRadialParticleTexture } from './particle-utils';

export class ParticlesAnimation extends BaseAnimation {
  private points!: THREE.Points;
  private basePositions: Float32Array = new Float32Array(0);
  private phaseOffsets: Float32Array = new Float32Array(0);
  private frequencySeeds: Float32Array = new Float32Array(0);
  private amplitudeSeeds: Float32Array = new Float32Array(0);
  private layerMotionScale: Float32Array = new Float32Array(0);
  private layerDepthScale: Float32Array = new Float32Array(0);

  protected createScene(): void {
    const count = this.getParticleBudget(Math.floor(800 * this.config.animationParams.density));
    const moodPreset = this.getMoodPreset();
    const renderProfile = this.getRenderProfile();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.basePositions = new Float32Array(count * 3);
    this.phaseOffsets = new Float32Array(count);
    this.frequencySeeds = new Float32Array(count);
    this.amplitudeSeeds = new Float32Array(count);
    this.layerMotionScale = new Float32Array(count);
    this.layerDepthScale = new Float32Array(count);

    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const isForeground = Math.random() < 0.35;
      const depthScale = isForeground ? 1.35 : 0.68;
      const brightnessScale = isForeground ? 1 : 0.62;

      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = isForeground ? 0.7 + Math.random() * 2.2 : -3.6 + Math.random() * 2.2;

      this.basePositions[i3] = positions[i3];
      this.basePositions[i3 + 1] = positions[i3 + 1];
      this.basePositions[i3 + 2] = positions[i3 + 2];

      this.phaseOffsets[i] = Math.random() * Math.PI * 2;
      this.frequencySeeds[i] = 0.8 + Math.random() * 1.4;
      this.amplitudeSeeds[i] = 0.6 + Math.random() * 1.1;
      this.layerMotionScale[i] = depthScale;
      this.layerDepthScale[i] = isForeground ? 1 : 0.55;

      const color = palette[i % palette.length];
      colors[i3] = Math.min(1, color.r * brightnessScale);
      colors[i3 + 1] = Math.min(1, color.g * brightnessScale);
      colors[i3 + 2] = Math.min(1, color.b * brightnessScale);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12 * (0.9 + moodPreset.intensityScale * 0.12),
      vertexColors: true,
      transparent: true,
      opacity: Math.min(1, 0.82 * renderProfile.opacity),
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
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
    const moodPreset = this.getMoodPreset();
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
      const depthMotion = this.layerMotionScale[i] * (0.85 + moodPreset.intensityScale * 0.25);
      const depthZ = this.layerDepthScale[i];

      // Deterministic closed-form offsets from loop progress (no unbounded accumulation)
      // This ensures seamless loop wrapping at 12s interval
      const wave = Math.sin(theta * frequency + phase + bx * 0.08) * (1.4 * amplitude);
      const drift =
        Math.cos(theta * (frequency + 0.35) + phase * 0.7 + by * 0.07) * (1.1 * amplitude);

      positions[i3] = bx + drift * speed * depthMotion;
      positions[i3 + 1] = by + wave * speed * depthMotion;
      positions[i3 + 2] =
        this.basePositions[i3 + 2] +
        Math.sin(theta * (frequency * 0.6) + phase * 0.4) * 0.35 * depthZ;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.rotation.z = Math.sin(progress * Math.PI * 2) * 0.05;
  }
}
