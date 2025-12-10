"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Printer, Activity, Calendar, User } from "lucide-react";
import { useRef, useEffect } from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export default function ReportModal({ isOpen, onClose, fileName }: ReportModalProps) {
  // 点击遮罩关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-900/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI 辅助病理诊断报告</h2>
                  <p className="text-xs text-zinc-400">KidneyGuard AI V2.0 生成</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-zinc-800/30 p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-zinc-500" />
                  <div>
                    <div className="text-xs text-zinc-500">患者 ID</div>
                    <div className="text-sm font-mono text-white">P-2024-8832</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-zinc-500" />
                  <div>
                    <div className="text-xs text-zinc-500">诊断日期</div>
                    <div className="text-sm font-mono text-white">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">AI</div>
                   <div>
                    <div className="text-xs text-zinc-500">影像源</div>
                    <div className="text-sm text-white truncate max-w-[120px]" title={fileName}>{fileName || "demo_slide.svs"}</div>
                  </div>
                </div>
              </div>

              {/* Diagnosis Conclusion */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">诊断结论 (Conclusion)</h3>
                <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="h-32 w-32 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-3xl font-bold text-white mb-2">IV 型狼疮肾炎</div>
                    <div className="text-lg text-blue-200">弥漫增生性 (Diffuse Proliferative LN)</div>
                    <div className="mt-4 flex gap-2">
                       <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30">
                         高活动性
                       </span>
                       <span className="inline-flex items-center rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300 ring-1 ring-inset ring-red-500/30">
                         需重点干预
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantitative Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">肾小球病变统计</h3>
                  <div className="space-y-3 rounded-xl border border-white/5 bg-zinc-800/20 p-4">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-zinc-300">细胞性新月体</span>
                       <span className="text-sm font-mono text-red-400">12 (18.5%)</span>
                    </div>
                    <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '18.5%' }}></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                       <span className="text-sm text-zinc-300">毛细血管内增生</span>
                       <span className="text-sm font-mono text-yellow-400">28 (43.1%)</span>
                    </div>
                    <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                      <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '43.1%' }}></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                       <span className="text-sm text-zinc-300">硬化球</span>
                       <span className="text-sm font-mono text-zinc-400">5 (7.7%)</span>
                    </div>
                    <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                      <div className="bg-zinc-500 h-1.5 rounded-full" style={{ width: '7.7%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">预后预测模型</h3>
                   <div className="rounded-xl border border-white/5 bg-zinc-800/20 p-4 flex flex-col justify-center h-full">
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-white mb-1">87.4%</div>
                        <div className="text-xs text-green-400">12个月完全缓解概率</div>
                      </div>
                      <div className="text-xs text-zinc-500 leading-relaxed text-center">
                        基于 MAE-ViT 多模态融合模型分析。<br/>建议结合临床 SLEDAI 评分进一步评估。
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/10 p-6 bg-zinc-900 sticky bottom-0 z-10 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                <Printer className="h-4 w-4" />
                打印
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                <Share2 className="h-4 w-4" />
                分享
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                <Download className="h-4 w-4" />
                下载 PDF 报告
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

