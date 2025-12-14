import json
import re
import sys


# Input file path
INPUT_FILE = r"d:\桌面2.0\id598.md"

# Label mapping
LABEL_MAP = {
    "毛细血管细胞增生的肾小球": "cellular",
    "新月体形成的肾小球": "crescents",
    "单纯系膜增生肾小球": "membranous",
    "硬化肾小球": "sclerotic"
}

IGNORED_LABELS = {"肾小球"}

def parse_json_from_md():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        
        # Extract JSON part: from first '{' to last '}'
        start_index = content.find('{')
        end_index = content.rfind('}')
        
        if start_index == -1 or end_index == -1:
            print("Error: No JSON object found in the file.")
            return

        json_str = content[start_index : end_index + 1]
        
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return

        # Handle different possible structures of Label Studio export
        results = []
        
        # Case 1: Direct list of results (unlikely for a single task export, but possible)
        if isinstance(data, list):
             # If it's a list of tasks, take the first one
             if len(data) > 0 and 'annotations' in data[0]:
                 results = data[0]['annotations'][0].get('result', [])
             elif len(data) > 0 and 'result' in data[0]:
                 # Maybe a list of completions?
                 results = data[0].get('result', [])
             else:
                 # Maybe the list itself is the results?
                 results = data
        
        # Case 2: Dict representing a task
        elif isinstance(data, dict):
            if 'annotations' in data:
                if len(data['annotations']) > 0:
                    results = data['annotations'][0].get('result', [])
            elif 'result' in data:
                results = data['result']
            else:
                # Maybe it's just the result object itself? Unlikely.
                pass

        ts_output_items = []
        count = 1

        for item in results:
            # Check if it's a rectangle label
            if item.get('type') != 'rectanglelabels':
                continue
            
            value = item.get('value', {})
            labels = value.get('rectanglelabels', [])
            
            if not labels:
                continue
            
            label = labels[0] # Assume one label per box
            
            if label in IGNORED_LABELS:
                continue
            
            mapped_type = LABEL_MAP.get(label)
            
            if not mapped_type:
                # If label is not in map and not ignored, skip or warn? 
                # User instruction implies only mapping specific ones and ignoring "肾小球".
                # We will skip if not in map.
                continue

            x = value.get('x', 0)
            y = value.get('y', 0)
            width = value.get('width', 0)
            height = value.get('height', 0)
            score = item.get('score', 0.0) # Get confidence score

            # Format: { id: 'final-X', x: 12.34, y: 56.78, width: 1.23, height: 4.56, type: 'TYPE', confidence: SCORE }
            # Keep 4 decimal places for coordinates
            
            ts_item = (
                f"{{ id: 'final-{count}', "
                f"x: {x:.4f}, y: {y:.4f}, width: {width:.4f}, height: {height:.4f}, "
                f"type: '{mapped_type}', confidence: {score} }}"
            )
            
            ts_output_items.append(ts_item)
            count += 1

        # Generate final TypeScript array string
        ts_code = "export const DATA_FINAL_IMG = [\n  " + ",\n  ".join(ts_output_items) + "\n];"
        
        print(ts_code)

    except FileNotFoundError:
        print(f"Error: File not found at {INPUT_FILE}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    parse_json_from_md()
