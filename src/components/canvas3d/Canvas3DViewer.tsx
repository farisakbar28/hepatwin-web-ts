import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CouinaudLiverModel } from './CouinaudLiverModel';
import { deriveSimulationVisual, VISUAL_COLORS } from './simulationVisual';
import { labelOrRaw, segmentMappingTypeLabel } from '../../constants/labels';
import { useAppStore } from '../../state/store';
import gsap from 'gsap';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import * as THREE from 'three';
import type { RiskLevel } from '../../types';

// Konstanta modul: hindari alokasi THREE.Vector3 baru setiap re-render
const DEFAULT_CAM_POS = new THREE.Vector3(0, 0, 7);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

/** Legend risiko in-silico — chip aktif (sesuai risk_level hasil) diberi ring highlight.
 *  Warna mengikuti VISUAL_COLORS (satu sumber kebenaran palet). */
const RISK_LEGEND: { level: RiskLevel; color: string; short: string; full: string }[] = [
  { level: 'low', color: VISUAL_COLORS.green, short: 'Rendah', full: 'Prioritas rendah (in-silico)' },
  { level: 'medium', color: VISUAL_COLORS.yellow, short: 'Sedang', full: 'Prioritas sedang (in-silico)' },
  { level: 'high', color: VISUAL_COLORS.red, short: 'Tinggi', full: 'Prioritas tinggi (in-silico)' },
];

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

  // Tooltip label segmen mengikuti kursor: state berisi segmen + posisi layar
  // (clientX/Y) dari event pointer hotspot.
  const [hoverState, setHoverState] = useState<{ segment: string; x: number; y: number } | null>(null);

  const handleHotspotClick = (segmentRoman: string, worldPos?: THREE.Vector3, screenX?: number, screenY?: number) => {
    // Klik hotspot -> kamera fokus. Label segmen tampil sebagai tooltip di posisi kursor.
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

  const hintText = visual.isFallbackNoEvidence
    ? 'seluruh 8 segmen menyala redup tanpa pola spesifik (evidence unavailable)'
    : visual.isDiffuse
      ? '8 segmen menyala - klik hotspot untuk zoom in segmen'
      : hasSegments
        ? 'klik area berkedip untuk zoom in segmen'
        : 'jalankan simulasi untuk melihat hotspot';

  const segmentSummary = visual.isDiffuse
    ? 'Seluruh Hati (Difus)'
    : hasSegments
      ? visual.affectedSegments.join(', ')
      : 'tidak tersedia';

  return (
    <>
      {/* Overlay atas — kompak & semi-transparan agar model tetap terlihat */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between gap-2 p-2.5 sm:p-4 lg:p-6 pointer-events-none">
        {/* Judul (kiri) */}
        <div className="min-w-0 max-w-[48vw] sm:max-w-none">
          <h1
            title={simulationResult?.segment_mapping_type ? labelOrRaw(segmentMappingTypeLabel, simulationResult.segment_mapping_type) : undefined}
            className="inline-flex items-center text-[11px] sm:text-sm font-bold text-slate-800 bg-white/85 backdrop-blur rounded-lg px-2 py-1 shadow-sm border border-slate-200/70 leading-tight"
          >
            <span className="hidden sm:inline">Anatomi&nbsp;</span>
            <span>8 Segmen Couinaud</span>
          </h1>
          {/* Catatan pemetaan segmen: tampil di layar besar; di layar kecil cukup via
              tooltip + footer disclaimer permanen di dasbor. */}
          {simulationResult?.segment_mapping_type && (
            <p className="hidden lg:block text-[9px] text-slate-500 mt-1 bg-white/85 rounded px-2 py-0.5 max-w-xs leading-snug">
              Pemetaan segmen: <span className="font-semibold text-slate-600">{labelOrRaw(segmentMappingTypeLabel, simulationResult.segment_mapping_type)}</span>
            </p>
          )}
        </div>

        {/* Status hasil (kanan) — satu chip ringkas dengan batas lebar */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-0">
          {simulationResult && (
            <div
              className={`rounded-lg px-2 py-1 text-[10px] font-bold tracking-wide uppercase border text-right max-w-[50vw] sm:max-w-xs leading-tight bg-white/90 backdrop-blur ${
                riskLevel === 'high'
                  ? 'text-red-700 border-red-200'
                  : riskLevel === 'medium'
                    ? 'text-yellow-700 border-yellow-200'
                    : 'text-green-700 border-green-200'
              }`}
            >
              <span className="hidden sm:inline">Segmen Terpengaruh: </span>
              <span className="break-words">{segmentSummary}</span>
            </div>
          )}
          {/* Label eksplisit "evidence unavailable" saat fallback tanpa monograf */}
          {visual.isFallbackNoEvidence && (
            <div
              title={visual.evidenceNote ?? 'Pola cedera spesifik tidak tersedia di data kurasi'}
              className="rounded-lg px-2 py-1 text-[10px] font-bold tracking-wide uppercase bg-slate-800/90 backdrop-blur text-amber-300 border border-slate-700 text-right max-w-[50vw] sm:max-w-xs leading-tight"
            >
              Evidence unavailable
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

      {/* Tooltip mengikuti kursor: posisi fixed di clientX/Y + offset 14px, pointer-events-none
          agar tidak mengganggu interaksi canvas/hotspot. Hilang saat pointer keluar hotspot/kanvas. */}
      {hoverState && (
        <div
          className="pointer-events-none fixed z-50 bg-slate-800 text-white rounded-full px-3 py-1.5 text-[11px] font-bold shadow-md border border-white/20"
          style={{ left: hoverState.x + 14, top: hoverState.y + 14 }}
        >
          Segmen {hoverState.segment}
        </div>
      )}

      {/* Viewer Footer: tombol reset + hints + legends */}
      <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-2">
        <button
          onClick={handleResetCamera}
          title="Atur Ulang Tampilan"
          className="flex flex-row items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-white/80 backdrop-blur rounded-full px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm border border-slate-200"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline text-[10px] font-bold tracking-wide uppercase">Atur Ulang Tampilan</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-6 pointer-events-none z-10 flex flex-col justify-end gap-1.5 sm:gap-2">
        {/* Hint interaksi: hanya layar besar agar kanvas lega di mobile */}
        <div className="hidden md:flex justify-between items-end gap-2 text-[10px] text-slate-500 font-medium border-b border-slate-200 pb-1.5">
          <span className="bg-white/70 px-2 py-1 rounded">model melayang bebas · drag untuk rotasi</span>
          <span className="bg-white/70 px-2 py-1 rounded">{hintText}</span>
        </div>

          {/* Legend: chip aktif (sesuai risk_level) diberi ring highlight */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
            {RISK_LEGEND.map((chip) => {
              const active = Boolean(simulationResult) && riskLevel === chip.level;
              return (
                <div
                  key={chip.level}
                  className={`flex items-center gap-1.5 rounded-full px-2 sm:px-3.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-sm border transition-colors ${
                    active
                      ? 'bg-white ring-2 ring-offset-1 ring-slate-700 border-slate-300 text-slate-800'
                      : 'bg-white/85 border-slate-200 text-slate-500'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-inner flex-shrink-0"
                    style={{ backgroundColor: chip.color }}
                  ></span>
                  <span className="sm:hidden">{chip.short}</span>
                  <span className="hidden sm:inline">{chip.full}</span>
                </div>
              );
            })}
          </div>
      </div>
    </>
  );
}
