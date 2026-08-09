import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import type { HotspotIntensity } from '../../types';

/**
 * Fallback no-evidence (Fallback_Diffuse) dirender LEBIH REDUP dibanding kondisi
 * normal — prinsip anti-halusinasi medis (PRD 8.3). Seluruh parameter hotspot
 * normal dikali DIM_FACTOR.
 */
const DIM_FACTOR = 0.5;

/**
 * Pemetaan hotspot_intensity -> faktor emissive material.
 * "dim" = bukti lokalisasi lemah (redup), "low" = sedang, "high" = kuat.
 * Nilai tak dikenal dinormalisasi menjadi "high" oleh deriveSimulationVisual.
 */
const INTENSITY_EMISSIVE: Record<HotspotIntensity, number> = {
  high: 1.0,
  low: 0.65,
  dim: 0.4,
};

/**
 * Radius bola hotspot (meter, dalam ruang model sebelum scale group):
 * 0.0075 m ≈ 7,5 mm pada liver ~22 cm. Satu sumber kebenaran — cukup edit di sini.
 */
const HOTSPOT_RADIUS = 0.0075;

interface HotspotOverlayProps {
  segmentRoman: string;
  position: THREE.Vector3;
  color: THREE.Color;
  /** null = "none" (tidak ada animasi), selain itu periode siklus kedip dalam ms. */
  periodMs: number | null;
  /** true untuk kasus Fallback_Diffuse -> redup. */
  dimmed: boolean;
  /** Intensitas bukti lokalisasi dari backend (hotspot_intensity). Default 'high'. */
  intensity?: HotspotIntensity;
  onClick?: (segmentRoman: string, worldPos?: THREE.Vector3, screenX?: number, screenY?: number) => void;
  /** Screen-space position di-pass agar tooltip bisa mengikuti kursor. */
  onHover?: (segmentRoman: string | null, screenX?: number, screenY?: number) => void;
}

/**
 * Overlay bola prosedural per segmen Couinaud (highlight HANYA lewat overlay,
 * TIDAK menyentuh pbr_material model).
 */
export function HotspotOverlay({ segmentRoman, position, color, periodMs, dimmed, intensity = 'high', onClick, onHover }: HotspotOverlayProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        // Hotspot tampak BERWARNA sesuai visual_color (bukan putih pudar):
        // diffuse + emissive sama-sama memakai warna terpetakan.
        color: color.clone(),
        emissive: color.clone(),
        // emissiveIntensity mengikuti hotspot_intensity backend (dim -> redup).
        emissiveIntensity: INTENSITY_EMISSIVE[intensity],
        transparent: true,
        opacity: dimmed ? 0.7 * DIM_FACTOR : 0.7,
        roughness: 0.3,
        metalness: 0.1,
        depthTest: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [color, dimmed, intensity]
  );

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(HOTSPOT_RADIUS, 2), []);

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Ikutkan posisi layar agar klik juga menampilkan tooltip label segmen.
    onClick?.(segmentRoman, e.point, e.clientX, e.clientY);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(segmentRoman, e.clientX, e.clientY);
  };

  // Update posisi tooltip mengikuti kursor selama masih di atas hotspot (R3F
  // memanggil onPointerMove hanya untuk objek yang berada di bawah kursor).
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    onHover?.(segmentRoman, e.clientX, e.clientY);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
  };

  // Blink animation: "none"=tanpa anim / "slow"=4000ms / "fast"=1000ms
  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;

    if (periodMs === null) {
      // Tidak ada animasi: opasitas dasar statis (redup jika fallback no-evidence)
      mat.opacity = dimmed ? 0.7 * DIM_FACTOR : 0.7;
      return;
    }

    const period = periodMs / 1000; // ms -> s
    const phase = (clock.elapsedTime % period) / period;
    // Sin wave -> opacity 0.3..1.0 (subtle pulse)
    const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
    mat.opacity = dimmed ? (0.3 + 0.7 * pulse) * DIM_FACTOR : 0.3 + 0.7 * pulse;
  });

  return (
    <mesh
      ref={(mesh) => {
        if (mesh) materialRef.current = mesh.material as THREE.MeshPhysicalMaterial;
      }}
      geometry={geometry}
      material={material}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    />
  );
}
