import { useState, useEffect, useMemo, useCallback } from 'react';
import { OptimizedScene } from '@/components/3d/OptimizedScene';
import { LeftPanel } from '@/components/LeftPanel';
import { RightPanel } from '@/components/RightPanel';
import { MediaViewer } from '@/components/MediaViewer';
import {
  generateMockData,
  searchNodes,
  filterNodesByType,
  filterNodesBySource,
  filterNodesByMediaType,
  sourceConfigs,
} from '@/data/mockData';
import { calculateForceLayout, calculateTreeLayout, calculateConeTreeLayout } from '@/lib/graphUtils';
import { GraphNode, NodePosition, VisualizationSettings, VisualizationMode, SourceType, MediaType } from '@/types';

export default function Index() {
  const [graphData] = useState(() => generateMockData(5000));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [settings, setSettings] = useState<VisualizationSettings>({
    mode: 'force' as VisualizationMode,
    showLabels: true,
    maxDepth: 5,
    nodeTypes: ['file', 'folder', 'concept', 'page', 'video', 'model'],
    bloomIntensity: 1.2,
    particleSize: 2,
    sourcesEnabled: Object.keys(sourceConfigs) as SourceType[],
    mediaTypesEnabled: ['image', 'video', 'audio', 'document', 'code', 'model3d', 'folder', 'link', 'text'] as MediaType[],
  });

  // Filter nodes based on search and filters - memoized for performance
  const filteredNodes = useMemo(() => {
    let nodes = graphData.nodes;
    console.log('🔍 Starting with nodes:', nodes.length);

    // Apply search filter
    if (searchQuery.trim()) {
      nodes = searchNodes(nodes, searchQuery);
      console.log('🔍 After search filter:', nodes.length, 'query:', searchQuery);
    }

    // Apply type filter
    nodes = filterNodesByType(nodes, settings.nodeTypes);
    console.log('🔍 After type filter:', nodes.length);

    // Apply source filter
    nodes = filterNodesBySource(nodes, settings.sourcesEnabled);
    console.log('🔍 After source filter:', nodes.length);

    // Apply media type filter
    nodes = filterNodesByMediaType(nodes, settings.mediaTypesEnabled);
    console.log('🔍 After media type filter:', nodes.length);
    console.log('🔍 FINAL FILTERED NODES:', nodes.length);

    return nodes;
  }, [graphData.nodes, searchQuery, settings.nodeTypes, settings.sourcesEnabled, settings.mediaTypesEnabled]);

  // Calculate positions based on visualization mode - memoized for performance
  const positions = useMemo<Map<string, NodePosition>>(() => {
    const rootNode = graphData.nodes[0];

    console.log('📍 Calculating positions for', filteredNodes.length, 'nodes');
    let posMap: Map<string, NodePosition>;

    switch (settings.mode) {
      case 'tree':
        posMap = calculateTreeLayout(rootNode, filteredNodes);
        break;
      case 'cone':
        posMap = calculateConeTreeLayout(rootNode, filteredNodes);
        break;
      case 'force':
      default:
        posMap = calculateForceLayout(filteredNodes, graphData.edges);
        break;
    }

    console.log('📍 Position map size:', posMap.size);
    // Log first 3 positions for debugging
    let count = 0;
    posMap.forEach((pos, id) => {
      if (count < 3) {
        console.log(`📍 Node ${id}: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
        count++;
      }
    });

    return posMap;
  }, [settings.mode, filteredNodes, graphData.edges, graphData.nodes]);

  // Get selected node object - memoized
  const selectedNodeObj = useMemo(() => {
    if (!selectedNode) return null;
    return graphData.nodes.find((n) => n.id === selectedNode) || null;
  }, [selectedNode, graphData.nodes]);

  // Root node for tree navigation
  const rootNode = graphData.nodes[0];

  // Calculate filter percentage
  const filterPercentage = useMemo(() => {
    return Math.round((filteredNodes.length / graphData.nodes.length) * 100);
  }, [filteredNodes.length, graphData.nodes.length]);

  // Memoized callbacks for performance
  const handleSettingsChange = useCallback((newSettings: Partial<VisualizationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    console.log('🖱️ Node clicked:', nodeId);
    setSelectedNode(nodeId);
    setShowMediaViewer(true);
  }, []);

  const handleCloseMediaViewer = useCallback(() => {
    setShowMediaViewer(false);
  }, []);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  // Debug effect to log when filtered nodes change
  useEffect(() => {
    console.log('✅ FILTERED NODES UPDATED:', filteredNodes.length);
    console.log('✅ POSITIONS MAP SIZE:', positions.size);
  }, [filteredNodes, positions]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] dark">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center px-6 glass">
        <h1 className="text-xl font-bold neon-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
          Multi-Source 3D Search Visualization
        </h1>
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {settings.mode.toUpperCase()}
          </span>
          <span>•</span>
          <span className={`px-3 py-1 rounded-full border ${
            searchQuery.trim() 
              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse' 
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }`}>
            {filteredNodes.length.toLocaleString()} / {graphData.nodes.length.toLocaleString()} nodes
            {searchQuery.trim() && ` (${filterPercentage}%)`}
          </span>
          <span>•</span>
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            {settings.sourcesEnabled.length} sources
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0 border-r border-white/10">
          <LeftPanel
            rootNode={rootNode}
            onNodeSelect={setSelectedNode}
            selectedNode={selectedNode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <OptimizedScene
            nodes={filteredNodes}
            edges={graphData.edges}
            positions={positions}
            mode={settings.mode}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
            hoveredNode={hoveredNode}
            onNodeHover={handleNodeHover}
            bloomIntensity={settings.bloomIntensity}
          />

          {/* Search Results Indicator */}
          {searchQuery.trim() && (
            <div className="absolute top-4 right-4 glass rounded-lg p-4 text-sm max-w-xs border-2 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔍</span>
                <span className="font-semibold text-yellow-300">Search Active</span>
              </div>
              <div className="text-gray-300 space-y-1">
                <div>Query: <span className="text-white font-medium">"{searchQuery}"</span></div>
                <div>Results: <span className="text-green-400 font-bold">{filteredNodes.length}</span> nodes found</div>
                <div className="text-xs text-gray-400 mt-2">
                  💡 Nodes are LARGE and BRIGHT - scroll to zoom out if you don't see them
                </div>
              </div>
            </div>
          )}

          {/* Overlay Instructions */}
          <div className="absolute bottom-4 left-4 glass rounded-lg p-4 text-xs space-y-1 max-w-xs">
            <div className="font-semibold mb-2 text-blue-300">Controls:</div>
            <div className="text-gray-300">• <span className="text-blue-400">Left drag:</span> Rotate view</div>
            <div className="text-gray-300">• <span className="text-purple-400">Right drag:</span> Pan camera</div>
            <div className="text-gray-300">• <span className="text-green-400">Scroll:</span> Zoom in/out</div>
            <div className="text-gray-300">• <span className="text-yellow-400">Click node:</span> View media</div>
            <div className="text-gray-300">• <span className="text-pink-400">Hover:</span> Preview info</div>
            <div className="text-gray-300">• <span className="text-orange-400">Press D:</span> Toggle debug HUD</div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="font-semibold mb-2 text-purple-300">Visibility Tips:</div>
              <div className="text-gray-400 text-[10px] space-y-1">
                <div>• Nodes are 5X LARGER now</div>
                <div>• Always visible with labels</div>
                <div>• Bright colors and glow effects</div>
                <div>• Try zooming out to see all nodes</div>
              </div>
            </div>
          </div>

          {/* Source Legend */}
          {!searchQuery.trim() && (
            <div className="absolute top-4 left-4 glass rounded-lg p-3 text-xs max-w-xs">
              <div className="font-semibold mb-2 text-green-300">Active Sources:</div>
              <div className="grid grid-cols-2 gap-2">
                {settings.sourcesEnabled.map((source) => (
                  <div key={source} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: sourceConfigs[source].color,
                        boxShadow: `0 0 10px ${sourceConfigs[source].color}`,
                      }}
                    />
                    <span className="text-gray-300 text-[10px]">
                      {sourceConfigs[source].icon} {sourceConfigs[source].name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 border-l border-white/10">
          <RightPanel
            selectedNode={selectedNodeObj}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            totalNodes={graphData.nodes.length}
            visibleNodes={filteredNodes.length}
          />
        </div>
      </div>

      {/* Media Viewer Modal */}
      {showMediaViewer && selectedNodeObj && (
        <MediaViewer node={selectedNodeObj} onClose={handleCloseMediaViewer} />
      )}
    </div>
  );
}