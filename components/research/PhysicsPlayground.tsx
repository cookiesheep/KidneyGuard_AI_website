"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";

export default function PhysicsPlayground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<{label: string, count: number, x: number, y: number} | null>(null);

  useEffect(() => {
    if (!sceneRef.current || !canvasRef.current) return;

    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint,
      Runner = Matter.Runner,
      Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = sceneRef.current.clientWidth;
    const height = 600;

    const ground = Bodies.rectangle(width / 2, height + 30, width, 60, { isStatic: true });
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height, { isStatic: true });

    World.add(engine.world, [ground, leftWall, rightWall]);

    // 数据胶囊定义
    const dataset = [
      { label: "IV型狼疮", count: 1240, color: "#3b82f6" },
      { label: "弥漫增生", count: 890, color: "#ef4444" },
      { label: "活动性指数", count: 2100, color: "#10b981" },
      { label: "慢性指数", count: 1800, color: "#f59e0b" },
      { label: "完全缓解", count: 650, color: "#8b5cf6" },
      { label: "部分缓解", count: 430, color: "#ec4899" },
      { label: "未缓解", count: 120, color: "#ef4444" },
      { label: "足细胞", count: 3200, color: "#6366f1" },
      { label: "新月体", count: 540, color: "#0ea5e9" },
      { label: "免疫复合物", count: 980, color: "#f97316" }
    ];
    
    const bodiesWithLabels: any[] = [];

    dataset.forEach((data, i) => {
      const x = Math.random() * (width - 200) + 100;
      const y = Math.random() * -500 - 50; 
      
      const body = Bodies.rectangle(x, y, 140, 46, {
        chamfer: { radius: 23 },
        restitution: 0.8,
        friction: 0.005,
        density: 0.04,
      });
      
      bodiesWithLabels.push({ body, ...data });
      World.add(engine.world, body);
    });

    const mouse = Mouse.create(canvasRef.current);
    const pixelRatio = window.devicePixelRatio || 1;
    mouse.pixelRatio = pixelRatio;
    
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });

    World.add(engine.world, mouseConstraint);

    // 监听鼠标移动以检测悬停
    Events.on(mouseConstraint, "mousemove", (event) => {
        const mousePosition = event.mouse.position;
        const bodies = Matter.Query.point(bodiesWithLabels.map(b => b.body), mousePosition);
        
        if (bodies.length > 0) {
            const match = bodiesWithLabels.find(b => b.body === bodies[0]);
            if (match) {
                // 将 Matter.js 坐标转换为屏幕坐标用于 Tooltip
                // 注意：这里简化处理，直接用 offset
                setHoveredLabel({
                    label: match.label,
                    count: match.count,
                    x: match.body.position.x,
                    y: match.body.position.y - 40 // 显示在上方
                });
                document.body.style.cursor = "pointer";
                return;
            }
        }
        setHoveredLabel(null);
        document.body.style.cursor = "default";
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    const context = canvasRef.current.getContext("2d");
    let animationFrameId: number;

    const renderLoop = () => {
      if (!context || !canvasRef.current) return;

      context.clearRect(0, 0, width, height);
      
      bodiesWithLabels.forEach(({ body, label, color }) => {
        const { position, angle } = body;

        context.save();
        context.translate(position.x, position.y);
        context.rotate(angle);

        context.beginPath();
        const w = 140;
        const h = 46;
        const r = 23;
        context.roundRect(-w / 2, -h / 2, w, h, r);
        context.fillStyle = color;
        context.fill();
        
        context.beginPath();
        context.ellipse(-w/2 + 20, -h/2 + 15, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 255, 255, 0.2)";
        context.fill();

        context.fillStyle = "#ffffff";
        context.font = "bold 16px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.shadowColor = "rgba(0,0,0,0.3)";
        context.shadowBlur = 4;
        context.fillText(label, 0, 0); 

        context.restore();
      });

      if (mouseConstraint.body) {
         document.body.style.cursor = "grabbing";
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    canvasRef.current.width = width * pixelRatio;
    canvasRef.current.height = height * pixelRatio;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;
    context?.scale(pixelRatio, pixelRatio);

    renderLoop();

    return () => {
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={sceneRef} className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-sm shadow-inner z-20">
      <div className="absolute top-8 left-8 z-30 pointer-events-none select-none">
        <h3 className="text-2xl font-bold text-white tracking-tight">交互式数据生态</h3>
        <p className="text-zinc-400 mt-2 text-sm">拖拽探索 · 悬停查看样本量</p>
      </div>
      
      <canvas ref={canvasRef} className="relative z-20 w-full h-full touch-none" />
      
      {/* 悬停提示 Tooltip (使用 Framer Motion) */}
      <AnimatePresence>
        {hoveredLabel && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute pointer-events-none z-50 bg-black/90 border border-white/20 px-4 py-2 rounded-lg shadow-xl text-center backdrop-blur-md"
                style={{ 
                    left: hoveredLabel.x, 
                    top: hoveredLabel.y, 
                    transform: 'translate(-50%, -100%)' // 居中并上移
                }}
            >
                <div className="text-xs text-zinc-400 uppercase tracking-wider">样本数量</div>
                <div className="text-lg font-bold text-white font-mono">{hoveredLabel.count.toLocaleString()}</div>
            </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-transparent z-20" />
    </div>
  );
}
