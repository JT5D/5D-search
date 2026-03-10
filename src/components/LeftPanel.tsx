import { useState, useMemo } from 'react';
import { GraphNode, NodeType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Search, Folder, File, Box, FileText, Video, LucideIcon } from 'lucide-react';

interface LeftPanelProps {
  rootNode: GraphNode;
  onNodeSelect: (nodeId: string) => void;
  selectedNode: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const typeIcons: Record<NodeType, LucideIcon> = {
  folder: Folder,
  file: File,
  concept: Box,
  page: FileText,
  video: Video,
  model: Box,
};

function TreeNode({
  node,
  onSelect,
  selectedId,
  level = 0,
}: {
  node: GraphNode;
  onSelect: (id: string) => void;
  selectedId: string | null;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = typeIcons[node.type];
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-accent rounded-md transition-colors ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0 hover:bg-accent-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <Icon className="h-4 w-4" style={{ color: node.color }} />
        <span className="text-sm truncate flex-1">{node.label}</span>
        <Badge variant="outline" className="text-xs">
          {node.type}
        </Badge>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} selectedId={selectedId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultItem({
  node,
  onSelect,
  selectedId,
  query,
}: {
  node: GraphNode;
  onSelect: (id: string) => void;
  selectedId: string | null;
  query: string;
}) {
  const Icon = typeIcons[node.type];
  const isSelected = selectedId === node.id;

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-400/30 text-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`flex flex-col gap-1 py-2 px-3 cursor-pointer hover:bg-accent rounded-md transition-colors border-l-2 ${
        isSelected ? 'bg-accent border-l-primary' : 'border-l-transparent'
      }`}
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: node.color }} />
        <span className="text-sm font-medium truncate flex-1">{highlightText(node.label)}</span>
        <Badge variant="outline" className="text-xs">
          {node.sourceType}
        </Badge>
      </div>
      {node.metadata?.description && (
        <div className="text-xs text-muted-foreground pl-6 truncate">
          {highlightText(node.metadata.description)}
        </div>
      )}
      {node.metadata?.tags && node.metadata.tags.length > 0 && (
        <div className="flex gap-1 pl-6 flex-wrap">
          {node.metadata.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeftPanel({ rootNode, onNodeSelect, selectedNode, searchQuery, onSearchChange }: LeftPanelProps) {
  // Search through all nodes in the tree
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: GraphNode[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    const searchNode = (node: GraphNode) => {
      const matches =
        node.label.toLowerCase().includes(lowerQuery) ||
        node.metadata?.description?.toLowerCase().includes(lowerQuery) ||
        node.metadata?.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        node.sourceType.toLowerCase().includes(lowerQuery) ||
        node.mediaType.toLowerCase().includes(lowerQuery);

      if (matches) {
        results.push(node);
      }

      if (node.children) {
        node.children.forEach(searchNode);
      }
    };

    searchNode(rootNode);
    return results;
  }, [rootNode, searchQuery]);

  // Count total nodes in tree
  const totalNodes = useMemo(() => {
    let count = 0;
    const countNodes = (node: GraphNode) => {
      count++;
      if (node.children) {
        node.children.forEach(countNodes);
      }
    };
    countNodes(rootNode);
    return count;
  }, [rootNode]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Badge variant="secondary" className="text-xs">
            {totalNodes} nodes
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        {isSearching && (
          <div className="text-xs space-y-1">
            <div className="text-muted-foreground">
              🔍 Searching for: <span className="text-primary font-medium">"{searchQuery}"</span>
            </div>
            <div className="text-green-400 font-semibold">
              Found {searchResults.length} matching node{searchResults.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            // Show search results in flat list
            searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((node) => (
                  <SearchResultItem
                    key={node.id}
                    node={node}
                    onSelect={onNodeSelect}
                    selectedId={selectedNode}
                    query={searchQuery}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <div className="text-4xl mb-2">🔍</div>
                <div>No results found</div>
                <div className="text-xs mt-1">Try a different search term</div>
              </div>
            )
          ) : (
            // Show normal tree structure
            <TreeNode node={rootNode} onSelect={onNodeSelect} selectedId={selectedNode} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}