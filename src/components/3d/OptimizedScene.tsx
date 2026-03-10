import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GraphNode, GraphEdge, NodePosition, VisualizationMode } from '@/types';
import { OptimizedNodeRenderer } from './OptimizedNodeRenderer';
import { EdgeRenderer } from './EdgeRenderer';
import { PerformanceTracker } from './PerformanceTracker';
import { DebugHUD } from '../DebugHUD';
import { useState, useCallback, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface OptimizedSceneProps {
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

// Custom ground grid component using mesh to prevent flickering and R3F errors
function GroundGrid() {
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const size = 3000;
    const divisions = 30;
    const step = size / divisions;
    const halfSize = size / 2;

    // Create grid lines
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      
      // Horizontal lines
      vertices.push(-halfSize, 0, pos);
      vertices.push(halfSize, 0, pos);
      
      // Vertical lines
      vertices.push(pos, 0, -halfSize);
      vertices.push(pos, 0, halfSize);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  return (
    <lineSegments geometry={gridGeometry} position={[0, -150, 0]}>
      <lineBasicMaterial 
        color="#444444" 
        opacity={0.3} 
        transparent 
        depthWrite={false}
      />
    </lineSegments>
  );
}

export function OptimizedScene({
  nodes,
  edges,
  positions,
  mode,
  selectedNode,
  onNodeClick,
  hoveredNode,
  onNodeHover,
  bloomIntensity,
}: OptimizedSceneProps) {
  const [lodDistribution, setLodDistribution] = useState({
    particle: 0,
    icon: 0,
    thumbnail: 0,
    full: 0,
  });

  const [renderStats, setRenderStats] = useState({
    drawCalls: 0,
    triangles: 0,
  });

  const [showModeChange, setShowModeChange] = useState(false);

  const handleLODUpdate = useCallback((distribution: typeof lodDistribution) => {
    setLodDistribution(distribution);
  }, []);

  const handleStatsUpdate = useCallback((stats: typeof renderStats) => {
    setRenderStats(stats);
  }, []);

  // Show mode change notification
  useEffect(() => {
    setShowModeChange(true);
    const timer = setTimeout(() => setShowModeChange(false), 2000);
    return () => clearTimeout(timer);
  }, [mode]);

  const visibleNodeCount = lodDistribution.particle + lodDistribution.icon + lodDistribution.thumbnail + lodDistribution.full;

  console.log('🎬 OptimizedScene rendering with', nodes.length, 'nodes in', mode, 'mode');

  const modeLabels = {
    force: 'Force-Directed Layout',
    tree: 'Tree Hierarchy Layout',
    cone: 'Cone Tree Layout',
  };

  return (
    <>
      <Canvas
        key={mode}
        className="w-full h-full bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a]"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Camera - positioned further back to see more nodes */}
        <PerspectiveCamera makeDefault position={[0, 0, 800]} fov={75} />
        
        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={1.0}
          panSpeed={0.8}
          minDistance={50}
          maxDistance={5000}
          makeDefault
        />

        {/* Balanced lighting for visibility */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[200, 200, 200]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-200, -200, -200]} intensity={0.8} color="#60a5fa" />
        <directionalLight position={[200, -200, 200]} intensity={0.8} color="#a78bfa" />
        <pointLight position={[0, 300, 0]} intensity={1.0} color="#ffffff" distance={1000} />
        <pointLight position={[0, -300, 0]} intensity={0.8} color="#34d399" distance={1000} />
        
        {/* Non-flickering ground grid */}
        <GroundGrid />
        
        {/* Starfield */}
        <Stars
          radius={400}
          depth={200}
          count={5000}
          factor={4}
          saturation={0.3}
          fade
          speed={0.5}
        />

        {/* Graph elements */}
        <EdgeRenderer edges={edges} positions={positions} />
        <OptimizedNodeRenderer
          nodes={nodes}
          positions={positions}
          selectedNode={selectedNode}
          onNodeClick={onNodeClick}
          hoveredNode={hoveredNode}
          onNodeHover={onNodeHover}
          onLODUpdate={handleLODUpdate}
        />

        {/* Performance tracker */}
        <PerformanceTracker onUpdate={handleStatsUpdate} />

        {/* Reasonable bloom effect */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Mode change notification */}
      {showModeChange && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 glass rounded-lg px-6 py-3 text-sm border-2 border-blue-500/50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <div className="font-semibold text-blue-300">Layout Changed</div>
              <div className="text-gray-300 text-xs">{modeLabels[mode]}</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug HUD with LOD info */}
      <DebugHUD
        totalNodes={nodes.length}
        visibleNodes={visibleNodeCount}
        lodDistribution={lodDistribution}
        drawCalls={renderStats.drawCalls}
        triangles={renderStats.triangles}
      />

      {/* LOD Info Overlay */}
      <div className="absolute bottom-20 left-4 glass rounded-lg p-3 text-xs max-w-xs">
        <div className="font-semibold mb-2 text-purple-300">LOD Distribution:</div>
        <div className="space-y-1 text-gray-300">
          <div className="flex justify-between">
            <span>🔴 Particle (far):</span>
            <span className="font-medium">{lodDistribution.particle}</span>
          </div>
          <div className="flex justify-between">
            <span>🟡 Icon (medium):</span>
            <span className="font-medium">{lodDistribution.icon}</span>
          </div>
          <div className="flex justify-between">
            <span>🟢 Thumbnail (close):</span>
            <span className="font-medium">{lodDistribution.thumbnail}</span>
          </div>
          <div className="flex justify-between">
            <span>⚪ Full (very close):</span>
            <span className="font-medium">{lodDistribution.full}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-400">
          💡 Zoom in/out to see LOD changes
        </div>
      </div>
    </>
  );
}