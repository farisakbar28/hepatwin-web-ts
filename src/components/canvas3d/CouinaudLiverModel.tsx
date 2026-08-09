import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { SimulationResponse } from '../../types';
import { HotspotOverlay } from './HotspotOverlay';
import { ALL_SEGMENTS, BLINK_PERIOD_MS, VISUAL_COLORS, deriveSimulationVisual } from './simulationVisual';

const MODEL_URL = '/models/human_liver_couinaud_final.glb';
const HOTSPOT_PREFIX = 'Hotspot_Segment_';

interface CouinaudLiverModelProps {
  simulationResult: SimulationResponse | null;
  onHotspotClick?: (segmentRoman: string, worldPos?: THREE.Vector3, screenX?: number, screenY?: number) => void;
  onHotspotHover?: (segmentRoman: string | null, screenX?: number, screenY?: number) => void;
}

/**
 * Model 3D hati Couinaud (human_liver_couinaud_final.glb).
 *
 * Highlight TIDAK menyentuh `pbr_material` sama sekali — hanya lewat overlay bola
 * prosedural (IcosahedronGeometry) di posisi anchor hotspot glTF. Tanpa clone scene,
 * tanpa shader mutation, tanpa raycast mock. Posisi hotspot dibaca dari node glTF
 * `Hotspot_Segment_X` via getWorldPosition().
 */
export function CouinaudLiverModel({ simulationResult, onHotspotClick, onHotspotHover }: CouinaudLiverModelProps) {
  const { scene } = useGLTF(MODEL_URL) as unknown as GLTF;

  const { center, modelScale } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const boxCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    // Model ~0.22 m -> target viewport ~4.0 m.
    const targetSize = 4.0;
    return { center: boxCenter, modelScale: maxDimension > 0 ? targetSize / maxDimension : 1 };
  }, [scene]);

  const hotspotAnchors = useMemo(() => {
    scene.updateMatrixWorld(true);
    const anchors: { segmentRoman: string; position: THREE.Vector3 }[] = [];
    const tmp = new THREE.Vector3();

    scene.traverse((child) => {
      if (child.name.startsWith(HOTSPOT_PREFIX)) {
        const segmentRoman = child.name.slice(HOTSPOT_PREFIX.length);
        if ((ALL_SEGMENTS as readonly string[]).includes(segmentRoman)) {
          anchors.push({
            segmentRoman,
            position: child.getWorldPosition(tmp).clone(),
          });
        }
      }
    });

    // Mitigasi silent-fail: jika anchor glTF tidak ditemukan (mis. node di-rename),
    // beri jejak di console agar tidak tampil seolah-olah normal tanpa hotspot.
    if (anchors.length === 0) {
      console.warn('[CouinaudLiverModel] Tidak ditemukan node anchor hotspot glTF (Hotspot_Segment_I..VIII). Hotspot tidak akan dirender.');
    }

    return anchors;
  }, [scene]);

  const visual = deriveSimulationVisual(simulationResult);
  // Memoize: mencegah re-create THREE.Color (dan material hotspot) tiap re-render parent
  // (misal saat hover segmen berubah -> Canvas3DViewer re-render -> 8 material dibuat ulang).
  const hotspotColor = useMemo(() => new THREE.Color(VISUAL_COLORS[visual.visualColor]), [visual.visualColor]);
  const blinkPeriodMs = BLINK_PERIOD_MS[visual.blinkingSpeed];

  const visibleAnchors = visual.affectedSegments.length > 0
    ? hotspotAnchors.filter((anchor) => visual.affectedSegments.includes(anchor.segmentRoman))
    : [];

  return (
    <group scale={modelScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        {/* Primitive original: tanpa clone, tanpa mutasi material */}
        <primitive object={scene} />
        {visibleAnchors.map((anchor) => (
          <HotspotOverlay
            key={anchor.segmentRoman}
            segmentRoman={anchor.segmentRoman}
            position={anchor.position}
            color={hotspotColor}
            periodMs={blinkPeriodMs}
            dimmed={visual.isFallbackNoEvidence}
            intensity={visual.hotspotIntensity}
            onClick={onHotspotClick}
            onHover={onHotspotHover}
          />
        ))}
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
