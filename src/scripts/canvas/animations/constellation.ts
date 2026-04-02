import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

export class ConstellationAnimation extends BaseAnimation {
  private stars: THREE.Mesh[] = [];
  private connections: THREE.Line[] = [];
  private labels: THREE.Sprite[] = [];
  private nodePositions: THREE.Vector3[] = [];

  protected createScene(): void {
    const elements = this.config.visualElements.slice(0, 5);
    const primaryColor = this.hexToColor(this.config.colors.primary);
    const secondaryColor = this.hexToColor(this.config.colors.secondary);
    const accentColor = this.hexToColor(this.config.colors.accent);
    const colors = [primaryColor, secondaryColor, accentColor];
    const colorHex = [
      this.config.colors.primary,
      this.config.colors.secondary,
      this.config.colors.accent,
    ];

    // Place nodes in a spread pattern
    const radius = 6;
    elements.forEach((word, i) => {
      const angle = (i / elements.length) * Math.PI * 2 - Math.PI / 2;
      const r = radius + (Math.random() - 0.5) * 3;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const pos = new THREE.Vector3(x, y, 0);
      this.nodePositions.push(pos);

      // Star node (bright dot)
      const starGeo = new THREE.CircleGeometry(0.2, 16);
      const starMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.copy(pos);
      star.position.z = 0.5;
      star.userData = { index: i, total: elements.length };
      this.scene.add(star);
      this.stars.push(star);

      // Glow halo
      const haloGeo = new THREE.CircleGeometry(0.5, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.position.z = 0.3;
      halo.userData = { index: i, isHalo: true };
      this.scene.add(halo);

      // Text label
      const label = createTextSprite(word.toUpperCase(), colorHex[i % colorHex.length], 32);
      label.position.set(x, y - 1.2, 1);
      label.material.opacity = 0;
      label.userData = { index: i };
      this.scene.add(label);
      this.labels.push(label);
    });

    // Create connections between adjacent nodes
    for (let i = 0; i < this.nodePositions.length; i++) {
      const next = (i + 1) % this.nodePositions.length;
      const points = [this.nodePositions[i], this.nodePositions[next]];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { index: i };
      this.scene.add(line);
      this.connections.push(line);
    }

    // Background dim stars
    const bgCount = Math.floor(100 * this.config.animationParams.density);
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      bgPos[i * 3] = (Math.random() - 0.5) * 35;
      bgPos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      bgPos[i * 3 + 2] = -1;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({
      size: 0.04,
      color: secondaryColor,
      transparent: true,
      opacity: 0.2,
      map: getRadialParticleTexture(),
    });
    this.scene.add(new THREE.Points(bgGeo, bgMat));
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const speed = this.config.animationParams.speed;
    const total = this.stars.length;

    // Stars appear sequentially
    this.stars.forEach((star) => {
      const { index } = star.userData;
      const revealAt = (index / total) * 0.5;
      const localP = Math.max(0, (progress - revealAt) / 0.1);
      const opacity = Math.min(localP, 1);

      (star.material as THREE.MeshBasicMaterial).opacity = opacity * 0.9;

      // Gentle orbit around base position
      const basePos = this.nodePositions[index];
      const orbitR = 0.3 * Math.sin(elapsed * speed * 0.5 + index);
      star.position.x = basePos.x + Math.cos(elapsed * speed * 0.3 + index * 2) * orbitR;
      star.position.y = basePos.y + Math.sin(elapsed * speed * 0.3 + index * 2) * orbitR;

      // Pulse
      const pulse = 1 + Math.sin(elapsed * 2 + index * 1.2) * 0.3;
      star.scale.setScalar(pulse);
    });

    // Halos
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.isHalo) {
        const { index } = child.userData;
        const revealAt = (index / total) * 0.5;
        const localP = Math.max(0, (progress - revealAt) / 0.1);
        (child.material as THREE.MeshBasicMaterial).opacity = Math.min(localP, 1) * 0.15;
        const pulse = 1 + Math.sin(elapsed * 1.5 + index) * 0.2;
        child.scale.setScalar(pulse);
        // Track star position
        const star = this.stars[index];
        child.position.x = star.position.x;
        child.position.y = star.position.y;
      }
    });

    // Connections draw in after stars
    this.connections.forEach((line, i) => {
      const revealAt = 0.1 + (i / total) * 0.5;
      const localP = Math.max(0, (progress - revealAt) / 0.15);
      (line.material as THREE.LineBasicMaterial).opacity = Math.min(localP, 1) * 0.25;

      // Update line positions to follow orbiting stars
      const positions = line.geometry.attributes.position.array as Float32Array;
      const next = (i + 1) % this.stars.length;
      positions[0] = this.stars[i].position.x;
      positions[1] = this.stars[i].position.y;
      positions[3] = this.stars[next].position.x;
      positions[4] = this.stars[next].position.y;
      line.geometry.attributes.position.needsUpdate = true;
    });

    // Labels
    this.labels.forEach((label) => {
      const { index } = label.userData;
      const revealAt = 0.15 + (index / total) * 0.5;
      const localP = Math.max(0, (progress - revealAt) / 0.1);
      label.material.opacity = Math.min(localP, 1) * 0.85;
      label.position.x = this.stars[index].position.x;
      label.position.y = this.stars[index].position.y - 1.2;
    });
  }
}
