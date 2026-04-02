import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createTextSprite } from './text-utils';

export class TimelineAnimation extends BaseAnimation {
  private mainLine!: THREE.Line;
  private companyTitle!: THREE.Sprite;
  private nodes: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private connectors: THREE.Line[] = [];

  protected createScene(): void {
    const elements = this.config.visualElements.slice(0, 5);
    const primaryColor = this.hexToColor(this.config.colors.primary);
    const secondaryColor = this.hexToColor(this.config.colors.secondary);
    const accentColor = this.hexToColor(this.config.colors.accent);
    const spread = 22;
    const nodeCount = elements.length;

    this.companyTitle = createTextSprite(
      this.config.companyName.toUpperCase(),
      this.config.colors.primary,
      96,
    );
    this.companyTitle.position.set(0, 5.4, 1.4);
    this.companyTitle.material.opacity = 0.96;
    this.scene.add(this.companyTitle);

    // Main horizontal line
    const linePoints = [
      new THREE.Vector3(-spread / 2 - 2, 0, 0),
      new THREE.Vector3(spread / 2 + 2, 0, 0),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.3,
    });
    this.mainLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.mainLine);

    // Nodes and labels
    elements.forEach((word, i) => {
      const x = (i / (nodeCount - 1) - 0.5) * spread;

      // Node dot
      const nodeGeo = new THREE.CircleGeometry(0.25, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? accentColor : secondaryColor,
        transparent: true,
        opacity: 0,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, 0, 0.5);
      node.userData = { index: i, total: nodeCount, baseX: x };
      this.scene.add(node);
      this.nodes.push(node);

      // Ring around node
      const ringGeo = new THREE.RingGeometry(0.35, 0.45, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, 0, 0.4);
      ring.userData = { index: i };
      this.scene.add(ring);

      // Vertical connector
      const yDir = i % 2 === 0 ? 1 : -1;
      const connPoints = [new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, yDir * 2.5, 0)];
      const connGeo = new THREE.BufferGeometry().setFromPoints(connPoints);
      const connMat = new THREE.LineBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0,
      });
      const conn = new THREE.Line(connGeo, connMat);
      conn.userData = { index: i };
      this.scene.add(conn);
      this.connectors.push(conn);

      // Text label
      const label = createTextSprite(
        word.toUpperCase(),
        i % 2 === 0 ? this.config.colors.accent : this.config.colors.secondary,
        36,
      );
      label.position.set(x, yDir * 3.5, 1);
      label.material.opacity = 0;
      label.userData = { index: i };
      this.scene.add(label);
      this.labels.push(label);
    });
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const total = this.nodes.length;

    // Line draws in first 20% of loop
    const lineOpacity = Math.min(progress / 0.15, 1) * 0.4;
    (this.mainLine.material as THREE.LineBasicMaterial).opacity = lineOpacity;

    // Nodes reveal sequentially
    this.nodes.forEach((node) => {
      const { index } = node.userData;
      const revealAt = 0.1 + (index / total) * 0.6;
      const localP = Math.max(0, (progress - revealAt) / 0.12);
      const opacity = Math.min(localP, 1);

      (node.material as THREE.MeshBasicMaterial).opacity = opacity;

      // Pulse effect
      const pulse = 1 + Math.sin(elapsed * 3 + index * 1.5) * 0.15 * opacity;
      node.scale.setScalar(pulse);
    });

    // Ring around nodes
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
        const { index } = child.userData;
        if (index === undefined) return;
        const revealAt = 0.1 + (index / total) * 0.6;
        const localP = Math.max(0, (progress - revealAt) / 0.12);
        (child.material as THREE.MeshBasicMaterial).opacity = Math.min(localP, 1) * 0.5;
        child.rotation.z = elapsed * 0.5;
      }
    });

    // Connectors and labels
    this.connectors.forEach((conn) => {
      const { index } = conn.userData;
      const revealAt = 0.15 + (index / total) * 0.6;
      const localP = Math.max(0, (progress - revealAt) / 0.1);
      (conn.material as THREE.LineBasicMaterial).opacity = Math.min(localP, 1) * 0.3;
    });

    this.labels.forEach((label) => {
      const { index } = label.userData;
      const revealAt = 0.2 + (index / total) * 0.6;
      const localP = Math.max(0, (progress - revealAt) / 0.1);
      label.material.opacity = Math.min(localP, 1) * 0.75;
    });

    const titlePulse = 1 + Math.sin(elapsed * 1.4) * 0.04;
    this.companyTitle.scale.setScalar(titlePulse);
    this.companyTitle.position.y = 5.4 + Math.sin(elapsed) * 0.1;
  }
}
