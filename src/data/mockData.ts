import { GraphNode, GraphEdge, NodeType, SourceType, MediaType } from '@/types';

// Source configurations with colors and icons
const sourceConfigs = {
  local: { color: '#3b82f6', icon: '📁', name: 'Local Files' },
  web: { color: '#10b981', icon: '🌐', name: 'Web Search' },
  gdrive: { color: '#f59e0b', icon: '📊', name: 'Google Drive' },
  github: { color: '#8b5cf6', icon: '⚡', name: 'GitHub' },
  youtube: { color: '#ef4444', icon: '▶️', name: 'YouTube' },
  wikipedia: { color: '#06b6d4', icon: '📖', name: 'Wikipedia' },
  image: { color: '#ec4899', icon: '🖼️', name: 'Images' },
  audio: { color: '#f97316', icon: '🎵', name: 'Audio' },
  model3d: { color: '#14b8a6', icon: '🎲', name: '3D Models' },
  social: { color: '#a855f7', icon: '💬', name: 'Social' },
};

// Media type configurations with colors
const mediaTypeConfigs = {
  image: { color: '#ec4899', icon: '🖼️' },
  video: { color: '#ef4444', icon: '🎬' },
  audio: { color: '#f97316', icon: '🎵' },
  document: { color: '#3b82f6', icon: '📄' },
  code: { color: '#8b5cf6', icon: '💻' },
  model3d: { color: '#14b8a6', icon: '🎲' },
  folder: { color: '#f59e0b', icon: '📁' },
  link: { color: '#10b981', icon: '🔗' },
  text: { color: '#06b6d4', icon: '📝' },
};

// Legacy type colors for backward compatibility
const typeColors: Record<NodeType, string> = {
  file: '#3b82f6',
  folder: '#f59e0b',
  concept: '#8b5cf6',
  page: '#10b981',
  video: '#ef4444',
  model: '#06b6d4',
};

// Realistic file names by category
const realisticNames = {
  document: [
    'Q4 Financial Report.xlsx',
    'Meeting Notes 2024.docx',
    'Project Proposal.pdf',
    'Budget Analysis.xlsx',
    'Employee Handbook.pdf',
    'Marketing Strategy.pptx',
    'Sales Report December.xlsx',
    'Contract Agreement.pdf',
    'Product Roadmap.docx',
    'Annual Review.pdf',
    'Research Paper.docx',
    'Invoice Template.xlsx',
    'Business Plan.pdf',
    'Training Manual.docx',
    'Policy Document.pdf',
  ],
  video: [
    'Product Demo.mp4',
    'Tutorial Series Part 1.mp4',
    'Team Meeting Recording.mp4',
    'Conference Keynote.mp4',
    'How To Guide.mp4',
    'Customer Testimonial.mp4',
    'Project Walkthrough.mp4',
    'Training Session.mp4',
    'Webinar Recording.mp4',
    'Behind The Scenes.mp4',
    'Product Launch.mp4',
    'Interview Highlights.mp4',
    'Demo Day Presentation.mp4',
    'Workshop Recording.mp4',
    'Case Study Video.mp4',
  ],
  code: [
    'app.tsx',
    'index.ts',
    'utils.js',
    'README.md',
    'package.json',
    'config.yaml',
    'main.py',
    'server.go',
    'styles.css',
    'api.ts',
    'database.sql',
    'test.spec.ts',
    'components.tsx',
    'routes.js',
    'middleware.ts',
    'schema.graphql',
    'docker-compose.yml',
    'webpack.config.js',
    'Dockerfile',
    'requirements.txt',
  ],
  image: [
    'Screenshot 2024-11-02.png',
    'Logo Design Final.svg',
    'Product Photo.jpg',
    'Wireframe Mockup.png',
    'Team Photo.jpg',
    'Infographic.png',
    'Banner Image.jpg',
    'Icon Set.svg',
    'Chart Visualization.png',
    'Profile Picture.jpg',
    'Thumbnail.png',
    'Hero Image.jpg',
    'Diagram.svg',
    'Illustration.png',
    'Background Pattern.jpg',
  ],
  audio: [
    'Podcast Episode 42.mp3',
    'Background Music.wav',
    'Interview Recording.mp3',
    'Sound Effect.wav',
    'Voiceover.mp3',
    'Audio Book Chapter 1.mp3',
    'Music Track.wav',
    'Notification Sound.mp3',
    'Jingle.wav',
    'Speech Recording.mp3',
  ],
  model3d: [
    'Product Model.glb',
    'Character Rig.fbx',
    'Building Design.obj',
    'Furniture Set.glb',
    'Vehicle Model.fbx',
    'Environment Scene.obj',
    'Prototype.glb',
    'Animation.fbx',
    'Terrain Map.obj',
    'Asset Pack.glb',
  ],
  folder: [
    'Projects',
    'Documents',
    'Media Assets',
    'Code Repository',
    'Design Files',
    'Client Work',
    'Archive 2024',
    'Resources',
    'Templates',
    'Backups',
  ],
  link: [
    'Documentation Portal',
    'API Reference',
    'Tutorial Website',
    'Blog Article',
    'Resource Library',
    'External Tool',
    'Knowledge Base',
    'Support Forum',
    'Community Wiki',
    'Product Page',
  ],
  text: [
    'Notes.txt',
    'Ideas.md',
    'TODO List.txt',
    'Changelog.md',
    'Instructions.txt',
    'Summary.md',
    'Log File.txt',
    'Configuration.txt',
    'Data Export.csv',
    'Report.txt',
  ],
};

