import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNode, NodePosition, LODRenderType } from '@/types';

interface OptimizedNodeRendererProps {
  nodes: GraphNode[];
  positions: Map<string, NodePosition>;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  hoveredNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
  onLODUpdate?: (distribution: { particle: number; icon: number; thumbnail: number; full: number }) => void;
}

// Base node size for visibility
const BASE_NODE_SIZE = 8;

// Adjusted LOD distance thresholds for better visibility at typical camera distances
const LOD_THRESHOLDS = {
  PARTICLE: 2000,      // > 2000 units: particles (very far)
  ICON: 1000,          // 1000-2000: icons (far)
  THUMBNAIL: 400,      // 400-1000: thumbnails (medium)
  FULL: 0,             // < 400: full detail (close)
};

function getLODType(distance: number): LODRenderType {
  if (distance > LOD_THRESHOLDS.PARTICLE) return 'particle';
  if (distance > LOD_THRESHOLDS.ICON) return 'icon';
  if (distance > LOD_THRESHOLDS.THUMBNAIL) return 'thumbnail';
  return 'full';
}

function getMediaIcon(mediaType: string): string {
  const icons: Record<string, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    code: '💻',
    model3d: '🎲',
    folder: '📁',
    link: '🔗',
    text: '📝',
  };
  return icons[mediaType] || '📄';
}

// Single node renderer with proper LOD implementation
function NodeWithLOD({
  node,
  position,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  node: GraphNode;
  position: NodePosition;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [lodType, setLodType] = useState<LODRenderType>('full');

  useFrame(() => {
    if (meshRef.current) {
      const dist = camera.position.distanceTo(
        new THREE.Vector3(position.x, position.y, position.z)
      );
      
      // Update LOD type based on distance
      const newLodType = getLODType(dist);
      if (newLodType !== lodType) {
        setLodType(newLodType);
      }
      
      const baseScale = isSelected ? 2.5 : isHovered ? 2.0 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(baseScale, baseScale, baseScale),
        0.15
      );
    }

    if (glowRef.current) {
      const time = Date.now() * 0.001;
      const pulse = Math.sin(time * 2) * 0.2 + 1.0;
      glowRef.current.scale.setScalar(1.3 * pulse);
    }
  });

  const color = useMemo(() => {
    if (isSelected) return '#ffffff';
    if (isHovered) return '#ffff00';
    return node.color;
  }, [isSelected, isHovered, node.color]);

  const nodeSize = BASE_NODE_SIZE * node.size;

  // Particle rendering (very far distance)
  if (lodType === 'particle') {
    return (
      <mesh position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[nodeSize * 0.5, 8, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.9}
        />
      </mesh>
    );
  }

  // Icon rendering (far distance)
  if (lodType === 'icon') {
    return (
      <group position={[position.x, position.y, position.z]}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <sphereGeometry args={[nodeSize * 0.8, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.0}
          />
        </mesh>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Html center distanceFactor={10}>
            <div
              style={{
                fontSize: `${nodeSize * 4}px`,
                filter: isSelected
                  ? 'drop-shadow(0 0 10px #fff)'
                  : isHovered
                  ? 'drop-shadow(0 0 5px #ff0)'
                  : 'none',
                cursor: 'pointer',
              }}
            >
              {getMediaIcon(node.mediaType)}
            </div>
          </Html>
        </Billboard>
      </group>
    );
  }

  // Thumbnail rendering (medium distance)
  if (lodType === 'thumbnail') {
    return (
      <group position={[position.x, position.y, position.z]}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <sphereGeometry args={[nodeSize * 0.9, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {(isSelected || isHovered) && (
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              position={[0, nodeSize * 1.5, 0]}
              fontSize={nodeSize * 0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={nodeSize * 0.04}
              outlineColor="#000000"
              maxWidth={40}
            >
              {node.label}
            </Text>
          </Billboard>
        )}
      </group>
    );
  }

  // Full rendering (close distance)
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 1.3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main node sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[nodeSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* White outline ring */}
      <mesh>
        <sphereGeometry args={[nodeSize * 1.1, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isSelected ? 0.8 : isHovered ? 0.5 : 0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, nodeSize * 1.8, 0]}
          fontSize={nodeSize * 0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={nodeSize * 0.05}
          outlineColor="#000000"
          maxWidth={50}
        >
          {node.label}
        </Text>
      </Billboard>

      {/* Source type indicator */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, -nodeSize * 1.5, 0]}
          fontSize={nodeSize * 0.4}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
          outlineWidth={nodeSize * 0.03}
          outlineColor="#000000"
        >
          {node.sourceType}
        </Text>
      </Billboard>
    </group>
  );
}

export function OptimizedNodeRenderer({
  nodes,
  positions,
  selectedNode,
  onNodeClick,
  hoveredNode,
  onNodeHover,
  onLODUpdate,
}: OptimizedNodeRendererProps) {
  const { camera } = useThree();

  // Simple frustum culling
  const visibleNodes = useMemo(() => {
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    const visible = nodes.filter((node) => {
      const pos = positions.get(node.id);
      if (!pos) return false;
      
      const nodePos = new THREE.Vector3(pos.x, pos.y, pos.z);
      const buffer = 200;
      const expandedPos = nodePos.clone();
      
      return frustum.containsPoint(nodePos) || 
             frustum.containsPoint(expandedPos.add(new THREE.Vector3(buffer, buffer, buffer))) ||
             frustum.containsPoint(expandedPos.sub(new THREE.Vector3(buffer * 2, buffer * 2, buffer * 2)));
    });

    return visible;
  }, [nodes, positions, camera.projectionMatrix, camera.matrixWorldInverse]);

  // Calculate LOD distribution
  useFrame(() => {
    if (onLODUpdate) {
      const distribution = { particle: 0, icon: 0, thumbnail: 0, full: 0 };
      
      visibleNodes.forEach((node) => {
        const pos = positions.get(node.id);
        if (pos) {
          const dist = camera.position.distanceTo(
            new THREE.Vector3(pos.x, pos.y, pos.z)
          );
          const lodType = getLODType(dist);
          distribution[lodType]++;
        }
      });
      
      onLODUpdate(distribution);
    }
  });

  return (
    <>
      {visibleNodes.map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;

        return (
          <NodeWithLOD
            key={node.id}
            node={node}
            position={position}
            isSelected={selectedNode === node.id}
            isHovered={hoveredNode === node.id}
            onClick={() => onNodeClick(node.id)}
            onPointerOver={() => onNodeHover(node.id)}
            onPointerOut={() => onNodeHover(null)}
          />
        );
      })}
    </>
  );
}