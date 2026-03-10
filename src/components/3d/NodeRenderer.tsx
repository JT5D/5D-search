import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNode, NodePosition, LODRenderType } from '@/types';

interface NodeRendererProps {
  nodes: GraphNode[];
  positions: Map<string, NodePosition>;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  hoveredNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
}

// LOD distance thresholds
const LOD_THRESHOLDS = {
  PARTICLE: 1000,      // > 1000 units: particles
  ICON: 200,           // 200-1000: icons/planes
  THUMBNAIL: 50,       // 50-200: thumbnails
  FULL: 0,             // < 50: full media
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

function NodeInstance({
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
  const { camera } = useThree();
  const [distance, setDistance] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      const dist = camera.position.distanceTo(
        new THREE.Vector3(position.x, position.y, position.z)
      );
      setDistance(dist);
      
      // Smooth scale transition
      const targetScale = isSelected ? 1.5 : isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const lodType = useMemo(() => getLODType(distance), [distance]);
  const showLabel = useMemo(
    () => (lodType === 'full' || lodType === 'thumbnail') && (isSelected || isHovered),
    [lodType, isSelected, isHovered]
  );

  const color = useMemo(() => {
    if (isSelected) return '#ffffff';
    if (isHovered) return '#ffff00';
    return node.color;
  }, [isSelected, isHovered, node.color]);

  // Particle rendering (far distance)
  if (lodType === 'particle') {
    return (
      <mesh position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[node.size * 0.3, 4, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    );
  }

  // Icon rendering (medium distance)
  if (lodType === 'icon') {
    return (
      <group position={[position.x, position.y, position.z]}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <planeGeometry args={[node.size * 2, node.size * 2]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Html center distanceFactor={10}>
            <div
              style={{
                fontSize: `${node.size * 8}px`,
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

  // Thumbnail rendering (medium-close distance)
  if (lodType === 'thumbnail') {
    return (
      <group position={[position.x, position.y, position.z]}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <planeGeometry args={[node.size * 3, node.size * 3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.4 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {node.metadata?.thumbnailUrl && (
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Html center distanceFactor={15}>
              <div
                style={{
                  width: `${node.size * 40}px`,
                  height: `${node.size * 40}px`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: isSelected
                    ? '3px solid #fff'
                    : isHovered
                    ? '2px solid #ff0'
                    : '1px solid rgba(255,255,255,0.3)',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(255,255,255,0.8)'
                    : isHovered
                    ? '0 0 10px rgba(255,255,0,0.6)'
                    : 'none',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={node.metadata.thumbnailUrl}
                  alt={node.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </Html>
          </Billboard>
        )}
        {showLabel && (
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              position={[0, node.size * 2, 0]}
              fontSize={0.8}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.1}
              outlineColor="#000000"
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
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.0 : isHovered ? 0.6 : 0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {showLabel && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, node.size * 1.5, 0]}
            fontSize={1}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.15}
            outlineColor="#000000"
            maxWidth={20}
          >
            {node.label}
          </Text>
        </Billboard>
      )}
      {node.metadata?.thumbnailUrl && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Html center distanceFactor={20}>
            <div
              style={{
                width: `${node.size * 60}px`,
                height: `${node.size * 60}px`,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.5)',
                boxShadow: '0 0 30px rgba(255,255,255,0.5)',
                cursor: 'pointer',
              }}
            >
              <img
                src={node.metadata.thumbnailUrl}
                alt={node.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

export function NodeRenderer({
  nodes,
  positions,
  selectedNode,
  onNodeClick,
  hoveredNode,
  onNodeHover,
}: NodeRendererProps) {
  return (
    <>
      {nodes.map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;

        return (
          <NodeInstance
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