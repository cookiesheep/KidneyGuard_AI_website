"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import PathologyViewer from "./PathologyViewer";
import { getMockDataForImage } from "@/lib/mock-data";
import { ArrowLeft, Printer, Download, Activity } from "lucide-react";
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
        return "final_img2.jpg"; // 默认图改为 final_img.jpg
    }
    if (imageFile.name.includes("6cb")) return "6cb6c4d0c1c2382d00ab2294627a7eb3.jpg";
    if (imageFile.name.includes("647")) return "6474065b163c3a3f6b4381feaeeaa5ae.jpg";
    
    return "final_img.jpg"; // 默认图
  }, [imageFile]);

  // 临时修复：如果图片太大加载失败，尝试使用 img1.jpg 作为回退，或者检查是否需要特殊处理
  const imageUrl = `/images/${currentImageName}`;
  // console.log("ClinicalDashboard: Loading image url:", imageUrl); // Debug log

  // 2. 获取对应的硬编码标注数据
  const annotations = useMemo(() => {
    return getMockDataForImage(currentImageName);
  }, [currentImageName]);
  
  // 3. 统计数据 (修正：从毛细血管内增生中拆分新月体)
  // 为了实现双层饼图（嵌套关系），我们需要两组数据
  // innerData: 大类（毛细血管内增生, 固有细胞, 硬化, 系膜增生）
  // outerData: 详情（毛细血管内增生拆分为普通和新月体）
  const { innerData, outerData } = useMemo(() => {
    const counts = { normal: 0, cellular: 0, sclerotic: 0, membranous: 0, crescents: 0 };
    annotations.forEach(a => {
        // @ts-ignore - crescents is now a valid type
        if (counts[a.type] !== undefined) counts[a.type]++;
    });

    // 真实数据统计
    const totalCellular = counts.cellular; // 纯毛细血管内增生
    const totalCrescents = counts.crescents; // 新月体

    // 内层：大类展示 (新月体归类为毛细血管内增生的一种特殊形态，或者单独展示)
    // 这里我们将新月体和毛细血管内增生合并展示在内层作为"增生类"，或者分开展示
    // 根据之前的逻辑，我们分开展示比较清晰
    const inner = [
      { name: '固有细胞无增生', value: counts.normal, color: '#22c55e' },
      { name: '毛细血管内增生', value: totalCellular + totalCrescents, color: '#ef4444' }, // 合并展示总量
      { name: '硬化', value: counts.sclerotic, color: '#eab308' },
      { name: '单纯系膜增生', value: counts.membranous, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    const outer = [
      { name: '固有细胞无增生', value: counts.normal, color: '#22c55e' },
      // 拆分展示
      { name: '毛细血管内增生 (普通)', value: totalCellular, color: '#ef4444' },
      { name: '新月体 (Crescents)', value: totalCrescents, color: '#b91c1c' }, // 深红色
      
      { name: '硬化', value: counts.sclerotic, color: '#eab308' },
      { name: '单纯系膜增生', value: counts.membranous, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    return { innerData: inner, outerData: outer };
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
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/10 transition-colors" aria-label="返回首页">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              智能诊断工作台
            </h1>
            <p className="text-xs text-zinc-500 font-mono">{imageFile?.name || "DEMO_CASE_PAS.svs"}</p>
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
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-300 mb-2">主要诊断 (Primary Diagnosis)</h3>
              <div className="text-3xl font-bold text-white mb-1">IV 型狼疮肾炎</div>
              <div className="text-sm text-red-200 opacity-80">弥漫增生性 (Diffuse Proliferative)</div>
              
              <div className="mt-4 text-xs text-red-200/60 border-t border-red-500/20 pt-4">
                依据: 43.1% 肾小球呈现弥漫性毛细血管内增生，伴有活动性新月体形成。
              </div>
            </div>

            {/* 定量统计图表 */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">定量分析 (Quantitative Analysis)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* 内层圆环：显示大类 */}
                    <Pie
                      data={innerData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={45}
                      fill="#8884d8"
                      stroke="rgba(0,0,0,0.5)"
                      paddingAngle={2}
                    >
                      {innerData.map((entry, index) => (
                        <Cell key={`cell-inner-${index}`} fill={entry.color} opacity={0.6} />
                      ))}
                    </Pie>
                    
                    {/* 外层圆环：显示详情（包括新月体拆分） */}
                    <Pie
                      data={outerData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={80}
                      fill="#82ca9d"
                      stroke="rgba(0,0,0,0.5)"
                      paddingAngle={2}
                      // @ts-ignore
                      // label={({ name, percent }: any) => (percent || 0) > 0.1 ? name : ''} // 仅在占比大时显示标签
                      labelLine={false}
                    >
                      {outerData.map((entry, index) => (
                        <Cell key={`cell-outer-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* 专门强调新月体的图例 */}
              <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-lg bg-zinc-800/40 border border-white/5">
                <div className="col-span-2 flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">分类图例</span>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">检测数量 (个)</span>
                </div>
                {outerData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs text-zinc-400 group">
                    <span className="h-2 w-2 rounded-full shrink-0 ring-2 ring-transparent group-hover:ring-white/20 transition-all" style={{ backgroundColor: s.color }} />
                    <span className="truncate max-w-[8em]" title={s.name}>{s.name}</span>
                    <div className="ml-auto flex items-baseline gap-1">
                        <span className="font-mono text-white font-bold">{s.value}</span>
                        <span className="text-[10px] text-zinc-600 scale-90">个</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 预后预测 */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">预后预测 (Prognosis 12-Month)</h3>
              <div className="space-y-4 rounded-xl border border-white/5 bg-zinc-800/30 p-5">
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-zinc-400">完全缓解 (CR)</span>
                   <span className="text-green-400 font-mono">32.1%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-zinc-900">
                   <div className="h-full rounded-full bg-green-500 w-[32.1%] shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                 </div>

                 <div className="flex justify-between text-sm mb-1 pt-2">
                   <span className="text-zinc-400">部分缓解 (PR)</span>
                   <span className="text-yellow-400 font-mono">54.5%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-zinc-900">
                   <div className="h-full rounded-full bg-yellow-500 w-[54.5%]"></div>
                 </div>

                 {/* 新增：未缓解 */}
                 <div className="flex justify-between text-sm mb-1 pt-2">
                   <span className="text-zinc-400">未缓解 (NR)</span>
                   <span className="text-red-400 font-mono">13.4%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-zinc-900">
                   <div className="h-full rounded-full bg-red-500 w-[13.4%]"></div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
