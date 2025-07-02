# Quest Tracker NPC

## Overview
The Quest Tracker NPC (ID: 9200000) is a utility NPC that helps players track and summarize all their active quest objectives. It provides a consolidated view of what monsters to hunt and NPCs to talk to across all active quests.

## Features

### Quest Objective Summarization
The NPC automatically:
- **Hunts**: Aggregates all monsters to kill across active quests (e.g., if you need to kill 50 mushrooms in one quest and 70 in another, it shows the higher amount)
- **Talks**: Lists all NPCs you need to talk to to complete quests

### Smart Aggregation
- **Monster Hunting**: Takes the higher amount when the same monster appears in multiple quests
- **NPC Tracking**: Lists all unique NPCs you need to talk to to complete quests

## How to Use

### In-Game Usage
1. **Find the NPC**: Look for NPC ID 9200000 in the game world
2. **Talk to the NPC**: Click on the NPC to start the conversation
3. **View Summary**: The NPC will display a summary of all your active quest objectives

### Example Output
```
=== Quest Summary ===

Hunt:
- 80 Blue Mushrooms
- 50 Orange Mushrooms
- 30 Slimes

Talk:
- Shanks (Maple Island - Maple Island)
- John (Henesys - Henesys)
```

## Technical Details

### Quest Detection
The NPC scans quest IDs from 1000 to 10000 (in increments of 100) to find active quests. This covers most standard MapleStory quests.

### Data Sources
- **Quest Status**: Retrieved from the player's quest database
- **Quest Requirements**: Read from Quest.wz data files
- **Monster Names**: Retrieved from MonsterInformationProvider
- **NPC Information**: Retrieved from NPCLifeFactory and MapleMapFactory

### Error Handling
The script includes comprehensive error handling to:
- Skip non-existent quests
- Handle missing monster/NPC data
- Continue processing even if individual quests fail

## Installation

### Server Setup
1. **Place the Script**: Ensure `scripts/npc/9200000.js` is in your server's scripts directory
2. **Restart Server**: Restart your MapleStory server to load the new NPC script
3. **Test**: Talk to NPC ID 9200000 in-game to verify it works

### Database Requirements
No additional database setup is required. The NPC uses existing quest status data.

## Limitations

### Current Limitations
- **Item Collection**: Currently not implemented due to complexity of accessing item requirement data
- **Quest Range**: Only scans quests 1000-10000 (can be extended if needed)
- **Performance**: Scanning many quest IDs may cause slight delays

### Future Enhancements
- Add item collection tracking
- Expand quest ID range
- Add quest progress percentages
- Include quest names in summary
- Add filtering options

## Troubleshooting

### Common Issues

**NPC doesn't respond**
- Check if the script file exists in the correct location
- Verify server has been restarted after adding the script
- Check server logs for JavaScript errors

**No quests found**
- Ensure the player has active quests (status = STARTED)
- Check if quest IDs are within the scanned range (1000-10000)

**Missing monster names**
- Verify MonsterInformationProvider is properly configured
- Check if monster data files are loaded

**Missing NPC information**
- Verify NPCLifeFactory is properly configured
- Check if NPC data files are loaded

### Debug Mode
To enable debug output, modify the script to add console.log statements or use the server's logging system.

## Support

For issues or questions about the Quest Tracker NPC:
1. Check the server logs for error messages
2. Verify all required data files are present
3. Test with a simple quest to isolate the issue
4. Contact server administrators for technical support

## Version History

### v1.0 (Current)
- Basic quest tracking functionality
- Monster hunting aggregation
- NPC talk requirements
- Error handling and resilience
- Simple text-based output format 