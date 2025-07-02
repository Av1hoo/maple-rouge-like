// Quest Tracker NPC - New Version

/**
 * Quest Tracker NPC
 * Tracks and summarizes all active quest objectives for the player
 * NPC ID: 9200000
 */

var status = -1;
var DEBUG_MODE = false;
var isGM = false;
var currentSummary = null;

// Cache for faster lookups
var mapIdToNameCache = {};
var npcIdToNameCache = {};
var npcNameToLocationCache = {};
var mapNameCache = null;
var mapCacheFile = "handbook/MapIdCache.txt";

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode != 1) {
        cm.dispose();
        return;
    }
    
    status++;
    
    if (status == 0) {
        isGM = cm.getPlayer().isGM();
        var summary = generateQuestSummary();
        currentSummary = summary;
        
        if (summary.isEmpty) {
            cm.sendOk("You don't have any active quests at the moment.");
        } else {
            if (isGM && (Object.keys(summary.collect).length > 0 || Object.keys(summary.hunt).length > 0 || summary.talk.length > 0)) {
                showQuestSummaryMenu(summary);
            } else {
                cm.sendNext(summary.text);
            }
        }
    } else if (status == 1) {
        if (isGM && currentSummary && (Object.keys(currentSummary.collect).length > 0 || Object.keys(currentSummary.hunt).length > 0 || currentSummary.talk.length > 0)) {
            handleGMSelection(selection);
        } else {
            cm.dispose();
        }
    } else if (status == 2) {
        if (isGM && currentSummary) {
            handleGMAction(selection);
        } else {
            cm.dispose();
        }
    } else {
        cm.dispose();
    }
}

// Get active quests directly from database
function getActiveQuestsFromDatabase() {
    var questIds = [];
    var characterId = cm.getPlayer().getId();
    
    try {
        var con = Packages.tools.DatabaseConnection.getConnection();
        var ps = con.prepareStatement("SELECT quest FROM queststatus WHERE characterid = ? AND completed = 0 AND quest < 29000 AND status = 1");
        ps.setInt(1, characterId);
        var rs = ps.executeQuery();
        while (rs.next()) {
            questIds.push(rs.getInt("quest"));
        }
        // print all the queries if DEBUG_MODE is true
        if (DEBUG_MODE) {
            print("Active quests for character ID " + characterId + ": " + questIds.join(", "));
        }
        
        rs.close();
        ps.close();
        con.close();
    } catch (e) {
        if (DEBUG_MODE) {
            print("Database error: " + e.message);
        }
    }
    
    return questIds;
}

// Get active quests from the player's quest status
function getActiveQuestsFromPlayer() {
    var questIds = [];
    var startedQuests = cm.getPlayer().getStartedQuests();
    if (startedQuests && startedQuests.size() > 0) {
        var iter = startedQuests.iterator();
        while (iter.hasNext()) {
            var questStatus = iter.next();
            var quest = questStatus.getQuest();
            var questId = quest.getId();
            var questName = quest.getName ? quest.getName().toLowerCase() : "";
            if (questId >= 29000) continue;
            if (questName.indexOf("dalair") !== -1) continue;
            questIds.push(questId);
        }
    }
    return questIds;
}

// Get map name with caching
function getMapName(mapId) {
    if (mapIdToNameCache[mapId]) return mapIdToNameCache[mapId];
    
    try {
        var map = Packages.server.MapleMapFactory.getInstance().getMap(mapId);
        if (map && map.getMapName) {
            var name = map.getMapName();
            mapIdToNameCache[mapId] = name;
            return name;
        }
    } catch (e) {}
    
    // Fallback to Map.txt
    try {
        var file = new java.io.File("handbook/Map.txt");
        if (file.exists()) {
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var line;
            while ((line = reader.readLine()) !== null) {
                var parts = line.split(" - ");
                if (parts.length >= 3) {
                    var id = parseInt(parts[0].trim());
                    if (id === mapId) {
                        var name = parts[2].trim();
                        mapIdToNameCache[mapId] = name;
                        reader.close();
                        return name;
                    }
                }
            }
            reader.close();
        }
    } catch (e) {}
    
    return "Unknown Map";
}

// Get NPC name with caching
function getNpcName(npcId) {
    if (npcIdToNameCache[npcId]) return npcIdToNameCache[npcId];
    
    // Try String.wz first
    try {
        var npcStringProvider = Packages.provider.DataProviderFactory.getDataProvider(Packages.provider.wz.WZFiles.STRING);
        var npcStringData = npcStringProvider.getData("Npc.img");
        var npcStringChild = npcStringData.getChildByPath(String(npcId));
        
        if (npcStringChild) {
            var name = Packages.provider.DataTool.getString("name", npcStringChild, "Unknown NPC");
            npcIdToNameCache[npcId] = name;
            return name;
        }
    } catch (e) {}
    
    // Fallback to npc.txt
    try {
        var file = new java.io.File("handbook/npc.txt");
        if (file.exists()) {
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var line;
            while ((line = reader.readLine()) !== null) {
                var parts = line.split(" - ");
                if (parts.length >= 2) {
                    var id = parseInt(parts[0].trim());
                    if (id === npcId) {
                        var name = parts[1].trim();
                        npcIdToNameCache[npcId] = name;
                        reader.close();
                        return name;
                    }
                }
            }
            reader.close();
        }
    } catch (e) {}
    
    return "Unknown NPC";
}

