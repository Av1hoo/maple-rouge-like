/* 9900000.js - Quest Helper NPC for MapleStory v83 (Cosmic)
 * Allows players to search quests by name and view details with WZ file images.
 * Reads quest data from quests.jsonl in the scripts directory.
 * Shows a selection menu for multiple matches, with details on click.
 * Triggered via @quest command (requires separate Java command implementation).
 * Updated to ensure compatibility with Cosmic v83 formatting codes.
 */

var status = 0;
var searchTerm = "";
var matchedQuests = [];
var selectedQuest = null;
var quests = null;
var filePath = "";
var loadError = null;

// Load quests at script initialization (server console logging only)
(function initialize() {
    try {
        var File = Packages.java.io.File;
        var BufferedReader = Packages.java.io.BufferedReader;
        var FileReader = Packages.java.io.FileReader;
        var file = new File("scripts/quests.jsonl");
        
        // Log file path to server console
        filePath = file.getAbsolutePath();
        
        if (!file.exists()) {
            print("File not found: " + filePath);
            loadError = "File not found: " + filePath;
            quests = [];
            return;
        }

        var reader = new BufferedReader(new FileReader(file));
        var line;
        quests = [];
        
        while ((line = reader.readLine()) != null) {
            try {
                var quest = JSON.parse(line);
                quests.push(quest);
            } catch (e) {
                print("Error parsing quest: " + e);
            }
        }
        reader.close();
        print("Loaded " + quests.length + " quests from quests.jsonl");
    } catch (e) {
        print("Error loading quests.jsonl: " + e);
        loadError = "Error loading quests.jsonl: " + e;
        quests = [];
    }
})();

function start() {
    // Notify player of file path and any load errors
    if (loadError) {
        cm.getPlayer().dropMessage(5, "Quest Helper: " + loadError);
        cm.sendOk("Quest data is unavailable due to an error: " + loadError + ". Please contact an administrator.");
        cm.dispose();
        return;
    }
    if (quests === null || quests.length === 0) {
        cm.getPlayer().dropMessage(5, "Quest Helper: No quests loaded from quests.jsonl");
        cm.sendOk("No quests are available. Please contact an administrator.");
        cm.dispose();
        return;
    }
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) {
        cm.sendOk("Come back when you need help with quests!");
        cm.dispose();
        return;
    }
    if (mode == 1) {
        status++;
    } else {
        status--;
    }

    if (status == 0) {
        cm.sendGetText("Welcome to the Quest Helper! Please enter a search term for the quest name:");
    } else if (status == 1) {
        searchTerm = cm.getText().toLowerCase();
        if (searchTerm.length < 3) {
            cm.sendOk("Please enter at least 3 characters to search for quests.");
            cm.dispose();
            return;
        }
        matchedQuests = quests.filter(function(quest) {
            return quest.name && quest.name.toLowerCase().indexOf(searchTerm) !== -1;
        });

        if (matchedQuests.length === 0) {
            cm.sendOk("No quests found matching '" + searchTerm + "'.");
            cm.dispose();
        } else if (matchedQuests.length === 1) {
            selectedQuest = matchedQuests[0];
            displayQuestDetails();
            cm.dispose();
        } else {
            var menu = "Multiple quests found. Please select one:\r\n";
            for (var i = 0; i < matchedQuests.length; i++) {
                menu += "#L" + i + "#" + matchedQuests[i].name + "#l\r\n";
            }
            cm.sendSimple(menu);
        }
    } else if (status == 2) {
        if (selection >= 0 && selection < matchedQuests.length) {
            selectedQuest = matchedQuests[selection];
            displayQuestDetails();
        } else {
            cm.sendOk("Invalid selection.");
        }
        cm.dispose();
    }
}

function displayQuestDetails() {
    var message = "#eQuest: " + (selectedQuest.name || "Unknown") + "#n\r\n\r\n";

    // Items needed - only display if items exist
    var items = selectedQuest.items_needed || [];
    if (items.length > 0) {
        message += "#bItems needed:#k\r\n";
        message += items.slice(0, 10).map(function(item) {
            return typeof item === "object" && item.id ? "#i" + item.id + "# #z" + item.id + "# (x" + (item.quantity || 1) + ")" : item;
        }).join("\r\n") + (items.length > 10 ? "\r\n...and more" : "") + "\r\n";
    }

    // NPCs involved
    message += "\r\n#bNPCs involved:#k\r\n";
    var npcs = selectedQuest.npcs_involved || [];
    message += npcs.length === 0 ? "None\r\n" : npcs.slice(0, 10).map(function(npc) {
        return typeof npc === "object" && npc.id ? "#e#p" + npc.id + "#e" : (typeof npc === "string" ? npc : npc.name || "Unknown");
    }).join("\r\n") + (npcs.length > 10 ? "\r\n...and more" : "") + "#n\r\n";

    // Procedures
    message += "\r\n#bProcedures:#k\r\n";
    var procedures = selectedQuest.procedures || [];
    message += procedures.length === 0 ? "None\r\n" : procedures.slice(0, 10).join("\r\n") + (procedures.length > 10 ? "\r\n...and more" : "") + "\r\n";

    // Rewards
    message += "\r\n#bRewards:#k\r\n";
    var rewards = selectedQuest.rewards || [];
    message += rewards.length === 0 ? "None\r\n" : rewards.slice(0, 10).join("\r\n") + (rewards.length > 10 ? "\r\n...and more" : "");

    // Truncate message to prevent client issues
    if (message.length > 4000) {
        message = message.substring(0, 4000) + "\r\n[Message truncated]";
    }

    cm.sendOk(message);
}