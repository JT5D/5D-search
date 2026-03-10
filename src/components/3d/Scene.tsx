import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GraphNode, GraphEdge, NodePosition, VisualizationMode } from '@/types';
import { NodeRenderer } from './NodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';

interface SceneProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, NodePosition>;
  mode: VisualizationMode;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  hoveredNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
  bloomIntensity: number;
}

export function Scene({
  nodes,
  edges,
  positions,
  selectedNode,
  onNodeClick,
  hoveredNode,
  onNodeHover,
  bloomIntensity,
}: SceneProps) {
  return (
    <Canvas className="w-full h-full bg-[#0a0a0a]">
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 500]} fov={60} />
      
      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={10}
        maxDistance={3000}
      />

      {/* Lighting for dark mode */}
      <ambientLight intensity={0.3} color="#4a5568" />
      <pointLight position={[100, 100, 100]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[-100, -100, -100]} intensity={0.6} color="#a78bfa" />
      <pointLight position={[0, 200, 0]} intensity={0.4} color="#34d399" />
      
      {/* Starfield background */}
      <Stars
        radius={300}
        depth={100}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Graph elements */}
      <EdgeRenderer edges={edges} positions={positions} />
      <NodeRenderer
        nodes={nodes}
        positions={positions}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
        hoveredNode={hoveredNode}
        onNodeHover={onNodeHover}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}