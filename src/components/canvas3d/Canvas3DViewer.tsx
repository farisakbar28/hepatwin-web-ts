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

function CanvasLoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-slate-500 z-10">
      Memuat model 3D hati...
    </div>
  );
}

const segmentSet = new Set(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']);

function normalizeSegments(segments: string[]): string[] {
  return segments.filter((segment) => segmentSet.has(segment));
}

function mapPatternToVisual(injuryPattern: string, segments: string[]) {
  const pattern = injuryPattern.toLowerCase();
  const hasDiffuseMarker = segments.includes('ALL_DIFFUSE');

  if (hasDiffuseMarker || pattern.includes('mixed') || pattern.includes('diffuse') || segments.length === 0) {
    return {
      affectedZone: 'Macro_Generic',
      visualPattern: 'heatmap_generik',
      isDiffuse: true,
    };
  }

  if (pattern.includes('cholestatic') || pattern.includes('portal')) {
    return {
      affectedZone: 'Portal_Periportal',
      visualPattern: 'portal_inflammation',
      isDiffuse: false,
    };
  }

  return {
    affectedZone: 'Zone_3',
    visualPattern: 'centrilobular_necrosis',
    isDiffuse: false,
  };
}

const priorityLabel = {
  low: 'Prioritas rendah in-silico',
  medium: 'Prioritas sedang in-silico',
  high: 'Prioritas tinggi untuk kajian lanjut',
};

export function Canvas3DViewer() {
  const { simulationResult } = useAppStore();

  const damageSeverity = Number.isFinite(simulationResult?.dili_score) ? Math.min(Math.max(simulationResult?.dili_score || 0, 0), 1) : 0;
  const riskLevel = simulationResult?.risk_level || 'low';
  const affectedSegmentsRaw = simulationResult?.affected_segments || [];
  const affectedSegments = normalizeSegments(affectedSegmentsRaw);
  const visual = mapPatternToVisual(simulationResult?.injury_pattern || '', affectedSegmentsRaw);

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
              {simulationResult?.segment_mapping_type && (
                <p className="text-[10px] text-slate-500 mt-1 bg-white/80 rounded px-2 py-1 w-max">{simulationResult.segment_mapping_type}</p>
              )}
          </div>

          <div className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
              riskLevel === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
              riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              'bg-green-100 text-green-700 border-green-200'
          } border`}>
              {visual.isDiffuse ? 'Seluruh Hati (Difus)' : `Segmen Terpengaruh: ${affectedSegments.join(', ') || 'tidak tersedia'}`}
          </div>
      </div>

      <div className="absolute inset-0 w-full h-full z-0">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CanvasLoadingFallback />}>
            <Canvas shadows camera={{ position: defaultCamPos.toArray(), fov: 45 }} gl={{ alpha: true }}>
              <Environment preset="city" />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
              <HumanLiverModel
                damageSeverity={damageSeverity}
                affectedZone={visual.affectedZone}
                visualPattern={visual.visualPattern}
                blinkingSpeed={simulationResult?.blinking_speed || 'none'}
                visualColor={simulationResult?.visual_color || 'green'}
                onHotspotClick={handleHotspotClick}
              />
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
          </Suspense>
        </ErrorBoundary>
      </div>

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
              <span className="bg-white/70 px-2 py-1 rounded">{visual.isDiffuse ? 'seluruh permukaan menyala merata tanpa hotspot' : 'klik area berkedip untuk zoom in segmen'}</span>
          </div>

          {simulationResult?.segment_mapping_not_clinical_localization && (
            <div className="text-[10px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-xl px-3 py-2 mb-3 w-max mx-auto max-w-[90%] text-center">
              Pemetaan segmen bersifat pedagogical heuristic, bukan lokalisasi klinis cedera hati.
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[11px] sm:text-xs font-bold text-slate-600 bg-white/90 backdrop-blur-md rounded-full py-2.5 px-6 w-max mx-auto shadow-md border border-slate-200">
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#5DCAA5] shadow-inner"></div><span>{priorityLabel.low}</span></div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#EF9F27] shadow-inner"></div><span>{priorityLabel.medium}</span></div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#E24B4A] shadow-inner"></div><span>{priorityLabel.high}</span></div>
          </div>
      </div>
    </>
  );
}
