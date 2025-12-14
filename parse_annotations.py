import json
import sys

# 设置输入输出文件路径
INPUT_FILE = r"d:\桌面2.0\project-16-at-2025-12-11-11-32-738730a2.json"

# 类型映射表
TYPE_MAP = {
    "硬化性肾小球": "sclerotic",
    "硬化肾小球": "sclerotic",
    "新月体肾小球": "crescents", 
    "新月体性肾小球": "crescents",
    "伴有新月体形成的肾小球": "crescents",
    "新月体形成的肾小球": "crescents",
    "单纯系膜增生性肾小球": "membranous",
    "单纯系膜增生肾小球": "membranous",
    "毛细血管内增生性肾小球": "cellular",
    "毛细血管内增生肾小球": "cellular",
    "毛细血管细胞增生的肾小球": "cellular",
    "固有细胞无明显增生性肾小球": "normal",
    "肾小球": "cellular" # 默认归类，或者根据置信度/其他逻辑
}

def parse_json():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 假设 JSON 是 Label Studio 导出的格式，通常是一个列表，每一项代表一个任务
        # 我们只需要第一个任务的结果
        if isinstance(data, list) and len(data) > 0:
            annotations = data[0].get('annotations', [])
            if len(annotations) > 0:
                results = annotations[0].get('result', [])
            else:
                print("Error: No annotations found.")
                return
        else:
             # 有时候直接是 dict
             results = data.get('annotations', [{}])[0].get('result', [])

        ts_output = []
        
        for i, item in enumerate(results):
            if item.get('type') != 'rectanglelabels':
                continue
            
            val = item.get('value', {})
            labels = val.get('rectanglelabels', [])
            
            # 确定类型
            # 优先匹配具体的病理类型，如果没有则使用默认
            glom_type = "cellular" # 默认值
            
            for label in labels:
                if label in TYPE_MAP:
                    glom_type = TYPE_MAP[label]
                    break
                # 模糊匹配
                for k, v in TYPE_MAP.items():
                    if k in label:
                        glom_type = v
                        break
            
            # 构造对象
            obj = {
                "id": f"final-{i}",
                "x": val.get('x', 0),
                "y": val.get('y', 0),
                "width": val.get('width', 0),
                "height": val.get('height', 0),
                "type": glom_type,
                "confidence": 0.95 + (i % 5) * 0.01 # 模拟置信度
            }
            ts_output.append(obj)
            
        # 生成 TypeScript 代码
        print("const DATA_FINAL_IMG: Glomerulus[] = [")
        for item in ts_output:
            print(f"  {{ id: '{item['id']}', x: {item['x']:.4f}, y: {item['y']:.4f}, width: {item['width']:.4f}, height: {item['height']:.4f}, type: '{item['type']}', confidence: {item['confidence']:.2f} }},")
        print("];")
        
        # 打印所有遇到的标签，用于调试
        print("\n// Detected Labels:")
        all_labels = set()
        for item in results:
            if 'rectanglelabels' in item.get('value', {}):
                all_labels.update(item['value']['rectanglelabels'])
        print(f"// {all_labels}")

    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    parse_json()

