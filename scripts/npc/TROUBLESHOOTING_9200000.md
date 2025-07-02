# Troubleshooting Guide - GM Quest Tracker NPC (9200000)

## Common Issues and Solutions

### 1. Script Error: "no applicable overload found" for sendSimple

**Error Message:**
```
TypeError: invokeMember (sendSimple) on scripting.npc.NPCConversationManager failed due to: no applicable overload found
```

**Cause:** The server is running an old version of the script that tries to pass an array to `sendSimple()`.

**Solution:**
1. **Restart the server** to clear the script cache
2. **Verify the script file** `scripts/npc/9200000.js` contains the correct code
3. **Check line 201** should be: `cm.sendSimple(text + menuStr);`
4. **Ensure the `generateSelectionMenu` function** is present in the script

### 2. GM Commands Not Working

**Symptoms:**
- GM can see the interactive menu but clicking options doesn't work
- No items are granted or mobs spawned
- Error messages about command execution
- "Action cancelled" message appears when clicking "Yes"

**Solutions:**
1. **Check GM Level:**
   - GM Level 2+ required for `@item` command
   - GM Level 3+ required for `@spawn` command

2. **Verify Command Registration:**
   - Ensure `@item` and `@spawn` commands are properly registered
   - Check `CommandsExecutor.java` for command availability

3. **Test Command Execution:**
   - Try using `@item` and `@spawn` commands directly in chat
   - If direct commands work, the issue is in the script integration

4. **Yes/No Selection Issue:**
   - Ensure you're clicking "Yes" (not "No") in confirmation dialogs
   - The script expects selection value 1 for "Yes" and 0 for "No"

### 3. Script Not Loading

**Symptoms:**
- NPC doesn't respond when clicked
- Server logs show script loading errors

**Solutions:**
1. **Check File Path:** Ensure `9200000.js` is in `scripts/npc/` directory
2. **Check File Permissions:** Ensure the server can read the file
3. **Check Syntax:** Verify there are no JavaScript syntax errors
4. **Check NPC ID:** Ensure NPC ID 9200000 exists in the database

### 4. Quest Detection Issues

**Symptoms:**
- No quests are showing up
- Quest progress is incorrect
- Missing items or mobs

**Solutions:**
1. **Enable Debug Mode:**
   ```javascript
   var DEBUG_MODE = true; // Set at top of script
   ```

2. **Check Quest Range:**
   - Script scans quests 1000-30000
   - Adjust range if needed in `generateQuestSummary()`

3. **Verify Quest Status:**
   - Ensure quests are properly started (status = 1)
   - Check if quests exist in Quest.wz

### 5. NPC Location Data Missing

**Symptoms:**
- NPCs show "Unknown Location"
- Location information is not displayed

**Solutions:**
1. **Create NPC Location File:**
   - Create `scripts/npc_location.json`
   - Add NPC data in proper JSON format

2. **File Format Example:**
   ```json
   [
     {
       "name": "NPC Name",
       "location": "Town: Specific Location"
     }
   ]
   ```

### 6. Performance Issues

**Symptoms:**
- Script takes long time to load
- Server lag when using NPC

**Solutions:**
1. **Reduce Quest Range:**
   - Limit quest scanning range if not needed
   - Focus on specific quest ranges

2. **Optimize Data Loading:**
   - Cache NPC location data
   - Reduce debug output

3. **Check Server Resources:**
   - Monitor server CPU/memory usage
   - Consider script optimization

## Debug Mode

Enable debug mode to get detailed information:

```javascript
var DEBUG_MODE = true; // Set at top of script
```

Debug mode will show:
- Number of quests checked vs. found
- Active quest IDs
- Data source availability
- Processing errors
- GM menu generation details

## Testing the Script

Use the test script to verify functionality:

1. **Run Test Script:**
   ```javascript
   // Include in an NPC script or run via console
   load("scripts/test_gm_quest_tracker.js");
   ```

2. **Manual Testing:**
   - Create a test character with GM privileges
   - Start some quests with item/mob requirements
   - Test the NPC functionality

## Server Restart Required

After making changes to the script, **restart the server** to:
- Clear script cache
- Load updated code
- Ensure all changes take effect

## Log Files

Check server logs for detailed error information:
- Look for `NPCScriptManager` errors
- Check for JavaScript execution errors
- Monitor command execution logs

## Support

If issues persist:
1. Enable debug mode and check output
2. Review server logs for specific errors
3. Test with a minimal quest setup
4. Verify all dependencies are available 