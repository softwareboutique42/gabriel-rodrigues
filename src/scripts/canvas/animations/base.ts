import * as THREE from 'three';
import type { CompanyConfig } from '../types';
import {
  getMoodPreset as resolveMoodPreset,
  getParticleBudget as resolveParticleBudget,
  getRenderProfile as resolveRenderProfile,
} from '../quality-profiles';

export const LOOP_DURATION = 12;

export abstract class BaseAnimation {
  protected scene!: THREE.Scene;
  protected config!: CompanyConfig;

  setup(scene: THREE.Scene, config: CompanyConfig): void {
    this.scene = scene;
    this.config = config;
    this.createScene();
  }

  protected hexToColor(hex: string): THREE.Color {
    return new THREE.Color(hex);
  }

  protected loopTime(elapsed: number): number {
    return ((elapsed % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;
  }

  protected loopProgress(elapsed: number): number {
    return this.loopTime(elapsed) / LOOP_DURATION;
  }

  protected getMoodPreset() {
    return resolveMoodPreset(this.config.mood);
  }

  protected getRenderProfile() {
    return resolveRenderProfile(this.config.colors.background);
  }

  protected getParticleBudget(baseCount: number): number {
    return resolveParticleBudget(baseCount);
  }

  protected abstract createScene(): void;
  abstract update(elapsed: number, delta: number): void;

  dispose(): void {
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
}