// Realistic descriptions
const descriptions = {
  document: [
    'Quarterly financial analysis and projections',
    'Comprehensive meeting minutes with action items',
    'Detailed project proposal with timeline',
    'Budget breakdown and expense tracking',
    'Company policies and procedures',
    'Strategic marketing plan for Q1',
    'Monthly sales performance metrics',
    'Legal contract and terms',
    'Product development roadmap',
    'Annual performance review summary',
  ],
  video: [
    'Live demonstration of new features',
    'Step-by-step tutorial for beginners',
    'Recorded team sync and discussions',
    'Industry conference presentation',
    'Instructional guide with examples',
    'Customer success story and feedback',
    'Detailed project overview',
    'Employee training materials',
    'Educational webinar content',
    'Production process documentation',
  ],
  code: [
    'Main application entry point',
    'Utility functions and helpers',
    'Project documentation',
    'Package dependencies',
    'Configuration settings',
    'Backend server logic',
    'Styling and CSS',
    'API endpoints',
    'Database schema',
    'Unit tests',
  ],
  image: [
    'Screen capture from application',
    'Brand identity and logo',
    'Product photography',
    'UI/UX design mockup',
    'Group photo',
    'Data visualization',
    'Marketing banner',
    'Icon collection',
    'Analytics chart',
    'Profile image',
  ],
  audio: [
    'Weekly podcast episode',
    'Ambient background track',
    'Recorded interview',
    'UI sound effect',
    'Narration audio',
    'Audio book content',
    'Original music composition',
    'Alert notification',
    'Brand audio signature',
    'Voice memo',
  ],
  model3d: [
    '3D product visualization',
    'Animated character model',
    'Architectural design',
    'Furniture collection',
    'Vehicle design',
    'Environment assets',
    'Prototype model',
    'Motion graphics',
    'Landscape terrain',
    'Game assets',
  ],
  folder: [
    'Project files and documents',
    'Document storage',
    'Media and assets',
    'Source code',
    'Design resources',
    'Client deliverables',
    'Historical records',
    'Reference materials',
    'Reusable templates',
    'System backups',
  ],
  link: [
    'Official documentation',
    'API documentation',
    'Learning resources',
    'Article and insights',
    'Resource collection',
    'Third-party integration',
    'Help center',
    'Community discussion',
    'Collaborative wiki',
    'Product information',
  ],
  text: [
    'Personal notes',
    'Brainstorming ideas',
    'Task checklist',
    'Version history',
    'Setup instructions',
    'Content summary',
    'System logs',
    'Settings file',
    'Exported data',
    'Text report',
  ],
};

