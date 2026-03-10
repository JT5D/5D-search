// Source types for different data providers
export type SourceType = 
  | 'local'        // Local file system
  | 'web'          // Web search results
  | 'gdrive'       // Google Drive
  | 'github'       // GitHub repositories
  | 'youtube'      // YouTube videos
  | 'wikipedia'    // Wikipedia articles
  | 'image'        // Image search (Unsplash, etc.)
  | 'audio'        // Audio search (SoundCloud, etc.)
  | 'model3d'      // 3D models (Sketchfab, etc.)
  | 'social';      // Social media

// Media types for content classification
export type MediaType = 
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'model3d'
  | 'folder'
  | 'link'
  | 'text';

// Legacy node type for backward compatibility
export type NodeType = 'file' | 'folder' | 'concept' | 'page' | 'video' | 'model';

export type VisualizationMode = 'force' | 'tree' | 'cone';

// LOD rendering types
export type LODRenderType = 'particle' | 'icon' | 'thumbnail' | 'full';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  size: number;
  color: string;
  
  // Multi-source extensions
  sourceType: SourceType;
  mediaType: MediaType;
  
  children?: GraphNode[];
  metadata?: {
    description?: string;
    path?: string;
    tags?: string[];
    importance?: number;
    
    // Source-specific metadata
    sourceUrl?: string;           // Original URL
    thumbnailUrl?: string;        // Thumbnail image URL
    previewUrl?: string;          // Preview/embed URL
    author?: string;              // Content author
    createdAt?: string;           // Creation date
    duration?: number;            // For video/audio (seconds)
    fileSize?: number;            // File size in bytes
    dimensions?: {                // For images/videos
      width: number;
      height: number;
    };
    
    // GitHub-specific
    stars?: number;
    forks?: number;
    language?: string;
    
    // Stats
    views?: number;
    likes?: number;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export interface LODLevel {
  distance: number;
  renderType: LODRenderType;
}

export interface VisualizationSettings {
  mode: VisualizationMode;
  showLabels: boolean;
  maxDepth: number;
  nodeTypes: NodeType[];
  bloomIntensity: number;
  particleSize: number;
  
  // Multi-source filters
  sourcesEnabled: SourceType[];
  mediaTypesEnabled: MediaType[];
}

// Source configuration for visual distinction
export interface SourceConfig {
  type: SourceType;
  color: string;           // Cluster glow color
  icon: string;            // Icon name or emoji
  logoUrl?: string;        // Logo image URL
}

// Media type configuration
export interface MediaTypeConfig {
  type: MediaType;
  color: string;           // Particle color at far distance
  icon: string;            // Icon for medium distance
}