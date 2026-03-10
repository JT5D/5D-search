import { X, ExternalLink, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { GraphNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MediaViewerProps {
  node: GraphNode;
  onClose: () => void;
}

export function MediaViewer({ node, onClose }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpenSource = () => {
    if (node.metadata?.sourceUrl) {
      window.open(node.metadata.sourceUrl, '_blank');
    }
  };

  const renderMedia = () => {
    switch (node.mediaType) {
      case 'image':
        return (
          <div className="relative w-full h-96 bg-black/50 rounded-lg overflow-hidden">
            <img
              src={node.metadata?.thumbnailUrl || 'https://picsum.photos/800/600'}
              alt={node.label}
              className="w-full h-full object-contain"
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-96 bg-black/50 rounded-lg overflow-hidden">
            {node.metadata?.previewUrl ? (
              <iframe
                src={node.metadata.previewUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="!bg-transparent !hover:bg-transparent border-white text-white"
                >
                  {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Video
                </Button>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-48 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎵</div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="!bg-transparent !hover:bg-transparent border-white text-white"
              >
                {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isPlaying ? 'Pause' : 'Play'} Audio
              </Button>
              {node.metadata?.duration && (
                <p className="text-sm text-muted-foreground">
                  Duration: {Math.floor(node.metadata.duration / 60)}:
                  {(node.metadata.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        );

      case 'model3d':
        return (
          <div className="relative w-full h-96 bg-black/50 rounded-lg overflow-hidden">
            {node.metadata?.previewUrl ? (
              <iframe
                src={node.metadata.previewUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎲</div>
                  <p className="text-muted-foreground">3D Model Preview</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'document':
      case 'code':
      case 'text':
        return (
          <div className="relative w-full h-96 bg-black/50 rounded-lg overflow-hidden p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {node.mediaType === 'code' ? '💻' : '📄'}
              </div>
              <p className="text-muted-foreground">{node.metadata?.description}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-96 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-muted-foreground">Preview not available</p>
          </div>
        );
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 border-2">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {node.sourceType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {node.mediaType}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{node.label}</h2>
            {node.metadata?.author && (
              <p className="text-sm text-muted-foreground">by {node.metadata.author}</p>
            )}
          </div>

          {/* Media */}
          {renderMedia()}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {node.metadata?.createdAt && (
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(node.metadata.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {node.metadata?.fileSize && (
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formatFileSize(node.metadata.fileSize)}</p>
              </div>
            )}
            {node.metadata?.dimensions && (
              <div>
                <p className="text-muted-foreground">Dimensions</p>
                <p className="font-medium">
                  {node.metadata.dimensions.width} × {node.metadata.dimensions.height}
                </p>
              </div>
            )}
            {node.metadata?.views && (
              <div>
                <p className="text-muted-foreground">Views</p>
                <p className="font-medium">{node.metadata.views.toLocaleString()}</p>
              </div>
            )}
            {node.metadata?.stars && (
              <div>
                <p className="text-muted-foreground">Stars</p>
                <p className="font-medium">⭐ {node.metadata.stars.toLocaleString()}</p>
              </div>
            )}
            {node.metadata?.language && (
              <div>
                <p className="text-muted-foreground">Language</p>
                <p className="font-medium">{node.metadata.language}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {node.metadata?.description && (
            <div>
              <p className="text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{node.metadata.description}</p>
            </div>
          )}

          {/* Tags */}
          {node.metadata?.tags && node.metadata.tags.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {node.metadata.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleOpenSource} className="flex-1">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Source
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}