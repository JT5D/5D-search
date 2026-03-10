import { NodePosition } from '@/types';

export class LODManager {
  private cameraPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 500 };

  updateCameraPosition(x: number, y: number, z: number) {
    this.cameraPosition = { x, y, z };
  }

  getDistance(nodePos: NodePosition): number {
    const dx = nodePos.x - this.cameraPosition.x;
    const dy = nodePos.y - this.cameraPosition.y;
    const dz = nodePos.z - this.cameraPosition.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  getLODLevel(distance: number): 'particle' | 'sphere' | 'detailed' {
    if (distance > 500) return 'particle';
    if (distance > 200) return 'sphere';
    return 'detailed';
  }

  shouldShowLabel(distance: number): boolean {
    return distance < 250;
  }

  getNodeScale(distance: number, baseSize: number): number {
    const minScale = 0.5;
    const maxScale = 2.0;
    const scaleFactor = Math.max(minScale, Math.min(maxScale, 300 / distance));
    return baseSize * scaleFactor;
  }
}

export const lodManager = new LODManager();