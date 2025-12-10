export interface Glomerulus {
  id: string;
  x: number; // 百分比坐标 0-100
  y: number;
  width: number;
  height: number;
  type: "normal" | "cellular" | "sclerotic" | "membranous";
  confidence: number;
}

export const GLOMERULUS_TYPES = {
  normal: { label: "固有细胞无增生", color: "#22c55e", bg: "rgba(34, 197, 94, 0.25)" },
  cellular: { label: "毛细血管内增生", color: "#ef4444", bg: "rgba(239, 68, 68, 0.25)" },
  sclerotic: { label: "硬化", color: "#eab308", bg: "rgba(234, 179, 8, 0.25)" },
  membranous: { label: "单纯系膜增生", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.25)" },
};

// 辅助函数：根据位置哈希生成固定的伪随机类型
// 保证每次刷新页面，同一个位置的类型不变
const getDeterministicType = (id: string, index: number): Glomerulus['type'] => {
    const types: Glomerulus['type'][] = ['cellular', 'cellular', 'membranous', 'normal', 'sclerotic'];
    // 简单的伪随机算法
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
    return types[hash % types.length];
};

// ----------------------------------------------------------------------
// 真实人工标注数据 (img1 - 875ed...ca0.jpg)
// ----------------------------------------------------------------------
const RAW_DATA_IMG1 = [
  { id: "rec-1", x: 38.8, y: 14.2 },
  { id: "rec-2", x: 39.9, y: 17.7 },
  { id: "rec-3", x: 35.6, y: 18.2 },
  { id: "rec-4", x: 35.2, y: 20.7 },
  { id: "rec-5", x: 37.2, y: 24.1 },
  { id: "rec-6", x: 36.2, y: 31.9 },
  { id: "rec-7", x: 33.7, y: 34.3 },
  { id: "rec-8", x: 34.8, y: 41 },
  { id: "rec-9", x: 34, y: 47.1 },
  { id: "rec-10", x: 32.7, y: 51.8 },
  { id: "rec-11", x: 40.8, y: 33.8 },
  { id: "rec-12", x: 42.9, y: 34.6 },
  { id: "rec-13", x: 44.3, y: 34.3 },
  { id: "rec-14", x: 39.9, y: 41.9 },
  { id: "rec-15", x: 41.6, y: 42.7 },
  { id: "rec-16", x: 44.7, y: 47.2 },
  { id: "rec-17", x: 42.6, y: 52.6 },
  { id: "rec-18", x: 45.1, y: 53.4 },
  { id: "rec-19", x: 43, y: 58.2 },
  { id: "rec-20", x: 39.2, y: 61 },
  { id: "rec-21", x: 41.8, y: 63.3 },
  { id: "rec-22", x: 34.9, y: 73.8 },
  { id: "rec-23", x: 36.8, y: 73.7 },
  { id: "rec-24", x: 52.3, y: 62.2 },
  { id: "rec-25", x: 50.4, y: 65.4 },
  { id: "rec-26", x: 49.8, y: 67.7 },
  { id: "rec-27", x: 50.9, y: 69.2 },
  { id: "rec-28", x: 50.9, y: 75.4 }
];

// 处理并增强数据
const DATA_IMG1: Glomerulus[] = RAW_DATA_IMG1.map((p, i) => ({
    ...p,
    width: 5,  // 略微调大一点，更容易点中
    height: 5,
    type: getDeterministicType(p.id, i),
    confidence: 0.85 + (i % 15) * 0.01 // 0.85 - 0.99
}));

// ----------------------------------------------------------------------
// 预估数据 (img2 - 6cb6c...eb3.jpg) - 待校准
// ----------------------------------------------------------------------
const DATA_IMG2: Glomerulus[] = [
    { id: 'g2-1', x: 30, y: 25, width: 5, height: 5, type: 'cellular', confidence: 0.96 },
    { id: 'g2-2', x: 50, y: 22, width: 5.5, height: 5.5, type: 'membranous', confidence: 0.94 },
    { id: 'g2-3', x: 70, y: 28, width: 5, height: 5, type: 'sclerotic', confidence: 0.91 },
    { id: 'g2-4', x: 35, y: 48, width: 6, height: 6, type: 'normal', confidence: 0.97 },
    { id: 'g2-5', x: 55, y: 50, width: 5.5, height: 5.5, type: 'sclerotic', confidence: 0.88 },
    { id: 'g2-6', x: 75, y: 45, width: 5, height: 5, type: 'cellular', confidence: 0.95 },
];

// ----------------------------------------------------------------------
// 预估数据 (img3 - 64740...5ae.jpg) - 待校准
// ----------------------------------------------------------------------
const DATA_IMG3: Glomerulus[] = [
    { id: 'g3-1', x: 30, y: 20, width: 7, height: 7, type: 'cellular', confidence: 0.99 },
    { id: 'g3-2', x: 28, y: 40, width: 6.5, height: 6.5, type: 'sclerotic', confidence: 0.95 },
    { id: 'g3-3', x: 32, y: 60, width: 7, height: 7, type: 'normal', confidence: 0.92 },
    { id: 'g3-4', x: 65, y: 30, width: 6.5, height: 6.5, type: 'membranous', confidence: 0.94 },
    { id: 'g3-5', x: 62, y: 50, width: 7, height: 7, type: 'cellular', confidence: 0.97 },
];

export const getMockDataForImage = (filename: string): Glomerulus[] => {
    if (filename.includes("6cb")) return DATA_IMG2;
    if (filename.includes("647")) return DATA_IMG3;
    // 默认返回 img1 的真实数据
    return DATA_IMG1;
};

export const generateMockAnnotations = (count = 15): Glomerulus[] => {
  return DATA_IMG1;
};
