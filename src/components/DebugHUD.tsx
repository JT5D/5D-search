import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  totalNodes: number;
  visibleNodes: number;
  drawCalls: number;
  triangles: number;
  lodDistribution: {
    particle: number;
    icon: number;
    thumbnail: number;
    full: number;
  };
  memoryUsage?: number;
}

interface DebugHUDProps {
  totalNodes: number;
  visibleNodes: number;
  lodDistribution: {
    particle: number;
    icon: number;
    thumbnail: number;
    full: number;
  };
  drawCalls: number;
  triangles: number;
}

interface PerformanceMemory {
  usedJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
}

export function DebugHUD({ totalNodes, visibleNodes, lodDistribution, drawCalls, triangles }: DebugHUDProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>(undefined);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const rafId = useRef<number>();

  // Keyboard toggle handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // FPS calculation using requestAnimationFrame
  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / deltaTime);
        
        // Keep FPS history for smoothing
        fpsHistory.current.push(currentFps);
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift();
        }
        
        const avgFps = Math.round(
          fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
        );

        setFps(avgFps);

        // Get memory usage
        const memory = (performance as { memory?: PerformanceMemory }).memory;
        if (memory?.usedJSHeapSize) {
          setMemoryUsage(Math.round(memory.usedJSHeapSize / 1048576));
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      rafId.current = requestAnimationFrame(updateFPS);
    };

    rafId.current = requestAnimationFrame(updateFPS);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 opacity-50 hover:opacity-100 transition-opacity">
        Press 'D' for debug info
      </div>
    );
  }

  const getFpsColor = (fpsValue: number) => {
    if (fpsValue >= 55) return 'text-green-400';
    if (fpsValue >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 right-4 glass rounded-lg p-4 text-xs font-mono space-y-2 min-w-[280px] z-50">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <span className="text-blue-300 font-semibold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* FPS */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400">FPS:</span>
        <span className={`font-bold text-lg ${getFpsColor(fps)}`}>
          {fps}
        </span>
      </div>

      {/* Nodes */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Nodes:</span>
          <span className="text-white">{totalNodes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Visible Nodes:</span>
          <span className="text-green-400">{visibleNodes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500">Culled:</span>
          <span className="text-gray-500">
            {(totalNodes - visibleNodes).toLocaleString()}
          </span>
        </div>
      </div>

      {/* LOD Distribution */}
      <div className="space-y-1 pt-2 border-t border-white/10">
        <div className="text-gray-400 mb-1">LOD Distribution:</div>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-purple-400">Particles:</span>
            <span className="text-white">{lodDistribution.particle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400">Icons:</span>
            <span className="text-white">{lodDistribution.icon}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">Thumbnails:</span>
            <span className="text-white">{lodDistribution.thumbnail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400">Full:</span>
            <span className="text-white">{lodDistribution.full}</span>
          </div>
        </div>
      </div>

      {/* Renderer Stats */}
      <div className="space-y-1 pt-2 border-t border-white/10">
        <div className="flex justify-between">
          <span className="text-gray-400">Draw Calls:</span>
          <span className="text-white">{drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Triangles:</span>
          <span className="text-white">{triangles.toLocaleString()}</span>
        </div>
        {memoryUsage !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-400">Memory:</span>
            <span className="text-white">{memoryUsage} MB</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-white/10 text-[10px] text-gray-500">
        Press 'D' to hide
      </div>
    </div>
  );
}