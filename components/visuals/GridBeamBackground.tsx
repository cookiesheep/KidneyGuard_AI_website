"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend, ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { cn } from "@/lib/utils";

// 1. 定义自定义 Shader 材质
// 使用 shaderMaterial 快速创建 React 友好的 Shader 组件
const ColorShiftMaterial = shaderMaterial(
  { uTime: 0 },
  // Vertex Shader: 处理顶点位置，并将高度传给 Fragment
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // 动态波浪计算
      // 叠加多个波形以获得更自然的随机感
      float wave1 = sin(pos.x * 0.05 + uTime * 0.3) * 3.0;
      float wave2 = sin(pos.y * 0.08 + uTime * 0.4) * 2.0;
      float wave3 = sin(pos.x * 0.1 + pos.y * 0.1 + uTime * 0.5) * 1.0;
      
      pos.z += wave1 + wave2 + wave3;

      vElevation = pos.z; // 将高度传给片元着色器用于上色
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader: 决定颜色
  `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    // 经典的余弦调色板函数 (Cosine Palette)
    // 能够生成非常漂亮的平滑渐变
    // 参考: https://iquilezles.org/articles/palettes/
    vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
        return a + b*cos( 6.28318*(c*t+d) );
    }

    void main() {
      // 定义七彩调色板参数 (彩虹/霓虹风格)
      // 这些神奇的数字组合能产生极其丰富的色彩变化
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.263, 0.416, 0.557);

      // 颜色混合逻辑
      // vElevation * 0.08: 高度越高，颜色变化越快
      // uTime * 0.1: 随时间流动
      // vUv.x * 0.5: 随水平位置渐变
      float colorParam = vElevation * 0.08 + uTime * 0.1 + vUv.x * 0.5;
      
      vec3 color = palette(colorParam, a, b, c, d);

      // 亮度增强: 让线条更亮，类似霓虹灯
      color = pow(color, vec3(0.8)); // 调整 Gamma
      color += vec3(0.1); 

      // 边缘透明度渐变 (Fog 也会做这个，但 Shader 里做更精细)
      float alpha = 0.5; // 基础透明度

      gl_FragColor = vec4(color, alpha); 
    }
  `
);

// 将自定义材质注册到 R3F
extend({ ColorShiftMaterial });

// 为了 TypeScript 类型检查
declare global {
  namespace JSX {
    interface IntrinsicElements {
      colorShiftMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof ColorShiftMaterial>;
    }
  }
}

function HolographicTerrain() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
  // 生成高密度平面几何体
  const geometry = useMemo(() => {
    // 200x200 大小，128x128 分段，分段越多曲线越圆滑
    return new THREE.PlaneGeometry(200, 200, 128, 128); 
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group rotation={[-Math.PI / 2 + 0.2, 0, 0]} position={[0, -10, -30]}>
      <mesh geometry={geometry}>
        {/* @ts-ignore: custom material type definition */}
        <colorShiftMaterial ref={materialRef} wireframe transparent side={THREE.DoubleSide} />
      </mesh>
      
      {/* 底部加一层黑色遮罩，增加景深和对比度 */}
      <mesh geometry={geometry} position={[0, 0, -0.2]}>
         <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export default function GridBeamBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 w-full h-full bg-black overflow-hidden", className)}>
      {/* 背景光晕：保留一些彩色氛围光，但更柔和 */}
      <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[10%] w-[60%] h-[60%] bg-pink-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <Canvas camera={{ position: [0, 5, 20], fov: 60 }} gl={{ antialias: true }}>
        {/* 雾气颜色：纯黑，让彩色线条在远处自然消隐 */}
        <fog attach="fog" args={['#000000', 10, 90]} />
        <HolographicTerrain />
      </Canvas>
      
      {/* 顶部暗角 vignetting，聚焦视线 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_130%)] pointer-events-none" />
    </div>
  );
}
