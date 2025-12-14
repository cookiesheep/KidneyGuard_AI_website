export interface Glomerulus {
  id: string;
  x: number; // 百分比坐标 0-100
  y: number;
  width: number;
  height: number;
  type: "normal" | "cellular" | "sclerotic" | "membranous" | "crescents";
  confidence: number;
}

export const GLOMERULUS_TYPES = {
  normal: { label: "固有细胞无增生", color: "#22c55e", bg: "rgba(34, 197, 94, 0.25)" },
  cellular: { label: "毛细血管内增生", color: "#ef4444", bg: "rgba(239, 68, 68, 0.25)" },
  sclerotic: { label: "硬化", color: "#eab308", bg: "rgba(234, 179, 8, 0.25)" },
  membranous: { label: "单纯系膜增生", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.25)" },
  crescents: { label: "新月体", color: "#db2777", bg: "rgba(219, 39, 119, 0.25)" },
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

// ----------------------------------------------------------------------
// 真实人工标注数据 (final_img.jpg) - ID 598
// ----------------------------------------------------------------------
export const DATA_FINAL_IMG: Glomerulus[] = [
  { id: 'final-1', x: 39.6398, y: 40.6705, width: 2.6135, height: 2.2062, type: 'cellular', confidence: 0.0883105993270874 },
  { id: 'final-2', x: 45.2742, y: 31.2836, width: 2.7995, height: 2.0582, type: 'cellular', confidence: 0.0882626473903656 },
  { id: 'final-3', x: 42.2738, y: 49.1544, width: 2.6819, height: 2.2221, type: 'cellular', confidence: 0.0826101005077362 },
  { id: 'final-4', x: 57.6153, y: 42.9124, width: 2.1662, height: 2.0591, type: 'cellular', confidence: 0.08173311501741409 },
  { id: 'final-5', x: 79.6788, y: 27.2979, width: 1.8393, height: 1.5112, type: 'cellular', confidence: 0.07917356491088867 },
  { id: 'final-6', x: 30.0821, y: 58.7411, width: 2.2539, height: 2.1225, type: 'cellular', confidence: 0.07818613946437836 },
  { id: 'final-7', x: 45.0772, y: 49.3901, width: 2.3643, height: 2.4892, type: 'cellular', confidence: 0.07802518457174301 },
  { id: 'final-8', x: 72.8743, y: 48.5460, width: 2.1259, height: 2.0047, type: 'cellular', confidence: 0.07585994899272919 },
  { id: 'final-9', x: 34.4494, y: 45.1075, width: 2.4714, height: 2.2850, type: 'membranous', confidence: 0.07275200635194778 },
  { id: 'final-10', x: 75.0446, y: 27.6056, width: 2.0623, height: 1.8052, type: 'cellular', confidence: 0.07079311460256577 },
  { id: 'final-11', x: 29.1045, y: 53.0885, width: 2.2892, height: 1.8071, type: 'cellular', confidence: 0.06755459308624268 },
  { id: 'final-12', x: 37.3245, y: 64.9904, width: 2.7300, height: 2.5951, type: 'cellular', confidence: 0.06651205569505692 },
  { id: 'final-13', x: 39.8310, y: 62.6660, width: 2.3880, height: 2.4878, type: 'cellular', confidence: 0.06559428572654724 },
  { id: 'final-14', x: 41.4401, y: 61.7972, width: 2.0911, height: 2.1593, type: 'cellular', confidence: 0.05980074778199196 },
  { id: 'final-15', x: 50.4731, y: 40.7069, width: 1.9390, height: 2.1834, type: 'cellular', confidence: 0.058875422924757004 },
  { id: 'final-16', x: 48.4011, y: 39.5583, width: 1.7092, height: 1.6791, type: 'cellular', confidence: 0.056889887899160385 },
  { id: 'final-17', x: 47.3139, y: 38.3699, width: 2.0810, height: 1.7727, type: 'cellular', confidence: 0.056071165949106216 },
  { id: 'final-18', x: 35.2478, y: 41.9694, width: 2.4452, height: 2.2291, type: 'membranous', confidence: 0.054602548480033875 },
  { id: 'final-19', x: 81.2549, y: 44.8401, width: 2.1977, height: 2.1897, type: 'cellular', confidence: 0.05252838879823685 },
  { id: 'final-20', x: 40.3062, y: 38.7388, width: 1.6793, height: 1.4286, type: 'sclerotic', confidence: 0.051045674830675125 },
  { id: 'final-21', x: 75.5587, y: 49.1170, width: 1.5428, height: 1.3891, type: 'sclerotic', confidence: 0.04226357862353325 },
  { id: 'final-22', x: 27.7555, y: 62.1551, width: 2.7420, height: 1.8477, type: 'cellular', confidence: 0.040914200246334076 },
  { id: 'final-23', x: 23.5690, y: 59.4785, width: 1.7843, height: 1.6699, type: 'cellular', confidence: 0.03812061995267868 },
  { id: 'final-24', x: 56.1842, y: 21.8645, width: 1.9098, height: 1.3586, type: 'sclerotic', confidence: 0.03795149177312851 },
  { id: 'final-25', x: 15.4270, y: 64.6623, width: 2.5151, height: 2.8424, type: 'cellular', confidence: 0.03439229354262352 },
  { id: 'final-26', x: 75.6567, y: 32.0988, width: 2.1208, height: 2.1938, type: 'cellular', confidence: 0.03246008977293968 },
  { id: 'final-27', x: 44.3956, y: 33.5411, width: 2.4151, height: 1.7725, type: 'crescents', confidence: 0.03101876564323902 },
  { id: 'final-28', x: 52.5958, y: 33.1264, width: 2.3120, height: 1.7280, type: 'cellular', confidence: 0.016650589182972908 },
  { id: 'final-29', x: 83.7557, y: 41.5586, width: 1.5184, height: 1.4473, type: 'sclerotic', confidence: 0.011531938798725605 },
  { id: 'final-30', x: 38.2029, y: 56.8646, width: 1.4605, height: 1.6150, type: 'cellular', confidence: 0.005470057483762503 },
  { id: 'final-31', x: 78.3657, y: 25.3346, width: 2.6456, height: 1.5115, type: 'cellular', confidence: 0.0 },
  { id: 'final-32', x: 74.9678, y: 45.6508, width: 1.4634, height: 1.3263, type: 'membranous', confidence: 0.0 }
];

export const getMockDataForImage = (filename: string): Glomerulus[] => {
    if (filename.includes("6cb")) return DATA_IMG2;
    if (filename.includes("647")) return DATA_IMG3;
    if (filename.includes("final") || filename.includes("KB1704935")) return DATA_FINAL_IMG;
    // 默认返回 img1 的真实数据
    return DATA_IMG1;
};

export const generateMockAnnotations = (count = 15): Glomerulus[] => {
  return DATA_IMG1;
};
