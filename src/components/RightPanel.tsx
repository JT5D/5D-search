import { GraphNode, VisualizationMode, NodeType, VisualizationSettings } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RightPanelProps {
  selectedNode: GraphNode | null;
  settings: VisualizationSettings;
  onSettingsChange: (settings: Partial<VisualizationSettings>) => void;
  totalNodes: number;
  visibleNodes: number;
}

const modeLabels: Record<VisualizationMode, string> = {
  force: 'Force-Directed',
  tree: 'Tree Hierarchy',
  cone: 'Cone Tree',
};

export function RightPanel({
  selectedNode,
  settings,
  onSettingsChange,
  totalNodes,
  visibleNodes,
}: RightPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Controls & Details</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="space-y-6 mt-4">
              {/* Visualization Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Visualization Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(['force', 'tree', 'cone'] as VisualizationMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={settings.mode === mode ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => onSettingsChange({ mode })}
                    >
                      {modeLabels[mode]}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-labels">Show Labels</Label>
                    <Switch
                      id="show-labels"
                      checked={settings.showLabels}
                      onCheckedChange={(checked) => onSettingsChange({ showLabels: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bloom Intensity: {settings.bloomIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[settings.bloomIntensity]}
                      onValueChange={([value]) => onSettingsChange({ bloomIntensity: value })}
                      min={0}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Depth: {settings.maxDepth}</Label>
                    <Slider
                      value={[settings.maxDepth]}
                      onValueChange={([value]) => onSettingsChange({ maxDepth: value })}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Particle Size: {settings.particleSize.toFixed(1)}</Label>
                    <Slider
                      value={[settings.particleSize]}
                      onValueChange={([value]) => onSettingsChange({ particleSize: value })}
                      min={0.5}
                      max={5}
                      step={0.1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Node Type Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Node Type Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(['file', 'folder', 'concept', 'page', 'video', 'model'] as NodeType[]).map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <Label htmlFor={`filter-${type}`} className="capitalize">
                        {type}
                      </Label>
                      <Switch
                        id={`filter-${type}`}
                        checked={settings.nodeTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...settings.nodeTypes, type]
                            : settings.nodeTypes.filter((t) => t !== type);
                          onSettingsChange({ nodeTypes: newTypes });
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Nodes:</span>
                    <span className="font-medium">{totalNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visible Nodes:</span>
                    <span className="font-medium">{visibleNodes}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              {selectedNode ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedNode.label}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{selectedNode.type}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{selectedNode.metadata?.description || 'No description'}</p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm text-muted-foreground">Path</Label>
                      <p className="text-sm mt-1 font-mono">{selectedNode.metadata?.path || 'N/A'}</p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedNode.metadata?.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm text-muted-foreground">Properties</Label>
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{selectedNode.size.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Importance:</span>
                          <span>{(selectedNode.metadata?.importance || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Children:</span>
                          <span>{selectedNode.children?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Select a node to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}