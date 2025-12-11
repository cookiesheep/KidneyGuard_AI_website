"use client";

import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Cpu, HardDrive, Terminal, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

const generateData = (step: number) => {
  // 1. 曲线平滑优化：使用更平缓的衰减函数 + 极小的 Perlin Noise 模拟
  const decay = Math.exp(-0.015 * step); // 减缓衰减速度
  // 使用正弦波叠加模拟训练震荡，而不是纯随机
  const oscillation = Math.sin(step * 0.1) * 0.02; 
  const noise = (Math.random() - 0.5) * 0.01; // 极小的噪声
  
  return {
    step,
    // Loss: 蓝色/紫色
    trainLoss: Math.max(0.05, 1.8 * decay + oscillation + noise),
    valLoss: Math.max(0.15, 2.0 * decay + oscillation + noise + 0.1),
    // Acc: 绿色/黄色
    trainAcc: Math.min(0.995, 0.45 + 0.54 * (1 - Math.exp(-0.02 * step)) + noise),
    valAcc: Math.min(0.96, 0.4 + 0.5 * (1 - Math.exp(-0.02 * step)) + noise),
    // Metrics
    f1: Math.min(0.94, 0.35 + 0.58 * (1 - Math.exp(-0.02 * step)) + noise),
    // Hardware (动态波动)
    gpuLoad: Math.min(100, Math.max(85, 92 + Math.sin(step * 0.5) * 5 + Math.random() * 3)),
    vram: Math.min(24, Math.max(18, 22 + Math.sin(step * 0.2) * 1)),
  };
};

type LogEntry = string | { text: string; color: string };

export default function TrainingMonitor() {
  const [data, setData] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((currentData) => {
        const prevStep = currentData.length > 0 ? currentData[currentData.length - 1].step : 0;
        const newStep = prevStep + 1;
        const newData = generateData(newStep);
        
        const updated = [...currentData, newData];
        if (updated.length > 100) updated.shift(); // 保留更多历史数据使曲线更平滑
        return updated;
      });

      setLogs((prevLogs) => {
        // 降低日志刷新频率，避免刷屏
        if (Math.random() > 0.3) return prevLogs;

        const logTypes = [
          { text: `[INFO] Forward pass: ${(12 + Math.random()*2).toFixed(1)}ms | Backward: ${(24 + Math.random()*3).toFixed(1)}ms`, color: "text-zinc-500" },
          { text: `[TRAIN] Step optimizing... Loss dropped to ${(Math.random() * 0.5).toFixed(4)}`, color: "text-blue-400" },
          { text: `[VAL] Validating batch... Accuracy stable`, color: "text-purple-400" },
          { text: `[GPU] Memory optimize: Freed 24MB cache`, color: "text-orange-400" },
          { text: `[SYSTEM] Checkpoint saved successfully`, color: "text-green-500" }
        ];
        
        const newLog = logTypes[Math.floor(Math.random() * logTypes.length)];
        return [...prevLogs, newLog].slice(-50); // 保留最近50条
      });

    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 自动滚动
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const currentData = data[data.length - 1] || {};

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full p-4">
      
      {/* 1. 主图表 (Loss/Acc 对比) */}
      <div className="col-span-8 row-span-4 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-6 relative overflow-hidden group flex flex-col">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-bold tracking-wider text-sm text-zinc-300">TRAINING METRICS</span>
            </div>
            {/* 动态图例 */}
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-0.5 bg-blue-500"></span>Train Loss
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-0.5 bg-purple-500"></span>Val Loss
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-0.5 bg-emerald-400"></span>Train Acc
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-0.5 bg-yellow-400"></span>Val Acc
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
              <XAxis dataKey="step" hide />
              {/* 左轴：Loss (0-3) */}
              <YAxis yAxisId="left" hide domain={[0, 2.5]} />
              {/* 右轴：Acc (0-1) */}
              <YAxis yAxisId="right" orientation="right" hide domain={[0, 1.1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', padding: 0 }}
                labelStyle={{ display: 'none' }}
              />
              
              {/* Loss Curves (Left Axis) */}
              <Line yAxisId="left" type="monotone" dataKey="trainLoss" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="valLoss" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="4 4" />
              
              {/* Acc Curves (Right Axis) */}
              <Line yAxisId="right" type="monotone" dataKey="trainAcc" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="valAcc" stroke="#facc15" strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 终端日志 */}
      <div className="col-span-4 row-span-6 rounded-xl border border-white/10 bg-black/90 font-mono text-xs flex flex-col relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-2 text-zinc-400 p-3 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-500" />
            <span className="font-bold">SYSTEM TERMINAL</span>
          </div>
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
          </div>
        </div>
        <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-none">
           {logs.map((log: any, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -5 }}
               animate={{ opacity: 1, x: 0 }}
               className={`break-all leading-relaxed ${log.color || "text-zinc-300"}`}
             >
               <span className="text-zinc-600 mr-2 select-none">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
               {log.text}
             </motion.div>
           ))}
           <div className="animate-pulse text-green-500 font-bold">_</div>
        </div>
      </div>

      {/* 3. F1-Score */}
      <div className="col-span-4 row-span-2 rounded-xl border border-white/10 bg-zinc-900/40 p-4 flex flex-col">
        <div className="flex items-center justify-between text-zinc-400 mb-2 text-xs font-bold shrink-0">
          <div className="flex items-center gap-2"><GitBranch className="h-3 w-3 text-cyan-500" /> F1-SCORE TREND</div>
          <div className="text-cyan-400 font-mono">{(currentData.f1 || 0).toFixed(4)}</div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip cursor={false} content={() => null} />
              <Area type="monotone" dataKey="f1" stroke="#06b6d4" fill="url(#colorF1)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. GPU 资源监控 (带迷你图) */}
      <div className="col-span-4 row-span-2 grid grid-cols-2 gap-3">
         {/* GPU Load */}
         <div className="rounded-xl bg-zinc-800/30 p-3 flex flex-col border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
               <div className="text-xs text-zinc-500 flex items-center gap-1"><Cpu className="h-3 w-3"/> GPU LOAD</div>
               <div className="text-lg font-mono text-white font-bold">{(currentData.gpuLoad || 0).toFixed(1)}%</div>
            </div>
            {/* 背景迷你图 */}
            <div className="absolute inset-0 pt-8 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                           <linearGradient id="gradGpu" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5}/>
                             <stop offset="100%" stopColor="#a855f7" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="gpuLoad" stroke="none" fill="url(#gradGpu)" isAnimationActive={false} baseValue={80} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full bg-zinc-700 h-1 rounded-full mt-auto z-10"><div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${currentData.gpuLoad}%` }}></div></div>
         </div>

         {/* VRAM Usage */}
         <div className="rounded-xl bg-zinc-800/30 p-3 flex flex-col border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
               <div className="text-xs text-zinc-500 flex items-center gap-1"><HardDrive className="h-3 w-3"/> VRAM</div>
               <div className="text-lg font-mono text-white font-bold">{(currentData.vram || 0).toFixed(1)} GB</div>
            </div>
             {/* 背景迷你图 */}
             <div className="absolute inset-0 pt-8 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                           <linearGradient id="gradVram" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5}/>
                             <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="vram" stroke="none" fill="url(#gradVram)" isAnimationActive={false} baseValue={15}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full bg-zinc-700 h-1 rounded-full mt-auto z-10"><div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${(currentData.vram / 24) * 100}%` }}></div></div>
         </div>
      </div>

    </div>
  );
}