// Get NPC location with caching
function getNpcLocation(npcName) {
    if (npcNameToLocationCache[npcName]) return npcNameToLocationCache[npcName];
    try {
        var file = new java.io.File("scripts/npc_location.json");
        if (file.exists()) {
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var jsonString = "";
            var line;
            while ((line = reader.readLine()) !== null) {
                jsonString += line;
            }
            reader.close();
            var jsonArray = JSON.parse(jsonString);
            for (var i = 0; i < jsonArray.length; i++) {
                var npc = jsonArray[i];
                if (npc.name && npc.name.trim().toLowerCase() === npcName.trim().toLowerCase() && npc.location) {
                    var location = npc.location;
                    // If location contains '(multiple)', pick the first location
                    if (location.toLowerCase().indexOf('(multiple)') !== -1) {
                        // Try to split by ',' or ';' or '|'
                        var parts = location.split(/,|;|\|/);
                        if (parts.length > 0) {
                            location = parts[0].replace('(multiple)', '').trim();
                        } else {
                            location = location.replace('(multiple)', '').trim();
                        }
                    }
                    npcNameToLocationCache[npcName] = location;
                    return location;
                }
            }
        }
    } catch (e) {}
    return "Unknown Location";
}

function normalize(str) {
    return str.replace(/[:\-]/g, "").replace(/\s+/g, "").toLowerCase();
}

function buildMapNameCache() {
    mapNameCache = {};
    var cacheLines = [];
    try {
        var file = new java.io.File("handbook/Map.txt");
        if (file.exists()) {
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var line;
            while ((line = reader.readLine()) !== null) {
                var parts = line.split(" - ");
                if (parts.length >= 3) {
                    var mapId = parseInt(parts[0].trim());
                    var area = parts[1].trim().toLowerCase();
                    var mapName = parts.slice(2).join(" - ").trim().toLowerCase();
                    var key = normalize(area + " - " + mapName);
                    mapNameCache[key] = mapId;
                    cacheLines.push(key + "," + mapId);
                }
            }
            reader.close();
        }
        // Write cache to file
        var cacheFile = new java.io.File(mapCacheFile);
        var writer = new java.io.BufferedWriter(new java.io.FileWriter(cacheFile));
        for (var i = 0; i < cacheLines.length; i++) {
            writer.write(cacheLines[i]);
            writer.newLine();
        }
        writer.close();
        if (DEBUG_MODE) print("MapIdCache.txt created with " + cacheLines.length + " entries.");
    } catch (e) {
        if (DEBUG_MODE) print("Error building mapNameCache: " + e.message);
    }
}

function loadMapNameCache() {
    mapNameCache = {};
    try {
        var file = new java.io.File(mapCacheFile);
        if (file.exists()) {
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var line;
            while ((line = reader.readLine()) !== null) {
                var parts = line.split(",");
                if (parts.length === 2) {
                    mapNameCache[parts[0]] = parseInt(parts[1]);
                }
            }
            reader.close();
            if (DEBUG_MODE) print("Loaded MapIdCache.txt with " + Object.keys(mapNameCache).length + " entries.");
        } else {
            buildMapNameCache();
        }
    } catch (e) {
        if (DEBUG_MODE) print("Error loading mapNameCache: " + e.message);
        buildMapNameCache();
    }
}

