import * as THREE from 'three';
import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import gsap from 'gsap';
import type { AffectedZone } from '../../types';

interface HumanLiverModelProps {
  damageSeverity: number;
  affectedZone?: AffectedZone;
  visualPattern?: string;
  onHotspotClick?: (zone: string, worldPos?: THREE.Vector3) => void;
}

const ZONES_DIR = {
  Zone_3: new THREE.Vector3(0.5, 0.5, -0.5).normalize(),
  Portal_Periportal: new THREE.Vector3(-0.8, 0, 0.5).normalize(),
};

export function HumanLiverModel({ damageSeverity, affectedZone = 'Macro_Generic', visualPattern, onHotspotClick }: HumanLiverModelProps) {
  const group = useRef<THREE.Group>(null);
  
  const { scene } = useGLTF('/models/human_liver_hepatwin.glb') as unknown as GLTF;

  const uniformsRef = useRef<{ [key: string]: { value: any } }>({
    uHeatmapCenter: { value: new THREE.Vector3(0, 0, 0) },
    uHeatmapRadius: { value: 0.0 },
    uHeatmapIntensity: { value: 0.0 },
    uColorHighRisk: { value: new THREE.Color('#E24B4A') },
    uColorMedRisk: { value: new THREE.Color('#EF9F27') },
    uColorLowRisk: { value: new THREE.Color('#5DCAA5') },
    uBaseColor: { value: new THREE.Color('#0F6E56') },
    uHotspotCenter: { value: new THREE.Vector3(0, 0, 0) },
    uHotspotRadius: { value: 0.15 }, 
    uHotspotActive: { value: 0.0 },
    uHotspotColor: { value: new THREE.Color('#E24B4A') },
    uPulseTime: { value: 0.0 }
  });

  const { center, modelScale, maxDim } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const boxCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 4.0; 
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
    return { center: boxCenter, modelScale: scale, maxDim: maxDimension };
  }, [scene]);

  const surfaceData = useMemo(() => {
    const rc = new THREE.Raycaster();
    const getHit = (dir: THREE.Vector3) => {
       const origin = dir.clone().multiplyScalar(10); 
       rc.set(origin, dir.clone().negate());          
       const hits = rc.intersectObject(scene, true);
       if (hits.length > 0) {
           return hits[0].point.clone();
       }
       return dir.clone().multiplyScalar(1.5); 
    };
    
    const ptZ3 = getHit(ZONES_DIR.Zone_3);
    const ptPortal = getHit(ZONES_DIR.Portal_Periportal);

    const worldZ3 = ptZ3.clone().sub(center).multiplyScalar(modelScale);
    const worldPortal = ptPortal.clone().sub(center).multiplyScalar(modelScale);

    return {
      Zone_3: worldZ3,
      Portal_Periportal: worldPortal,
      Macro_Generic: new THREE.Vector3(0, 0, 0)
    };
  }, [scene, center, modelScale]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
        
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(m => {
          if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const mat = m as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.95;
            mat.roughness = 0.6;
            mat.metalness = 0.1;

            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uHeatmapCenter = uniformsRef.current.uHeatmapCenter;
              shader.uniforms.uHeatmapRadius = uniformsRef.current.uHeatmapRadius;
              shader.uniforms.uHeatmapIntensity = uniformsRef.current.uHeatmapIntensity;
              shader.uniforms.uColorHighRisk = uniformsRef.current.uColorHighRisk;
              shader.uniforms.uColorMedRisk = uniformsRef.current.uColorMedRisk;
              shader.uniforms.uColorLowRisk = uniformsRef.current.uColorLowRisk;
              shader.uniforms.uBaseColor = uniformsRef.current.uBaseColor;
              shader.uniforms.uHotspotCenter = uniformsRef.current.uHotspotCenter;
              shader.uniforms.uHotspotRadius = uniformsRef.current.uHotspotRadius;
              shader.uniforms.uHotspotActive = uniformsRef.current.uHotspotActive;
              shader.uniforms.uHotspotColor = uniformsRef.current.uHotspotColor;
              shader.uniforms.uPulseTime = uniformsRef.current.uPulseTime;

              shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                 varying vec3 vWorldPos;`
              );
              
              shader.vertexShader = shader.vertexShader.replace(
                '#include <project_vertex>',
                `#include <project_vertex>
                 vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
              );

              shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
                 uniform vec3 uHeatmapCenter;
                 uniform float uHeatmapRadius;
                 uniform float uHeatmapIntensity;
                 uniform vec3 uColorHighRisk;
                 uniform vec3 uColorMedRisk;
                 uniform vec3 uColorLowRisk;
                 uniform vec3 uBaseColor;
                 uniform vec3 uHotspotCenter;
                 uniform float uHotspotRadius;
                 uniform float uHotspotActive;
                 uniform vec3 uHotspotColor;
                 uniform float uPulseTime;
                 varying vec3 vWorldPos;`
              );

              shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                 
                 // --- HEATMAP GRADIENT ---
                 float dist = distance(vWorldPos, uHeatmapCenter);
                 float heat = 1.0 - smoothstep(0.0, uHeatmapRadius, dist);
                 heat = heat * uHeatmapIntensity;
                 
                 vec3 riskColor = mix(uColorLowRisk, uColorMedRisk, smoothstep(0.0, 0.5, heat));
                 riskColor = mix(riskColor, uColorHighRisk, smoothstep(0.5, 1.0, heat));
                 
                 diffuseColor.rgb = mix(diffuseColor.rgb, riskColor, heat);

                 // --- MURNI TERLUKIS DI KULIT: HOTSPOT (BULLSEYE) ---
                 if (uHotspotActive > 0.5) {
                   float spotDist = distance(vWorldPos, uHotspotCenter);
                   float nDist = spotDist / uHotspotRadius;
                   
                   if (nDist <= 1.0) {
                     // 1. Titik Padat Tengah (Diperbesar areanya menjadi 45%)
                     float innerDot = 1.0 - smoothstep(0.4, 0.45, nDist);
                     
                     // 2. Cincin Luar Batas Statis (0.55 s/d 0.85)
                     float outerRing = smoothstep(0.55, 0.65, nDist) * (1.0 - smoothstep(0.8, 0.85, nDist));
                     
                     // 3. Gelombang Pulse Cincin Kelap-Kelip (0.0 s/d 1.0)
                     float pulse = 0.5 + 0.5 * sin(uPulseTime * 6.0);
                     float ringAlpha = outerRing * pulse;
                     
                     float spotAlpha = clamp(innerDot + ringAlpha, 0.0, 1.0);
                     
                     // KUNCI ANTI KAMUFLASE (Saat Heatmap = Merah Pekat dan Hotspot = Merah Pekat):
                     // Gelapkan layar belakang (backdrop) tepat di bawah titik dan cincin (tanpa pulse).
                     // Penggelapan permanen 60% ini berfungsi sebagai rongga hitam-transparan buatan.
                     // Saat cincin sedang berdenyut REDUP (pulse = 0), warna yang terlihat adalah warna dasar yang tergelapkan ini,
                     // memberikan visibilitas kelap-kelip nyata meskipun warna liver di sekitarnya sama persis dengan warna hotspot.
                     float bgMask = clamp(innerDot + outerRing, 0.0, 1.0);
                     diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.0), bgMask * 0.6);
                     
                     // Timpa dengan warna solid hotspot murni dari desain
                     diffuseColor.rgb = mix(diffuseColor.rgb, uHotspotColor, spotAlpha);
                   }
                 }
                `
              );
            };
          }
        });
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);

  useEffect(() => {
    let centerTarget = surfaceData.Macro_Generic.clone();
    let targetRadius = 0.0;
    const baseRadius = maxDim * 0.4; 
    
    // Perbesaran overall radius untuk hotspot agar bullseye proporsional dan jelas terbaca
    uniformsRef.current.uHotspotRadius.value = maxDim * 0.07;

    if (visualPattern === 'heatmap_generik') {
       centerTarget = surfaceData.Macro_Generic.clone();
       targetRadius = maxDim * 0.8; 
       uniformsRef.current.uHotspotActive.value = 0.0;
    } else if (visualPattern === 'centrilobular_necrosis' || affectedZone === 'Zone_3') {
       centerTarget = surfaceData.Zone_3.clone();
       targetRadius = damageSeverity > 0.0 ? baseRadius : 0.0;
       
       uniformsRef.current.uHotspotActive.value = 1.0;
       uniformsRef.current.uHotspotCenter.value.copy(surfaceData.Zone_3);
       uniformsRef.current.uHotspotColor.value.set('#E24B4A'); 
    } else if (visualPattern === 'portal_inflammation' || affectedZone === 'Portal_Periportal') {
       centerTarget = surfaceData.Portal_Periportal.clone();
       targetRadius = damageSeverity > 0.0 ? baseRadius * 1.2 : 0.0;

       uniformsRef.current.uHotspotActive.value = 1.0;
       uniformsRef.current.uHotspotCenter.value.copy(surfaceData.Portal_Periportal);
       uniformsRef.current.uHotspotColor.value.set('#EF9F27');
    }

    if (visualPattern === 'portal_inflammation' || affectedZone === 'Portal_Periportal') {
      uniformsRef.current.uColorHighRisk.value.set('#EF9F27'); 
      uniformsRef.current.uColorMedRisk.value.set('#5DCAA5');  
    } else {
      uniformsRef.current.uColorHighRisk.value.set('#E24B4A'); 
      uniformsRef.current.uColorMedRisk.value.set('#EF9F27');  
    }

    const tl = gsap.timeline();
    
    tl.to(uniformsRef.current.uHeatmapCenter.value, {
      x: centerTarget.x,
      y: centerTarget.y,
      z: centerTarget.z,
      duration: 1.0,
      ease: "power2.out"
    }, 0);

    tl.to(uniformsRef.current.uHeatmapRadius, {
      value: targetRadius,
      duration: 1.5,
      ease: "power2.out"
    }, 0);

    tl.to(uniformsRef.current.uHeatmapIntensity, {
      value: damageSeverity,
      duration: 1.5,
      ease: "power2.out"
    }, 0);

    return () => {
      tl.kill();
    };
  }, [damageSeverity, affectedZone, visualPattern, surfaceData, maxDim]);

  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
    };
  }, [clonedScene]);

  useFrame(({ clock }) => {
    uniformsRef.current.uPulseTime.value = clock.elapsedTime;
  });

  const showHotspots = visualPattern === 'centrilobular_necrosis' || visualPattern === 'portal_inflammation';

  return (
    <group ref={group} scale={modelScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive 
          object={clonedScene} 
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (!onHotspotClick || !showHotspots) return;
            
            const activeCenter = uniformsRef.current.uHotspotCenter.value;
            const dist = e.point.distanceTo(activeCenter);
            const clickTolerance = uniformsRef.current.uHotspotRadius.value * 2.0;

            if (dist < clickTolerance) {
              e.stopPropagation();
              const zoneToTrigger = visualPattern === 'centrilobular_necrosis' ? 'Zone_3' : 'Portal_Periportal';
              onHotspotClick(zoneToTrigger, e.point); 
            }
          }}
          onPointerMove={(e: ThreeEvent<MouseEvent>) => {
            if (!showHotspots) return;
            const activeCenter = uniformsRef.current.uHotspotCenter.value;
            const hoverTolerance = uniformsRef.current.uHotspotRadius.value * 2.0;

            if (e.point.distanceTo(activeCenter) < hoverTolerance) {
              document.body.style.cursor = 'pointer';
            } else {
              document.body.style.cursor = 'auto';
            }
          }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/models/human_liver_hepatwin.glb');
