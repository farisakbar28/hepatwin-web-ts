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
import { AlertOctagon, RefreshCw } from 'lucide-react';
import * as THREE from 'three';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errMessage = error instanceof Error ? error.message : String(error);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white text-slate-800 p-6 text-center">
      <AlertOctagon className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-lg font-bold text-slate-900 mb-2">WebGL Renderer Terhenti</h2>
      <p className="text-sm text-slate-500 max-w-md mb-4 font-mono bg-slate-50 p-2 rounded border border-rose-200 break-words">
        {errMessage}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm transition-colors border border-slate-300 text-slate-700"
      >
        Muat Ulang 3D Canvas
      </button>
    </div>
  );
}

export function Canvas3DViewer() {
  const { mode, simulationResult } = useAppStore();
  const damageSeverity = simulationResult?.damage_severity || 0;
  const affectedZone = (simulationResult?.affected_zone as AffectedZone) || 'Macro_Generic';
  const visualPattern = simulationResult?.visual_pattern || 'heatmap_generik';
  const compoundClass = simulationResult?.compound_class || 'dose_dependent';
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const defaultCamPos = new THREE.Vector3(0, 0, 7);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  const handleHotspotClick = (zone: string, worldPos?: THREE.Vector3) => {
    if (!controlsRef.current || !worldPos) return;
    
    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;
    
    gsap.to(target, { x: worldPos.x, y: worldPos.y, z: worldPos.z, duration: 1.5, ease: "power2.inOut" });
    
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
    <>
      {/* Viewer Header Controls & Badges (with padding for visual spacing) */}
      <div className="flex justify-between items-center z-10 absolute top-0 left-0 right-0 p-4 sm:p-6">
          
          {/* View Toggles (Makro/Mikro) */}
          {mode === 'edukasi_mendalam' ? (
            <div className="flex gap-2 items-center">
                <button onClick={handleResetCamera} className="bg-blue-600 text-white border border-blue-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold transition-all">Makro</button>
                <button className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-default opacity-50" disabled>Mikro (Lobulus)</button>
            </div>
          ) : (
            <div>
                <span className="font-bold text-slate-800 text-sm">Heatmap Risiko DILI Generik (Makro)</span>
            </div>
          )}
          
          {/* Badges */}
          {mode === 'edukasi_mendalam' ? (
            compoundClass === 'dose_dependent' ? (
              <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                  PK/PD + AI ESTIMASI
              </div>
            ) : (
              <div className="bg-purple-600 text-white rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                  Digerakkan oleh AI
              </div>
            )
          ) : (
            <div className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                Tanpa Peta Zonal
            </div>
          )}
      </div>

      {/* R3F Canvas - Zero Margin absolute fill */}
      <div className="absolute inset-0 w-full h-full z-0">
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
      </div>

      {/* Viewer Footer: Hints & Legends (with padding for visual spacing) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
        <button 
          onClick={handleResetCamera}
          className="flex flex-row items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-transparent border-none p-0 shadow-none"
        >
          <RefreshCw size={14} />
          <span className="text-[10px] font-bold tracking-wide uppercase">Reset</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pointer-events-none z-10 flex flex-col justify-end">
          <div className="flex justify-between items-end text-[11px] text-slate-400 mb-4 border-b border-slate-100 pb-4">
              <span>model melayang bebas · drag untuk rotasi</span>
              <span>{mode === 'triase_umum' ? 'seluruh permukaan menyala merata tanpa hotspot zonal' : 'klik hotspot untuk zoom mikro'}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[11px] sm:text-xs font-medium text-slate-500 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 w-max mx-auto shadow-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div><span>Risiko rendah</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div><span>Risiko sedang</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0"></div><span>Risiko tinggi / nekrosis</span></div>
          </div>
      </div>
    </>
  );
}
