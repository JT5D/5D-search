# Multi-Source Search Results 3D Visualization - Implementation Plan

## Overview
Transform the existing 3D knowledge graph into a comprehensive multi-source search results visualization system with dark mode, advanced LOD rendering, and support for millions of data points.

## Core Files to Create/Modify (Max 8 files)

### 1. **src/types/index.ts** - Extend type definitions
- Add new source types: local, web, gdrive, github, youtube, image, audio, model3d, wikipedia
- Add media types: image, video, audio, document, code, model3d
- Extend NodeType to include all media and source types
- Add LOD-specific types for particle/plane/full rendering
- Add metadata for thumbnails, preview URLs, source URLs

### 2. **src/data/mockData.ts** - Generate multi-source mock data
- Create mock data for different sources (GitHub repos, YouTube videos, images, etc.)
- Add thumbnail URLs and preview data
- Add source-specific metadata (repo stats, video duration, file sizes)
- Generate hierarchical clusters by source and media type
- Support generating millions of nodes efficiently

### 3. **src/components/3d/NodeRenderer.tsx** - Advanced LOD system
- Implement particle rendering for far distances (>1000 units)
- Implement plane/sprite rendering with icons for medium distances (200-1000 units)
- Implement plane with thumbnails for medium-close (50-200 units)
- Implement full media rendering for close distances (<50 units)
- Add color coding by media type at far distances
- Add icon overlays at medium distances
- Add thumbnail previews at medium-close distances

### 4. **src/components/3d/Scene.tsx** - Enhanced scene with clustering
- Add cluster visualization with source logos
- Add glow effects for far-distance clusters
- Optimize rendering for millions of nodes using instancing
- Add click-to-zoom camera animation
- Improve lighting for dark mode

### 5. **src/components/MediaViewer.tsx** - NEW: Media playback component
- Create HUD overlay for media playback
- Support image viewing, video embedding, audio playback
- Show metadata summary (title, source, description)
- Add "Open in new window" link
- Support 3D model viewing (basic)

### 6. **src/App.css** - Dark mode styles
- Implement dark mode color scheme
- Add custom scrollbar styles for dark theme
- Add glow effects and animations
- Ensure proper contrast ratios

### 7. **src/pages/Index.tsx** - Update main page
- Integrate MediaViewer component
- Add dark mode class to root
- Update UI for dark theme
- Add source filter controls
- Add media type filter controls

### 8. **src/lib/lodManager.ts** - Enhanced LOD manager
- Update distance thresholds for new LOD levels
- Add logic for particle/plane/full media transitions
- Optimize for millions of nodes
- Add instancing support calculations

## Implementation Steps

1. ✅ Read existing files and understand structure
2. ⬜ Update types to support multi-source and media types
3. ⬜ Create mock data generator for diverse sources
4. ⬜ Implement advanced LOD rendering system
5. ⬜ Create MediaViewer component for playback
6. ⬜ Update Scene with clustering and optimization
7. ⬜ Apply dark mode theme
8. ⬜ Update main page with new features
9. ⬜ Test and optimize performance

## Key Features to Implement

### LOD System
- **Far (>1000)**: Particles with color coding by media type
- **Medium (200-1000)**: Planes with icons, cluster logos visible
- **Medium-Close (50-200)**: Planes with thumbnail previews
- **Close (<50)**: Full media rendering (images, videos, 3D models)

### Source Distinction
- Far: Color-coded glows around clusters
- Medium: Source logos (GitHub, YouTube, etc.) above clusters
- Visual grouping by source type

### Media Type Distinction
- Far: Color-coded particles
- Medium: Icon overlays (image, video, audio icons)
- Medium-Close: Thumbnail previews
- Close: Full resolution media

### Dark Mode
- Dark background (#0a0a0a)
- Neon accent colors
- Glowing effects for nodes
- High contrast UI elements

## Success Criteria
- Dark mode fully implemented
- Support for 8+ different data sources
- 4-level LOD system working smoothly
- Click-to-zoom and media playback functional
- Performance optimized for 100k+ nodes
- Visual distinction clear at all LOD levels