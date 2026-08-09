import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CouinaudLiverModel } from './CouinaudLiverModel';
import { deriveSimulationVisual } from './simulationVisual';
import { useAppStore } from '../../state/store';
import gsap from 'gsap';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import * as THREE from 'three';

// Konstanta modul: hindari alokasi THREE.Vector3 baru setiap re-render
const DEFAULT_CAM_POS = new THREE.Vector3(0, 0, 7);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

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
  const visual = deriveSimulationVisual(simulationResult);

  const riskLevel = simulationResult?.risk_level || 'low';

  const controlsRef = useRef<OrbitControlsImpl>(null);

  // FIX 2: tooltip info segmen MENGIKUTI KURSOR (bukan panel tetap di kanan atas).
  // State berisi segmen + posisi layar (clientX/Y) dari event pointer hotspot.
  const [hoverState, setHoverState] = useState<{ segment: string; x: number; y: number } | null>(null);

  const handleHotspotClick = (segmentRoman: string, worldPos?: THREE.Vector3, screenX?: number, screenY?: number) => {
    // V-09: klik hotspot -> kamera fokus. Label segmen tetap tampil (kini sebagai
    // tooltip di posisi kursor, bukan panel tetap). Perilaku kamera TIDAK berubah.
    if (screenX !== undefined && screenY !== undefined) {
      setHoverState({ segment: segmentRoman, x: screenX, y: screenY });
    }
    if (!controlsRef.current) return;

    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;
    // Fokus kamera ke posisi hotspot segmen yang diklik (worldPos dari event)
    const focus = worldPos ?? DEFAULT_TARGET;

    gsap.to(target, { x: focus.x, y: focus.y, z: focus.z, duration: 1.5, ease: 'power2.inOut' });
    gsap.to(cameraPos, { x: focus.x + 1.5, y: focus.y + 1.0, z: focus.z + 2.5, duration: 1.5, ease: 'power2.inOut' });
  };

  const handleHotspotHover = (segmentRoman: string | null, screenX?: number, screenY?: number) => {
    if (segmentRoman === null || screenX === undefined || screenY === undefined) {
      setHoverState(null);
      return;
    }
    setHoverState({ segment: segmentRoman, x: screenX, y: screenY });
  };

  const handlePointerLeaveCanvas = () => {
    setHoverState(null);
  };

  const handleResetCamera = () => {
    setHoverState(null);
    if (!controlsRef.current) return;
    const target = controlsRef.current.target;
    const cameraPos = controlsRef.current.object.position;

    gsap.to(target, { x: DEFAULT_TARGET.x, y: DEFAULT_TARGET.y, z: DEFAULT_TARGET.z, duration: 1.5, ease: 'power2.inOut' });
    gsap.to(cameraPos, { x: DEFAULT_CAM_POS.x, y: DEFAULT_CAM_POS.y, z: DEFAULT_CAM_POS.z, duration: 1.5, ease: 'power2.inOut' });
  };

  const hasSegments = visual.affectedSegments.length > 0;
  // Phase 2-5 plan: simulationResult === null -> model only, NO defaults.
  // Badge hanya dirender saat sudah ada hasil simulasi.
  const badgeText = visual.isDiffuse
    ? 'Seluruh Hati (Difus)'
    : hasSegments
      ? `Segmen Terpengaruh: ${visual.affectedSegments.join(', ')}`
      : 'Segmen Terpengaruh: tidak tersedia';

  const hintText = visual.isFallbackNoEvidence
    ? 'seluruh 8 segmen menyala redup tanpa pola spesifik (evidence unavailable)'
    : visual.isDiffuse
      ? '8 segmen menyala — klik hotspot untuk zoom in segmen'
      : hasSegments
        ? 'klik area berkedip untuk zoom in segmen'
        : 'model hati — jalankan simulasi untuk melihat hotspot';

  return (
    <>
      <div className="flex justify-between items-start z-10 absolute top-0 left-0 right-0 p-4 sm:p-6 pointer-events-none">
        <div>
          <span className="font-bold text-slate-800 text-sm drop-shadow-md">Anatomi 8 Segmen Couinaud</span>
          {/* Koreksi #3: label segment_mapping_type DINAMIS dari backend, bukan hardcode */}
          {simulationResult?.segment_mapping_type && (
            <p className="text-[10px] text-slate-500 mt-1 bg-white/80 rounded px-2 py-1 w-max">
              Pemetaan segmen: <span className="font-semibold text-slate-600">{simulationResult.segment_mapping_type}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {simulationResult && (
            <div
              className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase border ${
                riskLevel === 'high'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-green-100 text-green-700 border-green-200'
              }`}
            >
              {badgeText}
            </div>
          )}
          {/* Koreksi #1: label eksplisit "evidence unavailable" saat fallback no-monograf */}
          {visual.isFallbackNoEvidence && (
            <div className="rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase bg-slate-800 text-amber-300 border border-slate-700">
              Evidence unavailable — tidak ada data pola cedera spesifik
            </div>
          )}
        </div>
      </div>

      {/* R3F Canvas */}
      <div className="absolute inset-0 w-full h-full z-0" onPointerLeave={handlePointerLeaveCanvas}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Canvas shadows camera={{ position: DEFAULT_CAM_POS.toArray(), fov: 45 }} gl={{ alpha: true }}>
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
              <CouinaudLiverModel
                simulationResult={simulationResult}
                onHotspotClick={handleHotspotClick}
                onHotspotHover={handleHotspotHover}
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

      {/* FIX 2: tooltip mengikuti kursor — posisi fixed di clientX/Y + offset 14px,
          pointer-events-none agar tidak mengganggu interaksi canvas/hotspot.
          Hilang otomatis saat pointer keluar hotspot (onPointerOut) / keluar kanvas. */}
      {hoverState && (
        <div
          className="pointer-events-none fixed z-50 bg-slate-800 text-white rounded-full px-3 py-1.5 text-[11px] font-bold shadow-md border border-white/20"
          style={{ left: hoverState.x + 14, top: hoverState.y + 14 }}
        >
          Segmen {hoverState.segment}
        </div>
      )}

      {/* Viewer Footer: Hints & Legends */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-2">
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
          <span className="bg-white/70 px-2 py-1 rounded">{hintText}</span>
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