function getMapIdFromLocation(location) {
    if (!location) return null;
    if (!mapNameCache) loadMapNameCache();

    if (DEBUG_MODE) {
        print("Looking for map ID for location: " + location);
    }

    var lowerLoc = location.trim().toLowerCase();
    var isColon = lowerLoc.indexOf(":") !== -1;
    var mainArea = null, subLocation = null;
    if (isColon) {
        var locParts = lowerLoc.split(":");
        mainArea = locParts[0].trim();
        subLocation = locParts[1].trim();
        if (DEBUG_MODE) {
            print("Split location - Main: '" + mainArea + "', Sub: '" + subLocation + "'");
        }
    }

    // 1. Try direct normalized lookup
    var normLoc = normalize(location);
    if (mapNameCache[normLoc]) {
        if (DEBUG_MODE) print("Found mapId by direct normalized lookup: " + mapNameCache[normLoc]);
        return mapNameCache[normLoc];
    }
    // 2. Try with colon replaced by dash
    if (isColon) {
        var replaced = location.replace(":", " - ");
        var normReplaced = normalize(replaced);
        if (mapNameCache[normReplaced]) {
            if (DEBUG_MODE) print("Found mapId by colon-to-dash normalized lookup: " + mapNameCache[normReplaced]);
            return mapNameCache[normReplaced];
        }
        // Try with double spaces fixed
        var replaced2 = replaced.replace(/  +/g, " ");
        var normReplaced2 = normalize(replaced2);
        if (mapNameCache[normReplaced2]) {
            if (DEBUG_MODE) print("Found mapId by colon-to-dash+space normalized lookup: " + mapNameCache[normReplaced2]);
            return mapNameCache[normReplaced2];
        }
    }

    // 3. Special case: "X: X" pattern (town/city itself)
    if (isColon && mainArea === subLocation) {
        var cityName = mainArea.trim().toLowerCase();
        // Scan Map.txt for an exact match in the third part (map name)
        try {
            var mapFile = new java.io.File("handbook/Map.txt");
            if (mapFile.exists()) {
                var mapReader = new java.io.BufferedReader(new java.io.FileReader(mapFile));
                var mapLine;
                while ((mapLine = mapReader.readLine()) !== null) {
                    var mapParts = mapLine.split(" - ");
                    if (mapParts.length >= 3) {
                        var mapId = parseInt(mapParts[0].trim());
                        var mapName = mapParts.slice(2).join(" - ").trim().toLowerCase();
                        if (mapName === cityName) {
                            if (DEBUG_MODE) print('Found mapId by exact mapName match: ' + mapId);
                            mapReader.close();
                            return mapId;
                        }
                    }
                }
                mapReader.close();
            }
        } catch (e) {
            if (DEBUG_MODE) print('Error in city X:X fallback: ' + e.message);
        }
    }

    // 4. If location is a single word (e.g., 'Leafre'), or ends with (multiple), pick area==mapname
    var normLocSimple = normalize(location.replace('(multiple)', '').trim());
    if (!isColon && normLocSimple && mapNameCache[normLocSimple + normLocSimple]) {
        if (DEBUG_MODE) print('Picked main town mapId for simple location: ' + mapNameCache[normLocSimple + normLocSimple]);
        return mapNameCache[normLocSimple + normLocSimple];
    }

    // 5. Fallback: match by mapName only (after colon or dash)
    var mapNameOnly = null;
    if (isColon) {
        mapNameOnly = location.split(':')[1].trim();
    } else if (location.indexOf('-') !== -1) {
        var dashParts = location.split('-');
        mapNameOnly = dashParts.slice(1).join('-').trim();
    } else {
        mapNameOnly = location.trim();
    }
    var normMapNameOnly = normalize(mapNameOnly);
    var foundId = null;
    var foundCount = 0;
    for (var key in mapNameCache) {
        if (key.endsWith(normMapNameOnly)) {
            foundId = mapNameCache[key];
            foundCount++;
            if (DEBUG_MODE) print('MapName-only fallback candidate: ' + key + ' => ' + foundId);
        }
    }
    if (foundCount === 1) {
        if (DEBUG_MODE) print('Found mapId by mapName-only fallback: ' + foundId);
        return foundId;
    } else if (foundCount > 1 && DEBUG_MODE) {
        print('Multiple mapName-only fallback candidates found for: ' + mapNameOnly);
    }

    if (DEBUG_MODE) {
        print("No map ID found for location: " + location);
    }
    return null;
}

