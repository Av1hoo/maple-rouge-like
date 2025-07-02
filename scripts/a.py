import json
from collections import OrderedDict

input_file = "scripts/quests.jsonl"
output_file = "scripts/quests_unique.jsonl"

# Use OrderedDict to maintain order and track unique lines
seen = OrderedDict()

try:
    # Read the input file
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            # Parse JSON line to ensure valid JSON and normalize
            try:
                json_obj = json.loads(line.strip())
                # Convert back to string for consistent comparison
                json_str = json.dumps(json_obj, sort_keys=True)
                # Store only if not seen
                if json_str not in seen:
                    seen[json_str] = line.strip()
            except json.JSONDecodeError:
                print(f"Skipping invalid JSON line: {line.strip()}")
                continue

    # Write unique lines to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in seen.values():
            f.write(line + '\n')

    print(f"Duplicates removed. Output written to {output_file}")

except FileNotFoundError:
    print(f"Error: {input_file} not found.")
except Exception as e:
    print(f"An error occurred: {str(e)}")