const fs = require('fs');
const path = require('path');

// 指向新的文件
const INPUT_FILE = "d:\\桌面2.0\\id598.md";
const OUTPUT_FILE = path.join(__dirname, "lib", "mock-data-final.ts");

function parseJson() {
    try {
        let rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
        
        // 提取 Markdown 代码块中的 JSON
        const jsonMatch = rawData.match(/```\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            rawData = jsonMatch[1];
        } else {
            // 尝试直接查找第一个 { 和 最后一个 }
            const start = rawData.indexOf('{');
            const end = rawData.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                rawData = rawData.substring(start, end + 1);
            }
        }

        const data = JSON.parse(rawData);
        
        // 我们只关心 id: 598 的数据
        // 这个文件本身就是一个 task 对象 (id: 598)
        let results = [];
        if (data.id === 598) {
             const annotations = data.annotations || [];
             if (annotations.length > 0) {
                 results = annotations[0].result || [];
             }
        } else {
            console.error("Warning: Task ID is not 598, but proceeding anyway.");
            const annotations = data.annotations || [];
             if (annotations.length > 0) {
                 results = annotations[0].result || [];
             }
        }

        const uniqueBoxes = []; 
        const THRESHOLD = 1.0; 

        results.forEach((item, index) => {
            if (item.type !== 'rectanglelabels') return;
            
            const val = item.value || {};
            const labels = val.rectanglelabels || [];
            
            let glomType = "cellular";
            let priority = 1;

            const labelStr = labels.join(",");
            
            // 优先级逻辑
            if (labelStr.includes("硬化")) { glomType = "sclerotic"; priority = 10; }
            else if (labelStr.includes("新月体")) { glomType = "crescents"; priority = 9; }
            else if (labelStr.includes("系膜")) { glomType = "membranous"; priority = 8; }
            else if (labelStr.includes("固有")) { glomType = "normal"; priority = 7; }
            else if (labelStr.includes("毛细血管")) { glomType = "cellular"; priority = 5; }

            const cx = val.x + val.width / 2;
            const cy = val.y + val.height / 2;

            let existingIndex = -1;
            for (let i = 0; i < uniqueBoxes.length; i++) {
                const box = uniqueBoxes[i];
                const boxCx = box.x + box.width / 2;
                const boxCy = box.y + box.height / 2;
                const dist = Math.sqrt(Math.pow(cx - boxCx, 2) + Math.pow(cy - boxCy, 2));
                if (dist < THRESHOLD) {
                    existingIndex = i;
                    break;
                }
            }

            const newBox = {
                x: val.x,
                y: val.y,
                width: val.width,
                height: val.height,
                type: glomType,
                priority: priority,
                confidence: item.score || 0.95
            };

            if (existingIndex !== -1) {
                // 如果是“重复框”，我们取信息量最大的那个（或者最后那个）
                if (newBox.priority > uniqueBoxes[existingIndex].priority) {
                    uniqueBoxes[existingIndex] = newBox;
                }
            } else {
                uniqueBoxes.push(newBox);
            }
        });
            
        // 写入文件
        let fileContent = "// 自动生成的数据，请手动复制到 web/lib/mock-data.ts\n";
        fileContent += `// Source: ID 598\n`;
        fileContent += `// Total Unique Count: ${uniqueBoxes.length}\n`;
        fileContent += "export const DATA_FINAL_IMG = [\n";
        
        uniqueBoxes.forEach((item, index) => {
            fileContent += `  { id: 'final-${index}', x: ${item.x.toFixed(4)}, y: ${item.y.toFixed(4)}, width: ${item.width.toFixed(4)}, height: ${item.height.toFixed(4)}, type: '${item.type}', confidence: ${item.confidence.toFixed(2)} },\n`;
        });
        
        fileContent += "];\n";
        
        fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
        console.log(`Successfully wrote ${uniqueBoxes.length} annotations to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error("Error processing file:", e);
    }
}

parseJson();