function showQuestSummaryMenu(summary) {
    var text = "#b=== Quest Summary ===#k\r\n\r\n";
    var gmOptions = [];
    var options = [];
    var itemKeys = Object.keys(summary.collect);
    var mobKeys = Object.keys(summary.hunt);
    var hasItems = false, hasMobs = false, hasTalk = false;
    
    // Collect section
    if (itemKeys.length > 0) {
        var anyCollect = false;
        for (var i = 0; i < itemKeys.length; i++) {
            var itemData = summary.collect[itemKeys[i]];
            var remaining = Math.max(0, itemData.required - itemData.current);
            if (remaining > 0) {
                if (!anyCollect) {
                    text += "#e#rCollect:#n#k\r\n";
                    anyCollect = true;
                }
                if (isGM) {
                    var line = "#e#L" + options.length + "#" + remaining + " #t" + itemData.id + "# (Have: " + itemData.current + "/" + itemData.required + ")#l#n#k";
                    text += "- " + line + "\r\n";
                    options.push("item" + i);
                    gmOptions.push({type: "item", data: Object.assign({}, itemData, {remaining: remaining})});
                    hasItems = true;
                } else {
                    var line = "#e" + remaining + " #t" + itemData.id + "##k#n (Have: " + itemData.current + "/" + itemData.required + ")";
                    text += "- " + line + "\r\n";
                }
            }
        }
        if (anyCollect) text += "\r\n";
    }
    
    // Hunt section
    if (mobKeys.length > 0) {
        var anyHunt = false;
        for (var i = 0; i < mobKeys.length; i++) {
            var mobData = summary.hunt[mobKeys[i]];
            if (mobData.count > 0) {
                if (!anyHunt) {
                    text += "#e#rHunt:#n#k\r\n";
                    anyHunt = true;
                }
                if (isGM) {
                    var line = "#e#L" + options.length + "#" + mobData.count + " #o" + mobData.id + "# (#n#k) #l";
                    text += "- " + line + "\r\n";
                    options.push("mob" + i);
                    gmOptions.push({type: "mob", data: mobData});
                    hasMobs = true;
                } else {
                    var line = "#e" + mobData.count + " #o" + mobData.id + "##k#n";
                    text += "- " + line + "\r\n";
                }
            }
        }
        if (anyHunt) text += "\r\n";
    }
    
    // Talk section
    if (summary.talk.length > 0) {
        text += "#e#rTalk:#n#k\r\n";
        for (var i = 0; i < summary.talk.length; i++) {
            var talkEntry = summary.talk[i];
            if (isGM) {
                text += "- #e#L" + options.length + "#" + talkEntry + "#l#n#k\r\n";
                options.push("talk" + i);
                gmOptions.push({type: "talk", data: talkEntry});
                hasTalk = true;
            } else {
                text += "- " + talkEntry + "\r\n";
            }
        }
        text += "\r\n";
    }
    
    // Script quests
    if (summary.scriptQuests.length > 0) {
        text += "#dScript-based Quests (check quest NPCs):#k\r\n";
        for (var i = 0; i < summary.scriptQuests.length; i++) {
            text += "- " + summary.scriptQuests[i] + "\r\n";
        }
        text += "\r\n";
    }
    
    // Grant All/Spawn All at the end for GMs
    if (isGM && (hasItems || hasMobs)) {
        text += "#bClick on an option below to perform GM action:#k\r\n";
        if (hasItems) {
            text += "#L" + options.length + "#Grant All Items#l\r\n";
            options.push("grantall");
            var grantAllItems = [];
            for (var i = 0; i < itemKeys.length; i++) {
                var itemData = summary.collect[itemKeys[i]];
                var remaining = Math.max(0, itemData.required - itemData.current);
                if (remaining > 0) {
                    grantAllItems.push(Object.assign({}, itemData, {remaining: remaining}));
                }
            }
            gmOptions.push({type: "grant_all_items", data: grantAllItems});
        }
        if (hasMobs) {
            text += "#L" + options.length + "#Spawn All Mobs#l\r\n";
            options.push("spawnall");
            var spawnAllMobs = [];
            for (var i = 0; i < mobKeys.length; i++) {
                var mobData = summary.hunt[mobKeys[i]];
                if (mobData.count > 0) {
                    spawnAllMobs.push(mobData);
                }
            }
            gmOptions.push({type: "spawn_all_mobs", data: spawnAllMobs});
        }
    }
    
    currentSummary.gmOptions = gmOptions;
    cm.sendSimple(text);
}

