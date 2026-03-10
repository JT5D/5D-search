import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PerformanceTrackerProps {
  onUpdate: (stats: { drawCalls: number; triangles: number }) => void;
}

export function PerformanceTracker({ onUpdate }: PerformanceTrackerProps) {
  const { gl } = useThree();
  const updateCounter = useRef(0);

  useFrame(() => {
    // Update stats every 30 frames to reduce overhead
    updateCounter.current++;
    if (updateCounter.current >= 30) {
      const info = gl.info;
      onUpdate({
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
      });
      updateCounter.current = 0;
    }
  });

  return null;
}