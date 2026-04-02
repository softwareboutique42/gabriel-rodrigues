import * as THREE from 'three';
import type { CompanyConfig } from './types';
import type { BaseAnimation } from './animations/base';
import { createAnimation } from './animations/index';
import { createIndustryIcon } from './icons/index';

export type RendererInitOptions = {
  exportMode?: boolean;
  preserveDrawingBuffer?: boolean;
};

export class CanvasRenderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private clock = new THREE.Clock();
  private animation!: BaseAnimation;
  private iconUpdate: ((elapsed: number) => void) | null = null;
  private animationId = 0;
  private canvas!: HTMLCanvasElement;
  private exportMode = false;
  private manualElapsed: number | null = null;

  init(canvas: HTMLCanvasElement, config: CompanyConfig, options: RendererInitOptions = {}): void {
    this.canvas = canvas;
    this.exportMode = options.exportMode ?? false;
    this.manualElapsed = null;
    const container = canvas.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? this.exportMode,
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

    // Industry icon overlay
    if (config.industry) {
      this.iconUpdate = createIndustryIcon(this.scene, config);
    }

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
      this.renderFrame(elapsed, delta);
    };
    loop();
  }

  setExportFrame(elapsed: number): void {
    this.manualElapsed = elapsed;
  }

  renderFrame(elapsed: number, delta: number): void {
    const effectiveElapsed =
      this.exportMode && this.manualElapsed !== null ? this.manualElapsed : elapsed;
    this.animation.update(effectiveElapsed, delta);
    this.iconUpdate?.(effectiveElapsed);
    this.renderer.render(this.scene, this.camera);
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