function handleGMSelection(selection) {
    if (selection < 0 || !currentSummary.gmOptions || selection >= currentSummary.gmOptions.length) {
        cm.sendOk("Invalid selection.");
        cm.dispose();
        return;
    }
    
    var selectedOption = currentSummary.gmOptions[selection];
    
    if (selectedOption.type === "item") {
        var itemData = selectedOption.data;
        var confirmText = "#bConfirm GM Action:#k\r\n\r\n";
        confirmText += "Grant #e" + itemData.remaining + "x #t" + itemData.id + "##k#n to yourself?\r\n\r\n";
        confirmText += "This will use the @item command.\r\n";
        confirmText += "Item: " + itemData.name + " (ID: " + itemData.id + ")\r\n";
        confirmText += "Quantity: " + itemData.remaining;
        currentSummary.selectedAction = {type: "item", data: itemData};
        cm.sendYesNo(confirmText);
    } else if (selectedOption.type === "mob") {
        var mobData = selectedOption.data;
        var confirmText = "#bConfirm GM Action:#k\r\n\r\n";
        confirmText += "Spawn #e" + mobData.count + "x #o" + mobData.id + "##k near you?\r\n\r\n";
        confirmText += "This will use the @spawn command.\r\n";
        confirmText += "Mob: " + mobData.name + " (ID: " + mobData.id + ")\r\n";
        confirmText += "Quantity: " + mobData.count;
        currentSummary.selectedAction = {type: "mob", data: mobData};
        cm.sendYesNo(confirmText);
    } else if (selectedOption.type === "grant_all_items") {
        var confirmText = "#bConfirm GM Action:#k\r\n\r\n";
        confirmText += "Grant ALL quest items to yourself?\r\n\r\n";
        confirmText += "This will use multiple @item commands.\r\n";
        confirmText += "Items to grant: " + (selectedOption.data ? selectedOption.data.length : 0) + " different types";
        currentSummary.selectedAction = {type: "grant_all_items", data: selectedOption.data};
        cm.sendYesNo(confirmText);
    } else if (selectedOption.type === "spawn_all_mobs") {
        var confirmText = "#bConfirm GM Action:#k\r\n\r\n";
        confirmText += "Spawn ALL quest mobs near you?\r\n\r\n";
        confirmText += "This will use multiple @spawn commands.\r\n";
        confirmText += "Mobs to spawn: " + (selectedOption.data ? selectedOption.data.length : 0) + " different types";
        currentSummary.selectedAction = {type: "spawn_all_mobs", data: selectedOption.data};
        cm.sendYesNo(confirmText);
    } else if (selectedOption.type === "talk") {
        var talkEntry = selectedOption.data;
        var npcId = null;
        var npcName = null;
        var location = null;
        var mapId = null;
        
        // Extract NPC ID from talk entry
        var idMatch = talkEntry.match(/NPC ID: (\d+)/);
        if (idMatch) npcId = parseInt(idMatch[1]);
        
        // Extract NPC name
        var nameMatch = talkEntry.match(/#e([^#]+)#n/);
        if (nameMatch) npcName = nameMatch[1];
        
        // Extract location
        var locMatch = talkEntry.match(/- #b([^#]+)#k/);
        if (locMatch) location = locMatch[1];
        
        // If we have NPC name, get location and map
        if (npcName) {
            location = getNpcLocation(npcName);
            if (location && location !== "Unknown Location") {
                mapId = getMapIdFromLocation(location);
            }
        }
        
        var confirmText = "#bConfirm GM Action:#k\r\n\r\n";
        if (mapId) {
            var mapName = getMapName(mapId);
            confirmText += "Warp to this NPC's map?\r\n\r\n";
            confirmText += talkEntry + "\r\n";
            confirmText += "Map: #b" + mapName + "#k (ID: " + mapId + ")";
            currentSummary.selectedAction = {type: "talk", data: talkEntry, mapId: mapId, mapName: mapName};
        } else {
            confirmText += "Could not find a map for this NPC.\r\n\r\n";
            confirmText += talkEntry;
            currentSummary.selectedAction = {type: "talk", data: talkEntry, mapId: null};
        }
        cm.sendYesNo(confirmText);
    }
}

function handleGMAction(selection) {
    if ((selection != -1 && selection != 1) || !currentSummary.selectedAction) {
        cm.sendOk("Action cancelled.");
        cm.dispose();
        return;
    }
    
    var action = currentSummary.selectedAction;
    
    try {
        if (action.type === "item") {
            var itemData = action.data;
            var command = "@item " + itemData.id + " " + itemData.remaining;
            var player = cm.getPlayer();
            var client = player.getClient();
            Packages.client.command.CommandsExecutor.getInstance().handle(client, command);
            cm.sendOk("Successfully granted #e" + itemData.remaining + "x #t" + itemData.id + "##k#n to yourself.");
        } else if (action.type === "mob") {
            var mobData = action.data;
            var command = "@spawn " + mobData.id + " " + mobData.count;
            var player = cm.getPlayer();
            var client = player.getClient();
            Packages.client.command.CommandsExecutor.getInstance().handle(client, command);
            cm.sendOk("Successfully spawned #e" + mobData.count + "x #o" + mobData.id + "##k near you.");
        } else if (action.type === "grant_all_items") {
            var player = cm.getPlayer();
            var client = player.getClient();
            var executor = Packages.client.command.CommandsExecutor.getInstance();
            var grantedCount = 0;
            for (var i = 0; i < action.data.length; i++) {
                var itemData = action.data[i];
                if (itemData && itemData.remaining > 0) {
                    var command = "@item " + itemData.id + " " + itemData.remaining;
                    executor.handle(client, command);
                    grantedCount++;
                }
            }
            cm.sendOk("Successfully granted " + grantedCount + " different item types to yourself.");
        } else if (action.type === "spawn_all_mobs") {
            var player = cm.getPlayer();
            var client = player.getClient();
            var executor = Packages.client.command.CommandsExecutor.getInstance();
            var spawnedCount = 0;
            for (var i = 0; i < action.data.length; i++) {
                var mobData = action.data[i];
                if (mobData && mobData.count > 0) {
                    var command = "@spawn " + mobData.id + " " + mobData.count;
                    executor.handle(client, command);
                    spawnedCount++;
                }
            }
            cm.sendOk("Successfully spawned " + spawnedCount + " different mob types near you.");
        } else if (action.type === "talk") {
            if (action.mapId) {
                var command = "@warp " + action.mapId;
                var player = cm.getPlayer();
                var client = player.getClient();
                Packages.client.command.CommandsExecutor.getInstance().handle(client, command);
                cm.sendOk("You have been warped to map ID: " + action.mapId + " (" + action.mapName + ").");
            } else {
                cm.sendOk("Could not find a map for this NPC.\r\n\r\n" + action.data);
            }
        }
    } catch (e) {
        cm.sendOk("Error executing command: " + e.message);
    }
    cm.dispose();
}
function generateQuestSummary() {
    var summary = {
        hunt: {},
        talk: [],
        collect: {},
        scriptQuests: [],
        isEmpty: true,
        questDetails: []
    };
    
    // Get active quests directly from database
    // var questIds = getActiveQuestsFromDatabase();
    // With:
    var questIds = getActiveQuestsFromPlayer();
    
    if (questIds.length === 0) {
        summary.text = "You don't have any active quests at the moment.";
        if (DEBUG_MODE) {
            summary.text += "\n\nDebug: Found 0 active quests in database.";
        }
        return summary;
    }
    
    summary.isEmpty = false;
    
    // Get Quest.wz data provider
    var questDataProvider = Packages.provider.DataProviderFactory.getDataProvider(Packages.provider.wz.WZFiles.QUEST);
    var actData = questDataProvider.getData("Act.img");
    var checkData = questDataProvider.getData("Check.img");
    
    // Process each active quest
    for (var i = 0; i < questIds.length; i++) {
        var questId = questIds[i];
        
        if (DEBUG_MODE) {
            print("Processing questId: " + questId);
        }
        try {
            var quest = Packages.server.quest.Quest.getInstance(questId);
            if (!quest) {
                if (DEBUG_MODE) print("Quest object not found for questId: " + questId);
                continue;
            }
            
            var questName = quest.getName();
            var questInfo = "Quest " + questId + ": " + questName;
            
            // Read Quest.wz data directly for this quest
            var questActData0 = actData.getChildByPath(questId + "/0");
            var questActData1 = actData.getChildByPath(questId + "/1");
            var questCheckData0 = checkData.getChildByPath(questId + "/0");
            var questCheckData1 = checkData.getChildByPath(questId + "/1");

            function processQuestCheckData(questCheckData) {
                if (DEBUG_MODE) {
                    print("questCheckData for questId " + questId + ": " + questCheckData);
                }
                if (!questCheckData) {
                    if (DEBUG_MODE) print("No questCheckData for questId: " + questId);
                    return;
                }
                // Check for item requirements in Check.img (what you need to collect)
                var itemData = questCheckData.getChildByPath("item");
                if (itemData) {
                    var itemChildren = itemData.getChildren();
                    for (var j = 0; j < itemChildren.size(); j++) {
                        var itemChild = itemChildren.get(j);
                        var itemId = Packages.provider.DataTool.getInt("id", itemChild, 0);
                        var itemCount = Packages.provider.DataTool.getInt("count", itemChild, 0);
                        if (itemId > 0 && itemCount > 0) {
                            var itemName = Packages.server.ItemInformationProvider.getInstance().getName(itemId);
                            if (itemName && itemName != "") {
                                // Get current inventory amount
                                var currentAmount = getTotalItemCount(itemId);
                                var remaining = Math.max(0, itemCount - currentAmount);
                                if (remaining > 0) {
                                    // Use item ID as key to avoid duplicates
                                    var itemKey = itemId + ":" + itemName;
                                    if (!summary.collect[itemKey]) {
                                        summary.collect[itemKey] = {
                                            id: itemId,
                                            name: itemName,
                                            required: 0,
                                            current: currentAmount
                                        };
                                    }
                                    summary.collect[itemKey].required += itemCount;
                                    summary.collect[itemKey].current = currentAmount;
                                }
                            }
                        }
                    }
                }
                // Check for mob requirements in Check.img
                var mobData = questCheckData.getChildByPath("mob");
                if (mobData) {
                    var mobChildren = mobData.getChildren();
                    for (var j = 0; j < mobChildren.size(); j++) {
                        var mobChild = mobChildren.get(j);
                        var mobId = Packages.provider.DataTool.getInt("id", mobChild, 0);
                        var mobCount = Packages.provider.DataTool.getInt("count", mobChild, 0);
                        if (mobId > 0 && mobCount > 0) {
                            var mobName = Packages.server.life.MonsterInformationProvider.getInstance().getMobNameFromId(mobId);
                            if (mobName && mobName != "") {
                                // Get current progress for this mob in this quest
                                var currentProgress = parseInt(cm.getQuestProgress(questId, mobId)) || 0;
                                var remaining = Math.max(0, mobCount - currentProgress);
                                // Only show if still need to kill more
                                if (remaining > 0) {
                                    if (DEBUG_MODE) print("Adding hunt entry for questId " + questId + ": " + mobName + " (" + mobId + ") x" + remaining);
                                    var mobKey = mobId + ":" + mobName;
                                    if (!summary.hunt[mobKey]) {
                                        summary.hunt[mobKey] = {
                                            id: mobId,
                                            name: mobName,
                                            count: 0
                                        };
                                    }
                                    summary.hunt[mobKey].count = Math.max(summary.hunt[mobKey].count, remaining);
                                }
                            }
                        }
                    }
                }
                // Note: NPC processing is now done separately for completion requirements only
            }

            // Process both /0 and /1 for items and mobs (requirements can be in either section)
            processQuestCheckData(questCheckData0);
            processQuestCheckData(questCheckData1);
            
            // Only process /1 for NPCs (completion requirements)
            if (questCheckData1) {
                // Check for NPC requirements in Check.img /1 (completion NPC)
                var npcValue = Packages.provider.DataTool.getInt("npc", questCheckData1, 0);
                if (DEBUG_MODE) print("Completion npcValue for questId " + questId + ": " + npcValue);
                
                if (npcValue > 0) {
                    // Check if all requirements are completed before showing the completion NPC
                    var shouldAddNPC = false;
                    var hasItems0 = questCheckData0 && questCheckData0.getChildByPath("item");
                    var hasMobs0 = questCheckData0 && questCheckData0.getChildByPath("mob");
                    var hasItems1 = questCheckData1 && questCheckData1.getChildByPath("item");
                    var hasMobs1 = questCheckData1 && questCheckData1.getChildByPath("mob");
                    var hasItems = hasItems0 || hasItems1;
                    var hasMobs = hasMobs0 || hasMobs1;
                    
                    if (!hasItems && !hasMobs) {
                        // Talk-only quest, always add the completion NPC
                        shouldAddNPC = true;
                    } else {
                        // Check if we have completed all requirements
                        var itemsCompleted = true;
                        var mobsCompleted = true;
                        
                        // Check item requirements from both /0 and /1
                        if (hasItems0) {
                            var itemData = questCheckData0.getChildByPath("item");
                            var itemChildren = itemData.getChildren();
                            for (var j = 0; j < itemChildren.size(); j++) {
                                var itemChild = itemChildren.get(j);
                                var itemId = Packages.provider.DataTool.getInt("id", itemChild, 0);
                                var itemCount = Packages.provider.DataTool.getInt("count", itemChild, 0);
                                if (itemId > 0 && itemCount > 0) {
                                    var currentAmount = getTotalItemCount(itemId);
                                    if (currentAmount < itemCount) {
                                        itemsCompleted = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if (hasItems1 && itemsCompleted) {
                            var itemData = questCheckData1.getChildByPath("item");
                            var itemChildren = itemData.getChildren();
                            for (var j = 0; j < itemChildren.size(); j++) {
                                var itemChild = itemChildren.get(j);
                                var itemId = Packages.provider.DataTool.getInt("id", itemChild, 0);
                                var itemCount = Packages.provider.DataTool.getInt("count", itemChild, 0);
                                if (itemId > 0 && itemCount > 0) {
                                    var currentAmount = getTotalItemCount(itemId);
                                    if (currentAmount < itemCount) {
                                        itemsCompleted = false;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Check mob requirements from both /0 and /1
                        if (hasMobs0) {
                            var mobData = questCheckData0.getChildByPath("mob");
                            var mobChildren = mobData.getChildren();
                            for (var j = 0; j < mobChildren.size(); j++) {
                                var mobChild = mobChildren.get(j);
                                var mobId = Packages.provider.DataTool.getInt("id", mobChild, 0);
                                var mobCount = Packages.provider.DataTool.getInt("count", mobChild, 0);
                                if (mobId > 0 && mobCount > 0) {
                                    var currentProgress = parseInt(cm.getQuestProgress(questId, mobId)) || 0;
                                    if (currentProgress < mobCount) {
                                        mobsCompleted = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if (hasMobs1 && mobsCompleted) {
                            var mobData = questCheckData1.getChildByPath("mob");
                            var mobChildren = mobData.getChildren();
                            for (var j = 0; j < mobChildren.size(); j++) {
                                var mobChild = mobChildren.get(j);
                                var mobId = Packages.provider.DataTool.getInt("id", mobChild, 0);
                                var mobCount = Packages.provider.DataTool.getInt("count", mobChild, 0);
                                if (mobId > 0 && mobCount > 0) {
                                    var currentProgress = parseInt(cm.getQuestProgress(questId, mobId)) || 0;
                                    if (currentProgress < mobCount) {
                                        mobsCompleted = false;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Only add completion NPC if all requirements are completed
                        if (itemsCompleted && mobsCompleted) {
                            shouldAddNPC = true;
                        }
                    }
                    
                    if (shouldAddNPC) {
                        var npcName = getNpcName(npcValue);
                        var location = getNpcLocation(npcName);
                        var mapId = getMapIdFromLocation(location);
                        var mapName = mapId ? getMapName(mapId) : location;
                        if (DEBUG_MODE) {
                            print("Quest " + questId + ": Adding completion NPC " + npcName + " (ID: " + npcValue + "), location: " + location + ", mapId: " + mapId);
                        }
                        var npcInfo = "#e" + npcName + "#n#k - #b" + mapName + "#k";
                        if (DEBUG_MODE) {
                            npcInfo += " (NPC ID: " + npcValue + ", Map ID: " + (mapId || "Unknown") + ")";
                        }
                        if (summary.talk.indexOf(npcInfo) === -1) {
                            summary.talk.push(npcInfo);
                        }
                    }
                }
            }
            
            // Check if this is a script-based quest
            var hasScriptReq = quest.hasScriptRequirement(false) || quest.hasScriptRequirement(true);
            if (hasScriptReq) {
                summary.scriptQuests.push(questName + " (Script-based)");
            }
            
            // Also check traditional quest methods as fallback
            var relevantMobs = quest.getRelevantMobs();
            var mobCount = relevantMobs ? relevantMobs.size() : 0;
            
            if (mobCount > 0) {
                for (var j = 0; j < relevantMobs.size(); j++) {
                    var mobId = relevantMobs.get(j);
                    var requiredAmount = quest.getMobAmountNeeded(mobId);
                    var currentProgress = parseInt(cm.getQuestProgress(questId, mobId)) || 0;
                    var remainingAmount = requiredAmount - currentProgress;
                    
                    if (remainingAmount > 0) {
                        var mobName = Packages.server.life.MonsterInformationProvider.getInstance().getMobNameFromId(mobId);
                        if (mobName && mobName != "") {
                            // Use mob ID as key to avoid duplicates
                            var mobKey = mobId + ":" + mobName;
                            if (!summary.hunt[mobKey]) {
                                summary.hunt[mobKey] = {
                                    id: mobId,
                                    name: mobName,
                                    count: 0
                                };
                            }
                            summary.hunt[mobKey].count = Math.max(summary.hunt[mobKey].count, remainingAmount);
                        }
                    }
                }
            }
            
        } catch (e) {
            // Error processing quest, continue to next one
            if (DEBUG_MODE) {
                summary.questDetails.push("Quest " + questId + ": Error processing - " + e.message);
            }
        }
    }
    
    // Build the summary text
    var text = "#b=== Quest Summary ===#k\r\n\r\n";
    
    // Show quest details (only in debug mode)
    if (DEBUG_MODE) {
        text += "#eActive Quests:#k\r\n";
        for (var i = 0; i < summary.questDetails.length; i++) {
            text += "- " + summary.questDetails[i] + "\r\n";
        }
        text += "\r\n";
    }
    
    if (Object.keys(summary.collect).length > 0) {
        text += "#e#rCollect:#n#k\r\n";
        for (var itemKey in summary.collect) {
            var itemData = summary.collect[itemKey];
            var remaining = Math.max(0, itemData.required - itemData.current);
            
            // Only show items that still need to be collected
            if (remaining > 0) {
                text += "- #e" + remaining + " #t" + itemData.id + "##k#n (Have: " + itemData.current + "/" + itemData.required + ")\r\n";
            }
        }
        text += "\r\n";
    }
    
    if (Object.keys(summary.hunt).length > 0) {
        text += "#e#rHunt:#n#k\r\n";
        for (var mobKey in summary.hunt) {
            var mobData = summary.hunt[mobKey];
            text += "- #e" + mobData.count + " #o" + mobData.id + "##k\r\n";
        }
        text += "\r\n";
    }
    
    if (summary.talk.length > 0) {
        text += "#e#rTalk:#n#k\r\n";
        for (var i = 0; i < summary.talk.length; i++) {
            text += "- " + summary.talk[i] + "\r\n";
        }
        text += "\r\n";
    }
    
    if (summary.scriptQuests.length > 0) {
        text += "#dScript-based Quests (check quest NPCs):#k\r\n";
        for (var i = 0; i < summary.scriptQuests.length; i++) {
            text += "- " + summary.scriptQuests[i] + "\r\n";
        }
        text += "\r\n";
    }
    
    // Add debug info at the end
    if (DEBUG_MODE) {
        text += "\r\n#kDebug: Found " + questIds.length + " active quests in database. Quest IDs: " + questIds.join(", ");
    }
    
    summary.text = text;
    return summary;
}
// Helper function to get total item count across all inventory tabs
function getTotalItemCount(itemId) {
    var player = cm.getPlayer();
    var totalCount = 0;
    // Check ETC tab
    totalCount += player.getInventory(Packages.client.inventory.InventoryType.ETC).countById(itemId);
    // Check USE tab
    totalCount += player.getInventory(Packages.client.inventory.InventoryType.USE).countById(itemId);
    // Check SETUP tab
    totalCount += player.getInventory(Packages.client.inventory.InventoryType.SETUP).countById(itemId);
    // Check CASH tab (for some quest items)
    totalCount += player.getInventory(Packages.client.inventory.InventoryType.CASH).countById(itemId);
    // Check EQUIP tab (for quest equips)
    totalCount += player.getInventory(Packages.client.inventory.InventoryType.EQUIP).countById(itemId);
    return totalCount;
}


