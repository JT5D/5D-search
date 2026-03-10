import { useMemo } from 'react';
import * as THREE from 'three';
import { GraphEdge, NodePosition } from '@/types';

interface EdgeRendererProps {
  edges: GraphEdge[];
  positions: Map<string, NodePosition>;
}

export function EdgeRenderer({ edges, positions }: EdgeRendererProps) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    edges.forEach((edge) => {
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);

      if (sourcePos && targetPos) {
        points.push(new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z));
        points.push(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z));
      }
    });

    if (points.length === 0) {
      // Return empty geometry with at least 2 points to avoid errors
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(0, 0, 0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [edges, positions]);

  // Always render, even if empty (with invisible material)
  const hasValidEdges = edges.length > 0 && positions.size > 0;

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial 
        color="#444444" 
        opacity={hasValidEdges ? 0.3 : 0} 
        transparent 
      />
    </lineSegments>
  );
}