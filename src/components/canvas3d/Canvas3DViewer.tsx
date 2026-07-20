import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { PlaceholderLiverScene } from './PlaceholderLiverScene';

export const Canvas3DViewer: React.FC = () => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <PlaceholderLiverScene />
        </Suspense>
        <OrbitControls 
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Overlay Info */}
      <div className="absolute top-4 right-4 text-right pointer-events-none">
        <h2 className="text-slate-300 font-mono text-sm">3D WebGL Renderer Actvated</h2>
        <p className="text-slate-500 font-mono text-xs mt-1">Placeholder Geometries (Pre-Asset)</p>
      </div>
    </div>
  );
};
