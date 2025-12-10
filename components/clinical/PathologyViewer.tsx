"use client";

import { useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Layers, MousePointerClick, Copy, Trash2 } from "lucide-react";
import { Glomerulus, GLOMERULUS_TYPES } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ViewerProps {
  imageUrl: string;
  annotations: Glomerulus[];
}

export default function PathologyViewer({ imageUrl, annotations }: ViewerProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // 调试模式状态
  const [debugMode, setDebugMode] = useState(false);
  // 记录点击的点
  const [recordedPoints, setRecordedPoints] = useState<Glomerulus[]>([]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!debugMode) return;
      
      // 计算相对于图片的百分比坐标
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const newPoint: Glomerulus = {
          id: `rec-${Date.now()}`,
          x: x,
          y: y,
          width: 5, // 默认大小，之后可微调
          height: 5,
          type: 'cellular', // 默认类型
          confidence: 0.95
      };
      
      setRecordedPoints(prev => [...prev, newPoint]);
  };

  const copyToClipboard = () => {
      const jsonString = JSON.stringify(recordedPoints.map(p => ({
          id: p.id,
          x: Number(p.x.toFixed(1)),
          y: Number(p.y.toFixed(1)),
          width: 5,
          height: 5,
          type: 'cellular',
          confidence: 0.95
      })), null, 2);
      
      navigator.clipboard.writeText(jsonString);
      alert("数据已复制到剪贴板！请发给开发人员。");
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl group">
      {/* 顶部工具栏 */}
      <div className="absolute top-4 left-4 z-20 flex gap-2 rounded-lg bg-black/60 p-1.5 backdrop-blur-md border border-white/10">
        <button 
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            showAnnotations ? "bg-blue-600 text-white" : "bg-transparent text-zinc-400 hover:bg-white/10"
          )}
        >
          {showAnnotations ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          AI 标注层
        </button>
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            showHeatmap ? "bg-purple-600 text-white" : "bg-transparent text-zinc-400 hover:bg-white/10"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          热力图
        </button>
        
        {/* 显眼的 Dev 按钮 */}
        <button 
           onClick={() => setDebugMode(!debugMode)}
           className={cn(
             "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ml-4 border",
             debugMode 
                ? "bg-red-500 text-white border-red-400 animate-pulse" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
           )}
        >
            <MousePointerClick className="h-3 w-3" />
            {debugMode ? "正在录制坐标..." : "开启坐标录制"}
        </button>
      </div>

      {/* 录制面板 (仅在 Debug 模式显示) */}
      {debugMode && (
          <div className="absolute top-16 left-4 z-30 w-64 rounded-lg bg-black/90 p-4 border border-red-500/50 backdrop-blur-md shadow-2xl">
              <h3 className="text-red-400 font-bold text-xs mb-2 uppercase tracking-wider">坐标拾取器 (Point Recorder)</h3>
              <div className="text-zinc-400 text-xs mb-3 space-y-1">
                  <p>1. 点击图片上的框中心</p>
                  <p>2. 已记录点数: <span className="text-white font-bold">{recordedPoints.length}</span></p>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded transition-colors"
                  >
                      <Copy className="h-3 w-3" /> 复制数据
                  </button>
                  <button 
                    onClick={() => setRecordedPoints([])}
                    className="flex items-center justify-center gap-1 bg-zinc-800 hover:bg-red-900/50 text-red-400 text-xs px-3 rounded transition-colors"
                  >
                      <Trash2 className="h-3 w-3" />
                  </button>
              </div>
          </div>
      )}

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.1 }}
        // Debug 模式下禁用平移，防止误触
        disabled={debugMode} 
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 rounded-lg bg-black/60 p-1.5 backdrop-blur-md border border-white/10">
              <button onClick={() => zoomIn()} className="p-2 rounded-md hover:bg-white/20 text-white"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => zoomOut()} className="p-2 rounded-md hover:bg-white/20 text-white"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => resetTransform()} className="p-2 rounded-md hover:bg-white/20 text-white"><Maximize className="h-4 w-4" /></button>
            </div>

            <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-full !w-full">
              <div 
                  className={cn(
                      "relative h-full w-full flex items-center justify-center",
                      debugMode && "cursor-crosshair"
                  )}
                  onClick={handleImageClick}
              >
                <img 
                  src={imageUrl} 
                  alt="Biopsy Slide" 
                  className="max-h-full max-w-full object-contain shadow-2xl" 
                />
                
                {/* 临时显示的录制点 */}
                {debugMode && recordedPoints.map((p) => (
                    <div 
                        key={p.id}
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    />
                ))}
                
                <AnimatePresence>
                  {showHeatmap && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none mix-blend-overlay"
                      style={{
                        background: "radial-gradient(circle at 30% 40%, rgba(255,0,0,0.8), transparent 40%), radial-gradient(circle at 70% 60%, rgba(0,0,255,0.6), transparent 40%)"
                      }}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!debugMode && showAnnotations && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      {annotations.map((anno) => {
                        const style = GLOMERULUS_TYPES[anno.type];
                        const isHovered = hoveredId === anno.id;

                        return (
                          <div
                            key={anno.id}
                            className={cn(
                                "absolute cursor-pointer transition-all duration-200"
                            )}
                            style={{
                              left: `${anno.x}%`,
                              top: `${anno.y}%`,
                              width: `${anno.width}%`,
                              height: `${anno.height}%`,
                              borderColor: isHovered ? style.color : 'transparent', 
                              borderWidth: isHovered ? '2px' : '0px',
                              backgroundColor: isHovered ? style.bg : 'transparent',
                              boxShadow: isHovered ? `0 0 15px ${style.color}` : 'none'
                            }}
                            onMouseEnter={() => setHoveredId(anno.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute left-1/2 -top-12 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-sm border border-white/20 z-50 pointer-events-none"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
                                  <span className="font-bold">{style.label}</span>
                                  <span className="text-zinc-400">{(anno.confidence * 100).toFixed(1)}%</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
