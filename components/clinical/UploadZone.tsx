"use client";

import { useState, useCallback } from "react";
import { Upload, AlertCircle, Loader2, CheckCircle2, PlayCircle } from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { cn } from "@/lib/utils";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";

type UploadStatus = "idle" | "uploading" | "analyzing" | "done";

interface UploadZoneProps {
  onOpenReport: () => void;
}

export default function UploadZone({ onOpenReport }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);

  // 模拟上传和分析过程
  const simulateProcess = (demoMode = false) => {
    setStatus("uploading");
    setProgress(0);
    
    if (demoMode) {
        setFiles([new File([""], "demo_slide_pasm.svs", { type: "image/tiff" })]);
    }
    
    // 模拟上传进度
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStatus("analyzing");
          return 100;
        }
        return prev + 8;
      });
    }, 50);

    // 模拟分析过程，3秒后完成
    setTimeout(() => {
      setStatus("done");
    }, 3500);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      simulateProcess();
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      simulateProcess();
    }
  };

  const handleDemoClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      simulateProcess(true);
  }

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
    setStatus("idle");
    setProgress(0);
  };

  return (
    <SpotlightCard className="h-full w-full group relative cursor-pointer overflow-hidden bg-zinc-900/40">
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center p-8 text-center transition-all duration-300",
          isDragging ? "bg-blue-500/10 scale-[0.98]" : "bg-transparent",
          status === "done" ? "bg-green-500/5" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => status !== 'done' && document.getElementById('file-upload')?.click()}
      >
        {/* 流光边框 */}
        {(isDragging || status === "uploading" || status === "analyzing") && (
          <BorderBeam size={100} duration={status === "analyzing" ? 3 : 10} delay={0} colorFrom="#3b82f6" colorTo="#9c40ff" />
        )}
        
        {status === "done" && (
           <BorderBeam size={200} duration={10} delay={0} colorFrom="#22c55e" colorTo="#10b981" />
        )}

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full"
            >
              <div className="mb-6 rounded-full bg-zinc-800/50 p-6 ring-1 ring-white/10 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                 <Upload className="h-10 w-10 text-zinc-400 group-hover:text-blue-400" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                上传活检切片
              </h3>
              
              <p className="mb-8 max-w-xs text-sm text-zinc-400 leading-relaxed">
                拖拽 .svs, .tif 或表格文件至此
                <br />
                支持多文件批量上传
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs items-center">
                  <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-xs font-medium text-orange-300 border border-orange-500/20">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>仅支持 PAS 染色</span>
                  </div>

                  <button 
                    onClick={handleDemoClick}
                    className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-blue-300 transition-colors border border-blue-500/20 z-20"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span> (一键演示)</span>
                  </button>
              </div>
            </motion.div>
          )}

          {(status === "uploading" || status === "analyzing") && (
             <motion.div
               key="processing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center w-full max-w-sm"
             >
                <div className="relative mb-8">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20 opacity-75"></div>
                  <div className="relative rounded-full bg-zinc-900 p-6 border border-blue-500/30">
                     <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {status === "uploading" ? "正在上传影像..." : "AI 正在逐层扫描..."}
                </h3>
                
                {status === "analyzing" && (
                   <div className="flex flex-col items-center gap-2 text-xs text-blue-300 mb-6 font-mono">
                     <span className="animate-pulse">正在定位肾小球...</span>
                     <span className="animate-pulse delay-100 opacity-70">正在计算系膜增生...</span>
                   </div>
                )}

                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: status === "analyzing" ? "100%" : `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
             </motion.div>
          )}

          {status === "done" && (
             <motion.div
               key="done"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center"
             >
               <div className="mb-6 rounded-full bg-green-500/10 p-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-2">分析完成</h3>
               <div className="text-zinc-400 mb-8 font-mono text-sm flex flex-col gap-1 items-center">
                  {files.map((f, i) => (
                      <span key={i}>{f.name}</span>
                  ))}
               </div>
               
               <div className="flex gap-4">
                 <button 
                   onClick={reset}
                   className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm transition-colors text-zinc-300"
                 >
                   重新上传
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onOpenReport(); }}
                   className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg transition-all hover:scale-105 hover:shadow-blue-500/25"
                 >
                   查看详细报告
                 </button>
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        <input 
          id="file-upload"
          type="file" 
          multiple
          className="hidden" 
          onChange={handleFileSelect}
        />
      </div>
    </SpotlightCard>
  );
}
