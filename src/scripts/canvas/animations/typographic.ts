import * as THREE from 'three';
import { BaseAnimation, LOOP_DURATION } from './base';

export class TypographicAnimation extends BaseAnimation {
  private tiles: THREE.Mesh[] = [];
  private gridGroup = new THREE.Group();

  protected createScene(): void {
    const cols = Math.floor(12 * this.config.animationParams.density);
    const rows = Math.floor(8 * this.config.animationParams.density);
    const tileSize = 1.2;
    const gap = 0.15;
    const totalWidth = cols * (tileSize + gap);
    const totalHeight = rows * (tileSize + gap);

    const palette = [
      this.hexToColor(this.config.colors.primary),
      this.hexToColor(this.config.colors.secondary),
      this.hexToColor(this.config.colors.accent),
      this.hexToColor(this.config.colors.background).multiplyScalar(1.5),
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const geometry = new THREE.PlaneGeometry(tileSize, tileSize);
        const colorIndex = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 3;
        const material = new THREE.MeshBasicMaterial({
          color: palette[colorIndex],
          transparent: true,
          opacity: colorIndex === 3 ? 0.15 : 0.5,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          c * (tileSize + gap) - totalWidth / 2 + tileSize / 2,
          r * (tileSize + gap) - totalHeight / 2 + tileSize / 2,
          0,
        );

        mesh.userData = {
          col: c,
          row: r,
          baseOpacity: material.opacity,
          colorIndex,
          delay: (c + r) * 0.05,
        };

        this.tiles.push(mesh);
        this.gridGroup.add(mesh);
      }
    }

    this.scene.add(this.gridGroup);
  }

  update(elapsed: number): void {
    const t = this.loopTime(elapsed);
    const progress = t / LOOP_DURATION;
    const speed = this.config.animationParams.speed;
    const complexity = this.config.animationParams.complexity;
    const phase = progress * Math.PI * 2;

    this.tiles.forEach((tile) => {
      const d = tile.userData;
      const mat = tile.material as THREE.MeshBasicMaterial;

      const wave = Math.sin(phase * speed + d.delay * complexity * 5);

      if (d.colorIndex < 3) {
        mat.opacity = d.baseOpacity * (0.5 + wave * 0.5);
        tile.scale.setScalar(0.9 + wave * 0.15);
      } else {
        mat.opacity = 0.05 + Math.max(0, wave) * 0.2;
      }

      tile.rotation.z = wave * 0.05 * complexity;
    });

    this.gridGroup.rotation.z = Math.sin(phase * 0.5) * 0.02;
  }
}
