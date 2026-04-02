import * as THREE from 'three';
import { BaseAnimation } from './base';
import { createTextSprite } from './text-utils';
import { getRadialParticleTexture } from './particle-utils';

type SignalNode = {
  mesh: THREE.Mesh;
  label: THREE.Sprite;
  baseX: number;
  baseY: number;
  lane: number;
  phase: number;
};

type SignalEdge = {
  line: THREE.Line;
  from: number;
  to: number;
  laneBias: number;
};

export class SignalAnimation extends BaseAnimation {
  private nodes: SignalNode[] = [];
  private edges: SignalEdge[] = [];
  private particles!: THREE.Points;

  protected createScene(): void {
    const moodPreset = this.getMoodPreset();
    const renderProfile = this.getRenderProfile();
    const density = this.config.animationParams.density;
    const labels = this.config.visualElements.slice(0, 9).map((word) => word.toUpperCase()) || [];
    const nodeLabels = labels.length > 0 ? labels : ['SYNC', 'DATA', 'FLOW', 'CORE', 'LINK'];
    const cols = Math.max(3, Math.min(5, Math.round(3 + density * 2)));
    const rows = Math.max(2, Math.min(4, Math.round(2 + density * 1.5)));
    const spacingX = 5.2;
    const spacingY = 3.5;
    const startX = -((cols - 1) * spacingX) / 2;
    const startY = -((rows - 1) * spacingY) / 2;
    const nodeColor = new THREE.Color(this.config.colors.primary);
    const edgeColor = new THREE.Color(this.config.colors.secondary);

    let labelIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = startX + col * spacingX;
        const baseY = startY + row * spacingY;
        const mesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.28, 24),
          new THREE.MeshBasicMaterial({
            color: nodeColor,
            transparent: true,
            opacity: 0,
            blending:
              renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
          }),
        );
        mesh.position.set(baseX, baseY, 0.55);

        const label = createTextSprite(
          nodeLabels[labelIndex % nodeLabels.length],
          this.config.colors.accent,
          24,
        );
        label.material.opacity = 0;
        label.position.set(baseX, baseY + 0.86, 0.95);
        this.scene.add(mesh);
        this.scene.add(label);

        this.nodes.push({
          mesh,
          label,
          baseX,
          baseY,
          lane: row,
          phase: (row * cols + col) * 0.24 + moodPreset.intensityScale * 0.32,
        });
        labelIndex++;
      }
    }

    const horizontalCount = cols - 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (col < horizontalCount) {
          this.createEdge(index, index + 1, edgeColor, renderProfile.opacity, row * 0.08);
        }
        if (row < rows - 1) {
          this.createEdge(index, index + cols, edgeColor, renderProfile.opacity, col * 0.07 + 0.2);
        }
      }
    }

    const particleCount = this.getParticleBudget(Math.floor(120 * density));
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * cols * spacingX * 1.35;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * rows * spacingY * 1.8;
      particlePositions[i3 + 2] = -0.7 + Math.random() * 0.4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color(this.config.colors.secondary),
      transparent: true,
      opacity: 0.15 * renderProfile.opacity,
      blending: renderProfile.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
      map: getRadialParticleTexture(),
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  private createEdge(
    from: number,
    to: number,
    color: THREE.Color,
    opacityScale: number,
    laneBias: number,
  ): void {
    const points = [new THREE.Vector3(), new THREE.Vector3()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12 * opacityScale,
    });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.edges.push({ line, from, to, laneBias });
  }

  update(elapsed: number, _delta: number): void {
    const progress = this.loopProgress(elapsed);
    const loopAngle = progress * Math.PI * 2;
    const speed = this.config.animationParams.speed;
    const moodPreset = this.getMoodPreset();
    const intensity = 0.4 + moodPreset.intensityScale * 0.8;

    this.nodes.forEach((node, index) => {
      const material = node.mesh.material as THREE.MeshBasicMaterial;
      const reveal = Math.min(1, Math.max(0, (progress - index * 0.012) / 0.18));
      const fade = Math.min(1, Math.max(0, (progress - 0.92) / 0.08));
      const alpha = reveal * (1 - fade);

      // Use axis-decoupled movement to keep motion rectilinear and graph-like.
      const lanePulse = Math.sin(loopAngle * (1.2 + node.lane * 0.08) + node.phase);
      const xShift = Math.sign(lanePulse) * 0.32 * intensity;
      const yShift =
        Math.sin(loopAngle * (0.9 + speed * 0.12) + node.phase * 1.4) * 0.22 * intensity;

      node.mesh.position.x = node.baseX + xShift;
      node.mesh.position.y = node.baseY + yShift;
      node.label.position.x = node.mesh.position.x;
      node.label.position.y = node.mesh.position.y + 0.86;
      node.label.material.opacity = alpha * 0.88;
      material.opacity = alpha * 0.95;
      const scale = 0.92 + Math.sin(loopAngle * 1.6 + node.phase) * 0.14;
      node.mesh.scale.setScalar(scale);
    });

    this.edges.forEach((edge, index) => {
      const fromNode = this.nodes[edge.from];
      const toNode = this.nodes[edge.to];
      const pos = edge.line.geometry.attributes.position.array as Float32Array;
      pos[0] = fromNode.mesh.position.x;
      pos[1] = fromNode.mesh.position.y;
      pos[2] = 0.2;
      pos[3] = toNode.mesh.position.x;
      pos[4] = toNode.mesh.position.y;
      pos[5] = 0.2;
      edge.line.geometry.attributes.position.needsUpdate = true;
      const lineMaterial = edge.line.material as THREE.LineBasicMaterial;
      const pulse = Math.sin(loopAngle * (1.7 + edge.laneBias) + index * 0.11) * 0.5 + 0.5;
      lineMaterial.opacity = 0.06 + pulse * (0.2 + moodPreset.intensityScale * 0.14);
    });

    this.particles.rotation.z = loopAngle * speed * 0.08;
    (this.particles.material as THREE.PointsMaterial).opacity =
      0.08 + Math.sin(loopAngle * 0.9) * 0.04;
  }
}
