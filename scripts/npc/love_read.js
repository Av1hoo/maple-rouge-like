/*
 * NPC: Nana (Ellinia)
 * ID: 9010001
 * Love Letter Reading
 * @item 4001131
 */

var status = 0;
var loveLetterId = 4001131; // Complete Love Letter

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

    if (status == 0) {
        if (cm.haveItem(loveLetterId, 1)) {
            cm.sendNext("Oh, you have the completed Love Letter! Let me read it to you...\n\n*Dear Beloved, my heart aches for you across the seas of time...*");
        } else {
            cm.sendOk("You don't have the Love Letter. Speak to Lazy Daisy to complete the quest.");
            cm.dispose();
        }
    } else if (status == 1) {
        cm.sendOk("What a beautiful letter! Keep it as a memento of this journey.");
        cm.dispose();
    }
}