// Realistic tags
const tags = {
  document: ['finance', 'report', 'business', 'analysis', 'planning', 'meeting', 'contract', 'policy'],
  video: ['tutorial', 'demo', 'training', 'presentation', 'recording', 'education', 'marketing'],
  code: ['typescript', 'javascript', 'python', 'react', 'api', 'backend', 'frontend', 'config'],
  image: ['design', 'photo', 'mockup', 'screenshot', 'logo', 'visualization', 'branding'],
  audio: ['podcast', 'music', 'interview', 'sound', 'voice', 'recording'],
  model3d: ['3d', 'model', 'design', 'animation', 'asset', 'prototype'],
  folder: ['archive', 'collection', 'storage', 'organization'],
  link: ['reference', 'documentation', 'resource', 'external', 'tool'],
  text: ['notes', 'todo', 'log', 'data', 'text'],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate realistic metadata based on source and media type
function generateMetadata(sourceType: SourceType, mediaType: MediaType, label: string) {
  const descArray = descriptions[mediaType] || descriptions.document;
  const tagArray = tags[mediaType] || tags.document;

  const baseMetadata = {
    description: getRandomItem(descArray),
    tags: [
      sourceType,
      mediaType,
      getRandomItem(tagArray),
      getRandomItem(tagArray),
    ],
    importance: Math.random(),
    sourceUrl: `https://example.com/${sourceType}/${generateId()}`,
    thumbnailUrl: `https://picsum.photos/seed/${generateId()}/200/200`,
    author: `User${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Add source-specific metadata
  if (sourceType === 'github') {
    return {
      ...baseMetadata,
      stars: Math.floor(Math.random() * 10000),
      forks: Math.floor(Math.random() * 1000),
      language: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'][Math.floor(Math.random() * 5)],
    };
  }

  if (sourceType === 'youtube' || mediaType === 'video') {
    return {
      ...baseMetadata,
      duration: Math.floor(Math.random() * 3600),
      views: Math.floor(Math.random() * 1000000),
      likes: Math.floor(Math.random() * 50000),
      dimensions: { width: 1920, height: 1080 },
      previewUrl: `https://www.youtube.com/embed/${generateId()}`,
    };
  }

  if (mediaType === 'audio') {
    return {
      ...baseMetadata,
      duration: Math.floor(Math.random() * 600),
      fileSize: Math.floor(Math.random() * 10000000),
    };
  }

  if (mediaType === 'image') {
    return {
      ...baseMetadata,
      dimensions: {
        width: 1920 + Math.floor(Math.random() * 1080),
        height: 1080 + Math.floor(Math.random() * 920),
      },
      fileSize: Math.floor(Math.random() * 5000000),
    };
  }

  if (mediaType === 'model3d') {
    return {
      ...baseMetadata,
      fileSize: Math.floor(Math.random() * 50000000),
      previewUrl: `https://sketchfab.com/models/${generateId()}/embed`,
    };
  }

  return baseMetadata;
}

function createNode(
  label: string,
  sourceType: SourceType,
  mediaType: MediaType,
  depth: number = 0
): GraphNode {
  const id = generateId();
  const legacyType: NodeType = mediaType === 'folder' ? 'folder' : 
                                mediaType === 'video' ? 'video' :
                                mediaType === 'model3d' ? 'model' :
                                mediaType === 'link' ? 'page' : 'file';
  
  return {
    id,
    label,
    type: legacyType,
    sourceType,
    mediaType,
    size: Math.random() * 3 + 1,
    color: mediaTypeConfigs[mediaType].color,
    metadata: generateMetadata(sourceType, mediaType, label),
  };
}

