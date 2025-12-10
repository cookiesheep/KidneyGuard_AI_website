"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import BioFluidBackground from "@/components/visuals/BioFluidBackground";
import MagneticButton from "@/components/ui/MagneticButton";
import UploadZone from "@/components/clinical/UploadZone";
import PhysicsPlayground from "@/components/research/PhysicsPlayground";
import SpotlightCard from "@/components/ui/SpotlightCard";
import ClinicalDashboard from "@/components/clinical/ClinicalDashboard";
import ResearchDashboard from "@/components/research/ResearchDashboard"; // 新增
import ReportModal from "@/components/clinical/ReportModal";
import { ArrowRight, Microscope, BarChart3, BrainCircuit, Activity, Database, FlaskConical } from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function Home() {
  const lenis = useLenis();
  const [dashboardFile, setDashboardFile] = useState<File | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false); // 科研 Dashboard 状态

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  const bgGradient = useTransform(
      scrollYProgress,
      [0, 0.5, 1],
      [
          "radial-gradient(circle at 50% 50%, rgba(2,6,23,0) 0%, rgba(2,6,23,0.8) 100%)", 
          "radial-gradient(circle at 50% 50%, rgba(30,27,75,0.2) 0%, rgba(2,6,23,1) 100%)",
          "radial-gradient(circle at 50% 50%, rgba(49,46,129,0.2) 0%, rgba(2,6,23,1) 100%)"
      ]
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element && lenis) {
      lenis.scrollTo(element, { offset: -100, duration: 1.5 });
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDashboard = (file?: File) => {
      setDashboardFile(file || null);
      setIsDashboardOpen(true);
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
  };

  const handleCloseDashboard = () => {
      setIsDashboardOpen(false);
      setDashboardFile(null);
      if (lenis) lenis.start();
      document.body.style.overflow = '';
  };

  // 科研 Dashboard 控制
  const handleOpenResearch = () => {
      setIsResearchOpen(true);
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
  };

  const handleCloseResearch = () => {
      setIsResearchOpen(false);
      if (lenis) lenis.start();
      document.body.style.overflow = '';
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden font-sans text-foreground selection:bg-blue-500/30">
      
      {/* 0. 动态背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 z-0">
             <BioFluidBackground />
          </div>
          <motion.div 
            className="absolute inset-0 z-10 opacity-60 mix-blend-screen"
            style={{ background: bgGradient }}
          />
          <div className="absolute inset-0 z-20 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center px-4 overflow-hidden z-10">
        <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale }} 
            className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 rounded-full border border-blue-500/20 bg-blue-500/5 px-6 py-2 text-sm font-medium text-blue-200 backdrop-blur-md"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            KidneyGuard AI V2.0 已上线
          </motion.div>

          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-6xl text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.9]"
          >
            <motion.span variants={staggerItem} className="block">DeepScope</motion.span>
            <motion.span variants={staggerItem} className="block text-4xl sm:text-6xl md:text-7xl mt-6 font-light text-blue-100/50 tracking-wide">
              液态智能 · 洞见微观
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 max-w-2xl text-lg text-zinc-400 sm:text-xl font-light leading-relaxed"
          >
            基于 <span className="text-blue-400 font-semibold">MAE-ViT</span> 与液态神经网络的下一代狼疮肾炎诊断平台。
            <br />
            将纳米级病理特征转化为精准的临床预后指标。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 flex flex-col gap-6 sm:flex-row"
          >
            <MagneticButton onClick={() => scrollToSection('clinical-workspace')}>
              <button className="group flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Microscope className="h-6 w-6" />
                开始智能阅片
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </MagneticButton>

            <MagneticButton strength={0.2} onClick={() => scrollToSection('research-lab')}>
              <button className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-10 py-5 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95">
                <BrainCircuit className="h-6 w-6" />
                进入科研工坊
              </button>
            </MagneticButton>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 animate-bounce text-zinc-500 flex flex-col items-center"
        >
            <span className="text-[10px] tracking-[0.2em] uppercase mb-2">Scroll to explore</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-zinc-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* ================= CLINICAL WORKSPACE ================= */}
      <section id="clinical-workspace" className="relative z-10 w-full max-w-[90rem] px-6 py-32 min-h-screen flex flex-col justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-white opacity-[0.02] pointer-events-none select-none whitespace-nowrap z-0">
            PRECISION
        </div>

        <div className="mb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Activity className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold text-white md:text-6xl tracking-tight">临床智能工作台</h2>
              <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">
                  聚光灯注意力机制 · 实时病理分析 · 多模态预后
              </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:grid-rows-2 h-auto md:h-[800px] relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
            className="md:col-span-8 md:row-span-2 min-h-[500px]"
          >
            <UploadZone onOpenReport={() => handleOpenDashboard()} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
            viewport={{ once: true }}
            className="md:col-span-4 md:row-span-1"
          >
            <SpotlightCard className="h-full p-8 flex flex-col justify-center bg-zinc-900/60 border-zinc-800 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-zinc-100">预后预测 (12个月)</h3>
                </div>
                <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">完全缓解概率</span>
                    <span className="text-green-400 font-mono text-lg">87%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "87%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">部分缓解概率</span>
                    <span className="text-yellow-400 font-mono text-lg">11%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "11%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-yellow-500"
                    />
                    </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="text-4xl font-mono text-white tracking-tight">IV型 <span className="text-base font-normal text-zinc-500 ml-2">(弥漫增生性)</span></div>
                    <div className="text-xs text-blue-400/80 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"/>
                    AI 置信度 98.2%
                    </div>
                </div>
                </div>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            viewport={{ once: true }}
            className="md:col-span-4 md:row-span-1"
          >
            <SpotlightCard className="h-full p-8 flex flex-col justify-center bg-zinc-900/60 border-zinc-800 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-zinc-100">模型实时状态</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-2xl bg-zinc-800/30 p-4 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                    <div className="text-3xl font-bold text-white font-mono">99.2<span className="text-sm text-zinc-500 ml-1">%</span></div>
                    <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">准确率</div>
                </div>
                <div className="rounded-2xl bg-zinc-800/30 p-4 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                    <div className="text-3xl font-bold text-white font-mono">12<span className="text-sm text-zinc-500 ml-1">ms</span></div>
                    <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">推理延迟</div>
                </div>
                <div className="col-span-2 rounded-2xl bg-zinc-800/30 p-4 border border-white/5 flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                    <span className="text-xs text-zinc-500 uppercase">当前架构</span>
                    <span className="text-sm font-mono text-purple-300">MAE-ViT-Huge</span>
                </div>
                </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      {/* ================= RESEARCH LAB ================= */}
      <section id="research-lab" className="relative z-10 w-full max-w-[90rem] px-6 py-32 pb-48 min-h-screen flex flex-col justify-center">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-white opacity-[0.02] pointer-events-none select-none whitespace-nowrap z-0">
             PLAYGROUND
         </div>

         <div className="mb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                <Database className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold text-white md:text-6xl tracking-tight">科研工坊</h2>
            <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">
                交互式数据生态 · 拖拽式模型微调 · 物理模拟
            </p>
          </motion.div>
        </div>
        
        {/* 在物理引擎上方添加“开始实验”入口 */}
        <div className="relative z-20 flex justify-center mb-12">
            <MagneticButton onClick={handleOpenResearch}>
                <button className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    <FlaskConical className="w-5 h-5" />
                    进入模型训练实验室
                    <ArrowRight className="w-4 h-4" />
                </button>
            </MagneticButton>
        </div>

        <div className="relative z-10">
            <PhysicsPlayground />
        </div>
        
        <div className="mt-12 text-center relative z-10">
            <p className="text-sm text-zinc-500 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping"></span>
                提示：鼠标可以抓取、拖动并抛掷上方的数据标签，体验物理引擎驱动的数据交互。
            </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 text-center text-zinc-600 z-10 bg-black/80 backdrop-blur-lg">
        <p className="text-sm">&copy; 2024 KidneyGuard AI. Powered by <span className="text-zinc-400">Liquid Intelligence</span>.</p>
      </footer>

      {/* GLOBAL FULLSCREEN DASHBOARDS */}
      <AnimatePresence>
        {isDashboardOpen && (
          <ClinicalDashboard 
            imageFile={dashboardFile} 
            onBack={handleCloseDashboard} 
          />
        )}
        {isResearchOpen && (
          <ResearchDashboard onClose={handleCloseResearch} />
        )}
      </AnimatePresence>

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        fileName="demo_slide_pasm.svs"
      />
      
    </main>
  );
}
