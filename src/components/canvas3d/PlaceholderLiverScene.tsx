import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAppStore } from '../../state/store';

export const PlaceholderLiverScene: React.FC = () => {
  const { simulationResult } = useAppStore();
  
  const macroRef = useRef<THREE.Mesh>(null);
  const microRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    if (!materialRef.current) return;

    let targetColor = '#22c55e'; // Green (Safe)
    
    if (simulationResult) {
      if (simulationResult.DILI_score > 0.7) {
        targetColor = '#ef4444'; // Red (Danger)
      } else if (simulationResult.DILI_score > 0.3) {
        targetColor = '#f59e0b'; // Amber (Warning)
      }
    }

    gsap.to(materialRef.current.color, {
      r: new THREE.Color(targetColor).r,
      g: new THREE.Color(targetColor).g,
      b: new THREE.Color(targetColor).b,
      duration: 1.5,
      ease: "power2.out"
    });

    return () => {
      if (materialRef.current) gsap.killTweensOf(materialRef.current.color);
    };
  }, [simulationResult]);

  useEffect(() => {
    return () => {
      if (macroRef.current?.geometry) macroRef.current.geometry.dispose();
      if (microRef.current?.geometry) microRef.current.geometry.dispose();
      if (materialRef.current) materialRef.current.dispose();
    };
  }, []);

  useFrame((state) => {
    if (macroRef.current) {
      macroRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (microRef.current) {
      microRef.current.rotation.y = -state.clock.elapsedTime * 0.3;
      microRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} color="#ffffff" castShadow />
      
      {/* Makro Hati (Capsule/Sphere Deformasi) */}
      <mesh ref={macroRef} position={[-2, 0, 0]} castShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          ref={materialRef}
          color="#22c55e" 
          roughness={0.4} 
          metalness={0.1}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Mikro Lobulus (Prisma Heksagonal) */}
      <mesh ref={microRef} position={[2, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 2, 6]} />
        <meshStandardMaterial 
          color="#334155" 
          roughness={0.7}
          wireframe={true}
        />
      </mesh>

      {/* Connection Line */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshBasicMaterial color="#475569" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
