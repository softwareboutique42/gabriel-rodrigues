import * as THREE from 'three';
import type { CompanyConfig } from '../types';

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
