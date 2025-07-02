/*
 * NPC  : Lazy Daisy
 * ID   : 9209008
 * Reads the finished Love Letter (item 4001131).
 */

var status = 0;
var LETTER_ID = 4001131;
var hasLetter = false;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {          // player closed
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) {   // first “Next” declined
        cm.dispose();
        return;
    }
    if (mode == 1) status++; else status--;

    /*────────────────── MAIN FLOW ──────────────────*/
    if (status == 0) {
        hasLetter = cm.haveItem(LETTER_ID, 1);
        if (!hasLetter) {
            cm.sendOk("You don't seem to have the completed Love Letter yet. Bring it to me and I'll read it for you.");
            cm.dispose();
            return;
        }
        /* page 1 */
        cm.sendNext("My Mumtak,\r\n\r\nOn certain nights off the coast of Japan, a small male *pufferfish* spends day after day in quiet devotion, beating his fins into the sand until a perfect mandala appears—delicate ridges, concentric rings, every grain placed by patient intention. He does it so that when his chosen mate drifts above, she’ll know the ocean floor was shaped expressly for her.");
    } else if (status == 1) {
        /* page 2 */
        cm.sendNextPrev("Today, on your birthday, I feel like that pufferfish.\r\n\r\nI had the same idea—only my sand is this game. Every rock and curve is one of our jokes or adventures; I arranged hours and heartbeats the very same way, hoping you’ll see the design and recognize that it’s all for you.");
    } else if (status == 2) {
        /* page 3 */
        cm.sendOk("I wish you a year of tranquil blue water and wide-open tides—work that satisfies you, adventures that surprise you, and quiet evenings where we simply float together, admiring the patterns we’re still making. May you feel, every day, as cherished as a masterpiece carved grain by grain on the seafloor.\r\n\r\nHappy Birthday, my perfect drift.\r\n\r\nAlways yours,\r\nAvihoo <3");
        cm.dispose();
    }
}