// Generate a cluster of nodes for a specific source
function generateSourceCluster(
  sourceType: SourceType,
  numNodes: number,
  clusterIndex: number
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const mediaTypes = Object.keys(mediaTypeConfigs) as MediaType[];
  
  // Create parent folder for this source cluster
  const folderName = getRandomItem(realisticNames.folder);
  const parentNode = createNode(
    `${folderName} ${clusterIndex + 1}`,
    sourceType,
    'folder',
    0
  );
  nodes.push(parentNode);
  
  // Generate child nodes with various media types and realistic names
  for (let i = 0; i < numNodes; i++) {
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
    const nameArray = realisticNames[mediaType] || realisticNames.document;
    const baseName = getRandomItem(nameArray);
    
    // Add some variation to avoid exact duplicates
    const label = i % 3 === 0 ? `${baseName}` : 
                  i % 3 === 1 ? baseName.replace(/\d+/, String(i)) :
                  `Copy of ${baseName}`;
    
    const node = createNode(
      label,
      sourceType,
      mediaType,
      1
    );
    nodes.push(node);
  }
  
  return nodes;
}

export function generateMockData(totalNodes: number = 1500): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const allNodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Create root node
  const root = createNode('Search Results', 'web', 'folder', 0);
  allNodes.push(root);
  
  // Distribute nodes across different sources
  const sources = Object.keys(sourceConfigs) as SourceType[];
  const nodesPerSource = Math.floor((totalNodes - 1) / sources.length);
  const clustersPerSource = Math.max(1, Math.floor(nodesPerSource / 50)); // ~50 nodes per cluster
  
  sources.forEach((sourceType) => {
    const nodesInCluster = Math.floor(nodesPerSource / clustersPerSource);
    
    for (let c = 0; c < clustersPerSource; c++) {
      const clusterNodes = generateSourceCluster(sourceType, nodesInCluster, c);
      const clusterRoot = clusterNodes[0];
      
      // Connect cluster root to main root
      edges.push({
        source: root.id,
        target: clusterRoot.id,
        strength: 0.8,
      });
      
      // Connect all nodes in cluster to cluster root
      clusterNodes.slice(1).forEach((node) => {
        edges.push({
          source: clusterRoot.id,
          target: node.id,
          strength: 0.6,
        });
      });
      
      allNodes.push(...clusterNodes);
    }
  });
  
  // Add some random cross-links between nodes (semantic relationships)
  const numCrossLinks = Math.floor(allNodes.length * 0.02);
  for (let i = 0; i < numCrossLinks; i++) {
    const source = allNodes[Math.floor(Math.random() * allNodes.length)];
    const target = allNodes[Math.floor(Math.random() * allNodes.length)];
    if (source.id !== target.id && source.id !== root.id && target.id !== root.id) {
      edges.push({
        source: source.id,
        target: target.id,
        strength: Math.random() * 0.3,
      });
    }
  }
  
  return {
    nodes: allNodes.slice(0, totalNodes),
    edges,
  };
}

export function searchNodes(nodes: GraphNode[], query: string): GraphNode[] {
  const lowerQuery = query.toLowerCase();
  return nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(lowerQuery) ||
      node.metadata?.description?.toLowerCase().includes(lowerQuery) ||
      node.metadata?.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      node.sourceType.toLowerCase().includes(lowerQuery) ||
      node.mediaType.toLowerCase().includes(lowerQuery)
  );
}

export function filterNodesByType(nodes: GraphNode[], types: NodeType[]): GraphNode[] {
  return nodes.filter((node) => types.includes(node.type));
}

export function filterNodesBySource(nodes: GraphNode[], sources: SourceType[]): GraphNode[] {
  return nodes.filter((node) => sources.includes(node.sourceType));
}

export function filterNodesByMediaType(nodes: GraphNode[], mediaTypes: MediaType[]): GraphNode[] {
  return nodes.filter((node) => mediaTypes.includes(node.mediaType));
}

// Export configurations for use in UI
export { sourceConfigs, mediaTypeConfigs };