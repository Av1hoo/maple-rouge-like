/*
 * NPC: Nana (Henesys)
 * ID: 9010000
 * Heart Collection Quest
 * @item 4001374 @item 4001373
 */

var status = 0;
var heartItemId = 4001374; // Heart item
var requiredHearts = 10; // 10 per town
var towns = ["Henesys", "Ellinia", "Perion", "Kerning City", "Lith Harbor"];
var passageItemId = 4001373; // Passage to boss map
var bossMapId = 100020100; // Boss map (e.g., Mano's map)

function getTodayDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
}

// Map town names to map IDs for validation
var townMaps = {
    "Henesys": [100000000, 100000100, 100000200],
    "Ellinia": [101000000, 101000100, 101000200],
    "Perion": [102000000, 102000100, 102000200],
    "Kerning City": [103000000, 103000100, 103000200],
    "Lith Harbor": [104000000, 104000100, 104000200]
};

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) {
        cm.dispose();
        return;
    }
    if (mode == 1) {
        status++;
    } else {
        status--;
    }

    var player = cm.getPlayer();
    var extraDetails = player.getAccountExtraDetails();
    if (extraDetails == null) {
        cm.sendOk("Error: Unable to load account details. Please try again later.");
        cm.dispose();
        return;
    }
    var heartQuest = extraDetails.getHeartQuest();
    var today = getTodayDate();

    if (status == 0) {
        if (heartQuest == null || heartQuest.getDate() !== today) {
            heartQuest = new Packages.client.HeartQuest();
            heartQuest.setDate(today);
            heartQuest.setHenesysCount(0);
            heartQuest.setElliniaCount(0);
            heartQuest.setPerionCount(0);
            heartQuest.setKerningCount(0);
            heartQuest.setLithCount(0);
            heartQuest.setCompleted(false);
            extraDetails.setHeartQuest(heartQuest);
            // Save account details
            player.writeExtraDetails(); // Use cm.getClient().writeExtraDetails() if defined in MapleClient
        }
        if (heartQuest.isCompleted()) {
            cm.sendOk("You've already completed today's Heart Collection Quest. Come back tomorrow!");
            cm.dispose();
        } else {
            var progress = "Collect 10 hearts from each town:\n";
            progress += "Henesys: " + heartQuest.getHenesysCount() + "/10\n";
            progress += "Ellinia: " + heartQuest.getElliniaCount() + "/10\n";
            progress += "Perion: " + heartQuest.getPerionCount() + "/10\n";
            progress += "Kerning City: " + heartQuest.getKerningCount() + "/10\n";
            progress += "Lith Harbor: " + heartQuest.getLithCount() + "/10";
            if (heartQuest.getHenesysCount() >= requiredHearts &&
                heartQuest.getElliniaCount() >= requiredHearts &&
                heartQuest.getPerionCount() >= requiredHearts &&
                heartQuest.getKerningCount() >= requiredHearts &&
                heartQuest.getLithCount() >= requiredHearts) {
                cm.sendNext("You've collected all the required hearts! Let's exchange them for a passage to the boss.");
            } else {
                cm.sendOk(progress + "\n\nDefeat monsters in each town to collect hearts.");
                cm.dispose();
            }
        }
    } else if (status == 1) {
        if (heartQuest.isCompleted()) {
            cm.dispose();
        } else {
            if (cm.canHold(passageItemId, 1)) {
                if (cm.haveItem(heartItemId, 50)) {
                    cm.gainItem(heartItemId, -50); // Remove 50 hearts
                    cm.gainItem(passageItemId, 1); // Give passage
                    heartQuest.setCompleted(true);
                    extraDetails.setHeartQuest(heartQuest);
                    // Save account details
                    player.writeExtraDetails(); // Use cm.getClient().writeExtraDetails() if defined in MapleClient
                    cm.sendOk("Here's your Passage to the Boss Map (Map ID: " + bossMapId + "). Use it to teleport and defeat the boss for a pet!");
                } else {
                    cm.sendOk("You don't have enough hearts. You need 50 total.");
                }
            } else {
                cm.sendOk("Please make space in your ETC inventory.");
            }
            cm.dispose();
        }
    }
}