import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';

/**
 * Koreksi #1: fallback no-evidence (Fallback_Diffuse) dirender LEBIH REDUP
 * dibanding kondisi normal (Mixed asli / partial) — prinsip anti-halusinasi medis (PRD 8.3).
 * Nilai konsisten: seluruh parameter hotspot normal dikali DIM_FACTOR.
 */
const DIM_FACTOR = 0.5;

/**
 * Radius bola hotspot (meter, dalam ruang model sebelum scale group).
 * FIX 1: setengah dari nilai sebelumnya 0.015 -> 0.0075 (≈7,5 mm pada liver ~22 cm).
 * Satu sumber kebenaran — perubahan ukuran berikutnya cukup edit konstanta ini.
 */
const HOTSPOT_RADIUS = 0.0075;

interface HotspotOverlayProps {
  segmentRoman: string;
  position: THREE.Vector3;
  color: THREE.Color;
  /** null = "none" (tidak ada animasi), selain itu periode siklus kedip dalam ms. */
  periodMs: number | null;
  /** Koreksi #1: true untuk kasus Fallback_Diffuse -> redup. */
  dimmed: boolean;
  onClick?: (segmentRoman: string, worldPos?: THREE.Vector3, screenX?: number, screenY?: number) => void;
  /** Screen-space position di-pass agar tooltip bisa mengikuti kursor (FIX 2). */
  onHover?: (segmentRoman: string | null, screenX?: number, screenY?: number) => void;
}

/**
 * Overlay bola prosedural per segmen Couinaud (R-01: highlight HANYA lewat overlay,
 * TIDAK menyentuh pbr_material model).
 */
export function HotspotOverlay({ segmentRoman, position, color, periodMs, dimmed, onClick, onHover }: HotspotOverlayProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        // Hotspot harus tampak BERWARNA sesuai visual_color (Koreksi #2),
        // bukan putih pudar: diffuse + emissive sama-sama memakai warna terpetakan.
        color: color.clone(),
        emissive: color.clone(),
        // Koreksi #1: fallback no-evidence -> emissiveIntensity LEBIH RENDAH (redup).
        emissiveIntensity: dimmed ? 0.4 : 1.0,
        transparent: true,
        opacity: dimmed ? 0.7 * DIM_FACTOR : 0.7,
        roughness: 0.3,
        metalness: 0.1,
        depthTest: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [color, dimmed]
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
    // FIX 2: ikutkan posisi layar agar klik juga bisa menampilkan tooltip label segmen (V-09)
    onClick?.(segmentRoman, e.point, e.clientX, e.clientY);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(segmentRoman, e.clientX, e.clientY);
  };

  // FIX 2: update posisi tooltip mengikuti kursor selama masih di atas hotspot.
  // Tanpa guard `hovered`: R3F hanya memanggil onPointerMove pada objek yang sedang
  // berada di bawah kursor, dan menghindari stale-closure yang bisa drop satu update.
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    onHover?.(segmentRoman, e.clientX, e.clientY);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
  };

  // Blink animation — Koreksi #2: "none"=NO anim / "slow"=4000ms / "fast"=1000ms
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
    // Sin wave -> opacity 0.3..1.0 (subtle pulse) per plan 4.4
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
