import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { HumanLiverModel } from './HumanLiverModel';
import { useAppStore } from '../../state/store';
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
  const { simulationResult } = useAppStore();
  
  const damageSeverity = simulationResult?.DILI_probability || 0;
  const riskLevel = simulationResult?.risk_level || 'low';
  const affectedSegments = simulationResult?.affected_segments || [];

  const isDiffuse = affectedSegments.includes('ALL_DIFFUSE') || affectedSegments.length === 0;

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const defaultCamPos = new THREE.Vector3(0, 0, 7);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  const handleHotspotClick = (_zone: string, worldPos?: THREE.Vector3) => {
    if (!controlsRef.current || !worldPos) return;
    
    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;
    
    gsap.to(target, { x: worldPos.x, y: worldPos.y, z: worldPos.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(cameraPos, { x: worldPos.x + 1.5, y: worldPos.y + 1.0, z: worldPos.z + 2.5, duration: 1.5, ease: "power2.inOut" });
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
      <div className="flex justify-between items-center z-10 absolute top-0 left-0 right-0 p-4 sm:p-6 pointer-events-none">
          <div>
              <span className="font-bold text-slate-800 text-sm drop-shadow-md">Anatomi 8 Segmen Couinaud</span>
          </div>
          
          <div className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
              riskLevel === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
              riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              'bg-green-100 text-green-700 border-green-200'
          } border`}>
              {isDiffuse ? 'Seluruh Hati (Difus)' : `Segmen Terpengaruh: ${affectedSegments.join(', ')}`}
          </div>
      </div>

      {/* R3F Canvas */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Canvas shadows camera={{ position: defaultCamPos.toArray(), fov: 45 }} gl={{ alpha: true }}>
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
              <HumanLiverModel 
                damageSeverity={damageSeverity} 
                affectedZone={isDiffuse ? 'Macro_Generic' : 'Zone_3'} 
                visualPattern={isDiffuse ? 'heatmap_generik' : 'centrilobular_necrosis'}
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

      {/* Viewer Footer: Hints & Legends */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
        <button 
          onClick={handleResetCamera}
          className="flex flex-row items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-white/80 backdrop-blur rounded-full px-3 py-2 shadow-sm border border-slate-200"
        >
          <RefreshCw size={14} />
          <span className="text-[10px] font-bold tracking-wide uppercase">Reset View</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pointer-events-none z-10 flex flex-col justify-end">
          <div className="flex justify-between items-end text-[11px] text-slate-500 font-medium mb-4 border-b border-slate-200 pb-4">
              <span className="bg-white/70 px-2 py-1 rounded">model melayang bebas · drag untuk rotasi</span>
              <span className="bg-white/70 px-2 py-1 rounded">{isDiffuse ? 'seluruh permukaan menyala merata tanpa hotspot' : 'klik area berkedip untuk zoom in segmen'}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[11px] sm:text-xs font-bold text-slate-600 bg-white/90 backdrop-blur-md rounded-full py-2.5 px-6 w-max mx-auto shadow-md border border-slate-200">
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#5DCAA5] shadow-inner"></div><span>Risiko rendah</span></div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#EF9F27] shadow-inner"></div><span>Risiko sedang</span></div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#E24B4A] shadow-inner"></div><span>Risiko tinggi</span></div>
          </div>
      </div>
    </>
  );
}
