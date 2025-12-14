"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Database, Sliders, CheckCircle2, ArrowRight, Upload } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

interface WizardProps {
  onStart: () => void;
}

const steps = [
  { id: 1, title: "任务类型", icon: Layers },
  { id: 2, title: "数据接入", icon: Database },
  { id: 3, title: "超参微调", icon: Sliders },
];

export default function TrainingWizard({ onStart }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [taskType, setTaskType] = useState<string | null>(null);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else onStart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10" />
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-zinc-950 px-4">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive ? "border-purple-500 bg-purple-500/20 text-purple-400 scale-110" :
                  isCompleted ? "border-green-500 bg-green-500/20 text-green-400" :
                  "border-zinc-700 bg-zinc-900 text-zinc-500"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-white" : "text-zinc-500"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[400px] bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Step 1: 任务类型 */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">选择您的训练目标</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'pathology', title: '纯病理诊断', desc: '训练图像分割与分类模型', icon: '🔬' },
                  { id: 'prognosis', title: '图像预后预测', desc: '基于病理图预测缓解概率', icon: '🔮' },
                  { id: 'multimodal', title: '多模态融合', desc: '图像 + 临床数据联合建模', icon: '🧬' },
                ].map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setTaskType(task.id)}
                    className={`cursor-pointer p-6 rounded-xl border transition-all ${
                      taskType === task.id 
                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50" 
                        : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-4xl mb-4">{task.icon}</div>
                    <h3 className="text-lg font-bold text-white">{task.title}</h3>
                    <p className="text-sm text-zinc-400 mt-2">{task.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: 数据接入 */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-full max-w-md border-2 border-dashed border-zinc-700 rounded-xl p-12 flex flex-col items-center text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">上传训练数据集</h3>
                <p className="text-zinc-400 mt-2 text-sm">
                  支持 CSV 索引文件或 ZIP 压缩包
                  <br />
                  <span className="text-orange-400 text-xs mt-2 block">⚠️ 推荐使用 PAS 染色切片以获得最佳效果</span>
                </p>
              </div>
              <div className="mt-6 flex gap-4 text-sm text-zinc-500">
                <span>示例数据: demo_dataset.zip (2.4GB)</span>
                <span className="text-purple-400 cursor-pointer hover:underline">下载模板</span>
              </div>
            </motion.div>
          )}

          {/* Step 3: 超参微调 */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-zinc-300">Learning Rate</label>
                  <span className="text-sm font-mono text-purple-400">1e-4</span>
                </div>
                <input type="range" className="w-full accent-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-zinc-300">Batch Size</label>
                  <span className="text-sm font-mono text-purple-400">32</span>
                </div>
                <input type="range" className="w-full accent-purple-500" min="8" max="128" step="8" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-zinc-300">Epochs</label>
                  <span className="text-sm font-mono text-purple-400">100</span>
                </div>
                <input type="range" className="w-full accent-purple-500" min="10" max="500" />
              </div>

              <div className="pt-6 border-t border-zinc-700">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">Freeze Backbone</div>
                    <div className="text-xs text-zinc-400">冻结 ViT 编码器权重，仅训练 Head</div>
                  </div>
                  <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* 底部按钮 */}
        <div className="absolute bottom-8 right-8">
          <MagneticButton onClick={nextStep}>
            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors">
              {currentStep === 3 ? "开始训练" : "下一步"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

