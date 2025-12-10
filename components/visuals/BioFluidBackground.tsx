"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  
  // 生成随机粒子位置
  const sphere = useMemo(() => {
    // 增加粒子数量: 5000 -> 8000
    const particles = new Float32Array(8000 * 3);
    for (let i = 0; i < 8000; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      // 扩大分布半径，覆盖更多屏幕区域
      const r = 1.5 + Math.random() * 2.5; 
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      particles[i * 3] = x;
      particles[i * 3 + 1] = y;
      particles[i * 3 + 2] = z;
    }
    return particles;
  }, []);

  useFrame((state, delta) => {
    // 让粒子系统缓慢旋转
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 20;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          // 颜色调亮: Cyan-200，在深色背景下非常亮眼
          color="#a5f3fc" 
          // 增大尺寸: 0.003 -> 0.005
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          // 提高不透明度: 0.4 -> 0.8
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function BioFluidBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
