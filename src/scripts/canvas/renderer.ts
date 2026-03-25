import * as THREE from 'three';
import type { CompanyConfig } from './types';
import type { BaseAnimation } from './animations/base';
import { createAnimation } from './animations/index';

export class CanvasRenderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private clock = new THREE.Clock();
  private animation!: BaseAnimation;
  private animationId = 0;
  private canvas!: HTMLCanvasElement;

  init(canvas: HTMLCanvasElement, config: CompanyConfig): void {
    this.canvas = canvas;
    const container = canvas.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(new THREE.Color(config.colors.background), 1);

    const aspect = width / height;
    const frustum = 10;
    this.camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      100,
    );
    this.camera.position.z = 10;

    this.scene = new THREE.Scene();

    this.animation = createAnimation(config.animationStyle);
    this.animation.setup(this.scene, config);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    const container = this.canvas.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;
    const frustum = 10;

    this.camera.left = -frustum * aspect;
    this.camera.right = frustum * aspect;
    this.camera.top = frustum;
    this.camera.bottom = -frustum;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  start(): void {
    this.clock.start();
    const loop = (): void => {
      this.animationId = requestAnimationFrame(loop);
      const elapsed = this.clock.getElapsedTime();
      const delta = this.clock.getDelta();
      this.animation.update(elapsed, delta);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop(): void {
    cancelAnimationFrame(this.animationId);
    this.clock.stop();
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.animation.dispose();
    this.renderer.dispose();
  }
}
