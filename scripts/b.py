import json
import os
from bs4 import BeautifulSoup

# Read the HTML content from scripts/input.txt
with open('scripts//input.txt', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse HTML with BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Initialize list for new NPC data
new_npc_data = []

# Find all table rows with class 'even' or 'odd'
rows = soup.find_all('tr', class_=['even', 'odd'])

for row in rows:
    # Extract NPC name
    name_cell = row.find('td', class_='views-field views-field-title')
    if name_cell:
        npc_name = name_cell.find('a').text.strip()
    else:
        continue

    # Extract location(s)
    location_cell = row.find('td', class_='views-field views-field-field-map-nid')
    if location_cell:
        # Get all location links
        location_links = location_cell.find_all('a')
        if location_links:
            # Take the first location
            first_location = location_links[0].text.strip()
            # Check if there are multiple locations
            location_text = first_location + (" (multiple)" if len(location_links) > 1 else "")
        else:
            location_text = ""
    else:
        location_text = ""

    # Add to new NPC data list
    new_npc_data.append({
        "name": npc_name,
        "location": location_text
    })

# Load existing data from npc_location.json if it exists
existing_npc_data = []
json_file = 'npc_location.json'
if os.path.exists(json_file):
    with open(json_file, 'r', encoding='utf-8') as infile:
        try:
            existing_npc_data = json.load(infile)
            if not isinstance(existing_npc_data, list):
                existing_npc_data = []
        except json.JSONDecodeError:
            existing_npc_data = []

# Combine existing and new data, avoiding duplicates by NPC name
existing_names = {npc["name"] for npc in existing_npc_data}
updated_npc_data = existing_npc_data + [
    npc for npc in new_npc_data if npc["name"] not in existing_names
]

# Write combined data back to npc_location.json
with open(json_file, 'w', encoding='utf-8') as outfile:
    json.dump(updated_npc_data, outfile, indent=4)

print("NPC data has been appended to npc_location.json")