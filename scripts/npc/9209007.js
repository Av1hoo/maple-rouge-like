/*
 * NPC : Lazy Daisy
 * ID  : 9209007
 * Love-Letter quest: collect 5 fragments → 4001131
 * If player already holds the letter, Daisy reads it.
 */

var status    = 0;
var pieces    = [4001367, 4001368, 4001369, 4001370, 4001371];
var LETTER_ID = 4001131;


/*── letter text (3 pages) ─────────────────────────────*/
var letterPages = [
"#eMy Mumtak,#n\r\n\r\n"
+ "On certain nights off the coast of Japan, a small #d#epufferfish#n#k spends day after day in quiet devotion, "
+ "beating his fins into the sand until a perfect #bmandala#k appears - delicate ridges, concentric rings, every grain set by patient intention. "
+ "He does it so that when his chosen mate drifts above, she'll know the ocean floor was shaped expressly for her.",

"Today, on your birthday, #ei feel like that pufferfish.#n\r\n\r\n"
+ "My sand is this #bgame#k. Every rock and curve is one of our jokes or adventures; "
+ "I arranged hours and heartbeats the very same way, hoping you’ll see the design and know it’s all for you.",

"I wish you a year of tranquil blue water and wide-open tides - work that satisfies you, adventures that surprise you, "
+ "and quiet evenings where we simply float together, admiring the patterns we're still making. "
+ "May you feel, every day, as cherished as a masterpiece carved grain by grain on the seafloor.\r\n\r\n"
+ "#eHappy Birthday, my perfect drift.#n\r\n\r\n"
+ "#g#e– A<3#k"
];

/*──────────────────────────────────────────────────────*/
function start() { status = -1; action(1,0,0); }

function action(mode, type, sel) {
    if (mode == -1)               { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 1) status++; else status--;

    /*── player already owns complete letter ──*/
    if (status == 0 && cm.haveItem(LETTER_ID, 1)) {
        cm.sendNext(letterPages[0]);
        status = 100;                              // jump into reader sequence
        return;
    }

    /*── player does not have letter: check fragments ──*/
    if (status == 0) {
        var missing = [], haveAny = false;
        for (var i = 0; i < pieces.length; i++) {
            if (cm.haveItem(pieces[i], 1)) haveAny = true;
            else missing.push("#z" + pieces[i] + "#");
        }

        /* Intro text: player holds NONE of the pieces */
        if (!haveAny) {
            cm.sendOk(
                "This love letter was #rtorn into five fragments#k and scattered across the land.\r\n\r\n"
              + "Find and bring me:\r\n"
              + "#v4001367#  #v4001368#  #v4001369#  #v4001370#  #v4001371#\r\n\r\n"
              + "When all five are reunited, I can piece the letter together for you."
            );
            cm.dispose();
            return;
        }

        /* Has some or all pieces */
        if (missing.length > 0) {
            cm.sendOk("You still need to collect:\r\n" + missing.join(", "));
            cm.dispose();
            return;
        }

        /* Has all five – assemble letter */
        if (!cm.canHold(LETTER_ID, 1)) {
            cm.sendOk("Please make space in your ETC inventory first.");
            cm.dispose();
            return;
        }
        for (var j = 0; j < pieces.length; j++) cm.gainItem(pieces[j], -1);
        cm.gainItem(LETTER_ID, 1);

        cm.sendNext("All set! Here's the completed #v" + LETTER_ID + "#.\r\nReady to hear it?");
        status = 99;                               // flow into reader
        return;
    }

    /*── letter-reading sequence ──*/
    if (status == 99) {        // after assembly, start page-1
        cm.sendNext(letterPages[0]);
        status = 100;
    } else if (status == 100) { // page-2
        cm.sendNextPrev(letterPages[1]);
    } else if (status == 101) { // page-3 & finish
        cm.sendOk(letterPages[2]);
        cm.dispose();
    }
}
