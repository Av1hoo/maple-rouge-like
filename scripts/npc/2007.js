function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || (status == 0 && mode == 0)) {
        cm.sendNext("Enjoy TaliStroy! Come back if you need help.");
        cm.dispose();
        return;
    }
    if (mode == 1) status++; else status--;

    if (status == 0) {
        cm.sendNext("#bWelcome to TaliStroy, Mamtak! <3#k  \r\n" +
            "This private game is built just for you! A world of:\r\n" +
            "* #bRiddles#k: Solve puzzles for rewards\r\n" +
            "* #bHunting#k: Battle epic monsters\r\n" +
            "* #bCrafting#k: Create unique items\r\n" +
            "* #bPets#k: Raise loyal companions\r\n" +
            "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t#bReady for more?#k");
    } else if (status == 1) {
        cm.sendNext("#bBasic Mechanics:#k\r\n" +
            "* #bMove#k: Using the Arrow keys to move, #bAlt#k to jump\r\n" +
            "* #bAttack#k: Using #bCtrl#k for basic attack\r\n" +
            "* #bInteract#k: Using the mouse to interact\r\n" +
            "* #bInventory#k: Click I key to manage items & pets\r\n" +
            "* #bSkills#k: Click S and K keys for upgrading your skills\r\n" +
            "\t\t\t\t\t\t\t\t\t\t\t#bPress next to start your adventure#k");
    } else if (status == 2) {
        cm.sendYesNo("#bReady to dive into TaliStroy?#k\r\n" +
            "This world is yours to shape! Let's make it an unforgettable adventure. ");
        }
}

