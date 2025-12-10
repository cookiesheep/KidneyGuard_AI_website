"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Box, X } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import TrainingWizard from "./TrainingWizard";
import TrainingMonitor from "./TrainingMonitor";
import GridBeamBackground from "@/components/visuals/GridBeamBackground"; // 新背景

interface Props {
  onClose: () => void;
}

export default function ResearchDashboard({ onClose }: Props) {
  const [view, setView] = useState<"mode-select" | "wizard" | "monitor">("mode-select");
  const [mode, setMode] = useState<"finetune" | "scratch" | null>(null);

  const handleStartWizard = (selectedMode: "finetune" | "scratch") => {
    setMode(selectedMode);
    setView("wizard");
  };

  const handleStartTraining = () => {
    setView("monitor");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col"
    >
      {/* 动态背景 */}
      <GridBeamBackground className="-z-10" />

      {/* 顶部导航 */}
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-4 bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          {view !== "mode-select" && (
            <button 
              onClick={() => setView("mode-select")} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
          )}
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 p-1.5 rounded-lg border border-purple-500/30"><Box className="w-5 h-5" /></span>
            科研工坊 <span className="text-zinc-500 font-normal">/ 模型实验室</span>
          </h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6 text-zinc-400" />
        </button>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. 模式选择 */}
          {view === "mode-select" && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto"
            >
              <h2 className="text-5xl font-bold mb-16 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                选择您的训练模式
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* 模式 A: 微调 */}
                <div onClick={() => handleStartWizard("finetune")} className="cursor-pointer group h-[400px]">
                  <SpotlightCard className="h-full p-8 border-white/10 hover:border-purple-500/50 transition-colors bg-black/40 backdrop-blur-xl">
                    <div className="mb-8 p-5 rounded-2xl bg-purple-500/10 w-fit group-hover:bg-purple-500/20 transition-colors ring-1 ring-purple-500/30">
                      <Zap className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 group-hover:text-purple-400 transition-colors">模型微调</h3>
                    <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
                      基于预训练好的高性能 LN 病理大模型，使用少量数据快速适配您的特定场景。
                    </p>
                    <ul className="space-y-3 text-zinc-500">
                      <li className="flex items-center gap-2"><span className="text-purple-500">●</span> 仅需少量样本 (Few-shot)</li>
                      <li className="flex items-center gap-2"><span className="text-purple-500">●</span> 收敛速度极快</li>
                    </ul>
                  </SpotlightCard>
                </div>

                {/* 模式 B: 从头训练 */}
                <div onClick={() => handleStartWizard("scratch")} className="cursor-pointer group h-[400px]">
                  <SpotlightCard className="h-full p-8 border-white/10 hover:border-blue-500/50 transition-colors bg-black/40 backdrop-blur-xl">
                    <div className="mb-8 p-5 rounded-2xl bg-blue-500/10 w-fit group-hover:bg-blue-500/20 transition-colors ring-1 ring-blue-500/30">
                      <Box className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">从头训练</h3>
                    <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
                      复用优化的模型架构（YOLO+MAE），在全新的数据集或染色类型上构建模型。
                    </p>
                    <ul className="space-y-3 text-zinc-500">
                      <li className="flex items-center gap-2"><span className="text-blue-500">●</span> 完整的超参控制权</li>
                      <li className="flex items-center gap-2"><span className="text-blue-500">●</span> 适用于 HE / Masson 等新染色</li>
                    </ul>
                  </SpotlightCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. 配置向导 */}
          {view === "wizard" && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full flex flex-col justify-center max-w-6xl mx-auto w-full"
            >
              <TrainingWizard onStart={handleStartTraining} />
            </motion.div>
          )}

          {/* 3. 监控大屏 */}
          {view === "monitor" && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full w-full"
            >
              <TrainingMonitor />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
