"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PathologyViewer from "./PathologyViewer";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { getMockDataForImage } from "@/lib/mock-data";
import { ArrowLeft, Share2, Printer, Download, Activity, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardProps {
  imageFile: File | null;
  onBack: () => void;
}

export default function ClinicalDashboard({ imageFile, onBack }: DashboardProps) {
  // 1. 确定当前展示哪张图
  const currentImageName = useMemo(() => {
    // 如果没有文件（演示模式），或者文件名包含 img1 的特征
    if (!imageFile || imageFile.name.includes("demo") || imageFile.name.includes("875")) {
        return "875ed62cf5ff94b096c594f9755efca0.jpg";
    }
    if (imageFile.name.includes("6cb")) return "6cb6c4d0c1c2382d00ab2294627a7eb3.jpg";
    if (imageFile.name.includes("647")) return "6474065b163c3a3f6b4381feaeeaa5ae.jpg";
    
    return "875ed62cf5ff94b096c594f9755efca0.jpg"; // 默认图
  }, [imageFile]);

  const imageUrl = `/images/${currentImageName}`;

  // 2. 获取对应的硬编码标注数据
  const annotations = useMemo(() => {
    return getMockDataForImage(currentImageName);
  }, [currentImageName]);
  
  // 3. 统计数据
  const stats = useMemo(() => {
    const counts = { normal: 0, cellular: 0, sclerotic: 0, membranous: 0 };
    annotations.forEach(a => {
        if (counts[a.type] !== undefined) counts[a.type]++;
    });
    return [
      { name: '固有细胞无增生', value: counts.normal, color: '#22c55e' },
      { name: '毛细血管内增生', value: counts.cellular, color: '#ef4444' },
      { name: '硬化', value: counts.sclerotic, color: '#eab308' },
      { name: '单纯系膜增生', value: counts.membranous, color: '#3b82f6' },
    ];
  }, [annotations]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white"
    >
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              智能诊断工作台
            </h1>
            <p className="text-xs text-zinc-500 font-mono">{imageFile?.name || "DEMO_CASE_PASM.svs"}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10">
            <Printer className="h-4 w-4" /> 打印
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20">
            <Download className="h-4 w-4" /> 导出报告
          </button>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 左侧：病理阅片器 */}
        <div className="relative w-[70%] border-r border-white/10 bg-black">
          {/* 传递图片URL和对应的标注数据 */}
          <PathologyViewer imageUrl={imageUrl} annotations={annotations} />
        </div>

        {/* 右侧：结构化报告 */}
        <div className="w-[30%] overflow-y-auto bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="space-y-8">
            
            {/* 诊断结论卡片 */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-red-500/20 blur-xl"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-300 mb-2">Primary Diagnosis</h3>
              <div className="text-3xl font-bold text-white mb-1">IV 型狼疮肾炎</div>
              <div className="text-sm text-red-200 opacity-80">弥漫增生性 (Diffuse Proliferative)</div>
              
              <div className="mt-4 text-xs text-red-200/60 border-t border-red-500/20 pt-4">
                依据: 43.1% 肾小球呈现弥漫性毛细血管内增生，伴有活动性新月体形成。
              </div>
            </div>

            {/* 定量统计图表 */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Quantitative Analysis</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* 图例 */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {stats.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="truncate">{s.name}</span>
                    <span className="ml-auto font-mono text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 预后预测 */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Prognosis (12-Month)</h3>
              <div className="space-y-4 rounded-xl border border-white/5 bg-zinc-800/30 p-5">
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-zinc-400">完全缓解 (CR)</span>
                   <span className="text-green-400 font-mono">87%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-zinc-900">
                   <div className="h-full rounded-full bg-green-500 w-[87%] shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                 </div>

                 <div className="flex justify-between text-sm mb-1 pt-2">
                   <span className="text-zinc-400">部分缓解 (PR)</span>
                   <span className="text-yellow-400 font-mono">11%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-zinc-900">
                   <div className="h-full rounded-full bg-yellow-500 w-[11%]"></div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
