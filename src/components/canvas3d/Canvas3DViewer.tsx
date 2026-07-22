import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { HumanLiverModel } from './HumanLiverModel';
import { useAppStore } from '../../state/store';
import type { AffectedZone } from '../../types';
import gsap from 'gsap';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { AlertOctagon } from 'lucide-react';
import * as THREE from 'three';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errMessage = error instanceof Error ? error.message : String(error);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-6 text-center">
      <AlertOctagon className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-lg font-bold text-slate-100 mb-2">WebGL Renderer Terhenti</h2>
      <p className="text-sm text-slate-400 max-w-md mb-4 font-mono bg-slate-950 p-2 rounded border border-rose-900/50 break-words">
        {errMessage}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm transition-colors border border-slate-700"
      >
        Muat Ulang 3D Canvas
      </button>
    </div>
  );
}

export function Canvas3DViewer() {
  const { simulationResult } = useAppStore();
  const damageSeverity = simulationResult?.damage_severity || 0;
  const affectedZone = (simulationResult?.affected_zone as AffectedZone) || 'Macro_Generic';
  const visualPattern = simulationResult?.visual_pattern || 'heatmap_generik';
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const defaultCamPos = new THREE.Vector3(0, 0, 7);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  const handleHotspotClick = (zone: string, worldPos?: THREE.Vector3) => {
    if (!controlsRef.current || !worldPos) return;
    
    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;
    
    // Zoom target tepat ke posisi dunia dari hotspot (akurat walau model di scale/translate)
    gsap.to(target, { x: worldPos.x, y: worldPos.y, z: worldPos.z, duration: 1.5, ease: "power2.inOut" });
    
    // Geser kamera mendekat berdasarkan zona agar tidak menabrak jeroan (offset relatif dari worldPos hotspot)
    if (zone === 'Zone_3') {
      gsap.to(cameraPos, { x: worldPos.x + 1.5, y: worldPos.y + 1.0, z: worldPos.z + 2.5, duration: 1.5, ease: "power2.inOut" });
    } else if (zone === 'Portal_Periportal') {
      gsap.to(cameraPos, { x: worldPos.x - 1.5, y: worldPos.y + 0.5, z: worldPos.z + 2.5, duration: 1.5, ease: "power2.inOut" });
    }
  };

  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;

    gsap.to(target, { x: defaultTarget.x, y: defaultTarget.y, z: defaultTarget.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(cameraPos, { x: defaultCamPos.x, y: defaultCamPos.y, z: defaultCamPos.z, duration: 1.5, ease: "power2.inOut" });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas shadows camera={{ position: defaultCamPos.toArray(), fov: 45 }} gl={{ alpha: true }}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <HumanLiverModel 
              damageSeverity={damageSeverity} 
              affectedZone={affectedZone} 
              visualPattern={visualPattern}
              onHotspotClick={handleHotspotClick}
            />
          </Suspense>
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            minDistance={2}
            maxDistance={15}
            minPolarAngle={Math.PI / 6} 
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={true}
            autoRotateSpeed={0.5}
            makeDefault
          />
        </Canvas>
      </ErrorBoundary>
      
      <div className="absolute top-4 right-4 text-right pointer-events-none flex flex-col items-end gap-2 z-10">
        <div>
          <h2 className="text-slate-300 font-mono text-sm font-semibold shadow-sm bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm">3D WebGL Renderer</h2>
          <p className="text-slate-500 font-mono text-xs mt-1 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm inline-block">Human Liver Model (GLB)</p>
        </div>
        
        <button 
          onClick={handleResetCamera}
          className="mt-2 pointer-events-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full border border-slate-600 backdrop-blur-sm transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Reset View
        </button>
      </div>
    </div>
  );
}
