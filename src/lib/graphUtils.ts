import * as d3 from 'd3-force';
import { GraphNode, GraphEdge, NodePosition } from '@/types';

export function calculateForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  
  // Create a set of valid node IDs for quick lookup
  const nodeIds = new Set(nodes.map(n => n.id));
  
  // Filter edges to only include those where both source and target exist in filtered nodes
  const validEdges = edges.filter(edge => 
    nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  // Create simulation nodes with initial random positions
  const simulationNodes = nodes.map((node) => ({
    id: node.id,
    x: (Math.random() - 0.5) * 500,
    y: (Math.random() - 0.5) * 500,
    z: (Math.random() - 0.5) * 500,
  }));

  // Create 2D force simulation for x and y
  const simulation = d3
    .forceSimulation(simulationNodes)
    .force(
      'link',
      d3
        .forceLink(validEdges)
        .id((d: d3.SimulationNodeDatum) => (d as { id: string }).id)
        .distance(30)
        .strength((d: d3.SimulationLinkDatum<d3.SimulationNodeDatum>) => (d as GraphEdge).strength || 0.5)
    )
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius(10))
    .stop();

  // Run simulation
  for (let i = 0; i < 300; ++i) {
    simulation.tick();
  }

  // Apply z-axis dispersion based on node importance
  simulationNodes.forEach((node) => {
    const graphNode = nodes.find((n) => n.id === node.id);
    const importance = graphNode?.metadata?.importance || 0.5;
    node.z = (importance - 0.5) * 200;
  });

  // Store positions
  simulationNodes.forEach((node) => {
    positions.set(node.id, {
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
    });
  });

  return positions;
}

export function calculateTreeLayout(
  rootNode: GraphNode,
  filteredNodes: GraphNode[]
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const nodeIds = new Set(filteredNodes.map(n => n.id));

  function layoutNode(
    node: GraphNode,
    depth: number,
    angle: number,
    radius: number
  ) {
    // Only layout nodes that are in the filtered set
    if (!nodeIds.has(node.id)) return;
    
    const x = Math.cos(angle) * radius;
    const y = depth * 80;
    const z = Math.sin(angle) * radius;

    positions.set(node.id, { x, y, z });

    if (node.children && node.children.length > 0) {
      const angleStep = (Math.PI * 2) / node.children.length;
      const childRadius = radius + 50;

      node.children.forEach((child, i) => {
        const childAngle = angle + angleStep * i;
        layoutNode(child, depth + 1, childAngle, childRadius);
      });
    }
  }

  layoutNode(rootNode, 0, 0, 0);
  return positions;
}

export function calculateConeTreeLayout(
  rootNode: GraphNode,
  filteredNodes: GraphNode[]
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const nodeIds = new Set(filteredNodes.map(n => n.id));

  function layoutNode(
    node: GraphNode,
    depth: number,
    angle: number,
    radius: number
  ) {
    // Only layout nodes that are in the filtered set
    if (!nodeIds.has(node.id)) return;
    
    const x = Math.cos(angle) * radius;
    const y = -depth * 100; // Cone points downward
    const z = Math.sin(angle) * radius;

    positions.set(node.id, { x, y, z });

    if (node.children && node.children.length > 0) {
      const angleStep = (Math.PI * 2) / node.children.length;
      const childRadius = radius + depth * 20; // Expanding cone

      node.children.forEach((child, i) => {
        const childAngle = angle + angleStep * i;
        layoutNode(child, depth + 1, childAngle, childRadius);
      });
    }
  }

  layoutNode(rootNode, 0, 0, 10);
  return positions;
}