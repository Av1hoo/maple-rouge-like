package client.command.commands.gm0;

import client.Client;
import client.SkillFactory;
import client.command.Command;
import client.keybind.KeyBinding;
import tools.PacketCreator;

import java.util.Map;
import client.Character;


public class SetKeyCommand extends Command{
    public static Map<String, Integer> keyboardMapString = Map.ofEntries(
        Map.entry("`", 41), Map.entry("1", 2), Map.entry("2", 3), Map.entry("3", 4), Map.entry("4", 5),
        Map.entry("5", 6), Map.entry("6", 7), Map.entry("7", 8), Map.entry("8", 9), Map.entry("9", 10),
        Map.entry("0", 11), Map.entry("-", 12), Map.entry("=", 13), Map.entry("q", 16), Map.entry("w", 17),
        Map.entry("e", 18), Map.entry("r", 19), Map.entry("t", 20), Map.entry("y", 21), Map.entry("u", 22),
        Map.entry("i", 23), Map.entry("o", 24), Map.entry("p", 25), Map.entry("[", 26), Map.entry("]", 27),
        Map.entry("a", 30), Map.entry("s", 31), Map.entry("d", 32), Map.entry("f", 33),
        Map.entry("g", 34), Map.entry("h", 35), Map.entry("j", 36), Map.entry("k", 37), Map.entry("l", 38),
        Map.entry(";", 39), Map.entry("'", 40), Map.entry("shift", 42), Map.entry("z", 44), Map.entry("x", 45),
        Map.entry("c", 46), Map.entry("v", 47), Map.entry("b", 48), Map.entry("n", 49), Map.entry("m", 50),
        Map.entry(",", 51), Map.entry(".", 52), Map.entry("\\", 43), Map.entry("ctrl", 29), Map.entry("alt", 56),
        Map.entry("space", 57), Map.entry("f1", 59), Map.entry("f2", 60), Map.entry("f3", 61), Map.entry("f4", 62),
        Map.entry("f5", 63), Map.entry("f6", 64), Map.entry("f7", 65), Map.entry("f8", 66), Map.entry("f9", 67),
        Map.entry("f10", 68), Map.entry("f11", 87), Map.entry("f12", 88), Map.entry("ins", 82), Map.entry("home", 71),
        Map.entry("pup", 73), Map.entry("del", 83), Map.entry("end", 79), Map.entry("pdn", 81)
    );

    public static Map<Integer, String> keyboardMapInt = Map.ofEntries(
        Map.entry(41, "`"), Map.entry(2, "1"), Map.entry(3, "2"), Map.entry(4, "3"), Map.entry(5, "4"),
        Map.entry(6, "5"), Map.entry(7, "6"), Map.entry(8, "7"), Map.entry(9, "8"), Map.entry(10, "9"),
        Map.entry(11, "0"), Map.entry(12, "-"), Map.entry(13, "="), Map.entry(16, "q"), Map.entry(17, "w"),
        Map.entry(18, "e"), Map.entry(19, "r"), Map.entry(20, "t"), Map.entry(21, "y"), Map.entry(22, "u"),
        Map.entry(23, "i"), Map.entry(24, "o"), Map.entry(25, "p"), Map.entry(26, "["), Map.entry(27, "]"),
        Map.entry(30, "a"), Map.entry(31, "s"), Map.entry(32, "d"), Map.entry(33, "f"), Map.entry(34, "g"),
        Map.entry(35, "h"), Map.entry(36, "j"), Map.entry(37, "k"), Map.entry(38, "l"), Map.entry(39, ";"),
        Map.entry(40, "'"), Map.entry(42, "shift"), Map.entry(44, "z"), Map.entry(45, "x"), Map.entry(46, "c"),
        Map.entry(47, "v"), Map.entry(48, "b"), Map.entry(49, "n"), Map.entry(50, "m"), Map.entry(51, ","),
        Map.entry(52, "."), Map.entry(43, "\\"), Map.entry(29, "ctrl"), Map.entry(56, "alt"), Map.entry(57, "space"),
        Map.entry(59, "f1"), Map.entry(60, "f2"), Map.entry(61, "f3"), Map.entry(62, "f4"), Map.entry(63, "f5"),
        Map.entry(64, "f6"), Map.entry(65, "f7"), Map.entry(66, "f8"), Map.entry(67, "f9"), Map.entry(68, "f10"),
        Map.entry(87, "f11"), Map.entry(88, "f12"), Map.entry(82, "ins"), Map.entry(71, "home"), Map.entry(73, "pup"),
        Map.entry(83, "del"), Map.entry(79, "end"), Map.entry(81, "pdn")
    );


    {
        setDescription("Set skill in keymap, usage for previous jobs");
    }

    @Override
    public void execute(Client client, String[] params) {
        Character player = client.getPlayer();
        if (params.length < 2) {
            player.yellowMessage("Syntax: @setkey <key> <skillid>");
            return;
        }
        player.changeKeybinding(keyboardMapString.get(params[0]), new KeyBinding(1, Integer.parseInt(params[1])));
        player.yellowMessage("Skill " + SkillFactory.getSkillName(Integer.parseInt(params[1])) + " assigned to " + params[0] + " key");
        client.sendPacket(PacketCreator.getKeymap(player.getKeymap()));
    }
}

// Key: 2 1 Type: 4 Action: 10 // to all
// Key: 3 2 Type: 4 Action: 12 // to aprty
// Key: 4 3 Type: 4 Action: 13 // to friend
// Key: 5 4 Type: 4 Action: 18 // to guild
// Key: 6 5 Type: 4 Action: 24 // to alliance
// Key: 7 6 Type: 4 Action: 21 // to spouse
// Key: 16 q Type: 4 Action: 8 // quest
// Key: 17 w Type: 4 Action: 5 // world
// Key: 18 e Type: 4 Action: 0 // equip
// Key: 19 r Type: 4 Action: 4 // buddy
// Key: 23 i Type: 4 Action: 1 // item
// Key: 24 o Type: 4 Action: 25 // party search
// Key: 25 p Type: 4 Action: 19 // party
// Key: 26 [ Type: 4 Action: 14 // short cut
// Key: 27 ] Type: 4 Action: 15 // quick slot
// Key: 29 ctrl Type: 5 Action: 52 // attack
// Key: 31 s Type: 4 Action: 2 // ability
// Key: 33 f Type: 4 Action: 26 // family
// Key: 34 g Type: 4 Action: 17 // guild
// Key: 35 h Type: 4 Action: 11 // whisper
// Key: 37 k Type: 4 Action: 3 // skill
// Key: 38 l Type: 4 Action: 20 // helper
// Key: 39 ; Type: 4 Action: 27 // medal
// Key: 40 ' Type: 4 Action: 16 // chat+
// Key: 41 ` Type: 4 Action: 23 // cashshop
// Key: 43 \ Type: 4 Action: 9 // set key
// Key: 44 z Type: 5 Action: 50 // pick up
// Key: 45 x Type: 5 Action: 51 // sit
// Key: 46 c Type: 4 Action: 6 // messenger
// Key: 48 b Type: 4 Action: 22 // monser book
// Key: 50 m Type: 4 Action: 7 // mini map
// Key: 56 alt Type: 5 Action: 53 // jump
// Key: 57 space Type: 5 Action: 54 // npc chat
// Key: 59 f1 Type: 6 Action: 100 // face1
// Key: 60 f2 Type: 6 Action: 101 // face2
// Key: 61 f3 Type: 6 Action: 102 // face3
// Key: 62 f4 Type: 6 Action: 103 // face4
// Key: 63 f5 Type: 6 Action: 104 // face5
// Key: 64 f6 Type: 6 Action: 105 // face6
// Key: 65 f7 Type: 6 Action: 106 // face7
// Key: 20 t Type: 1 Action: 4101004 // skill haste
// Key: 42 shift Type: 1 Action: 14101004 // skill flash jump
// Key: 71 home Type: 1 Action: 14101002 // skill claw booster
// Key: 79 end Type: 1 Action: 14101003 // skill haste - night walker
// Key: 88 f12 Type: 1 Action: 14101006  // skill vampire
// type 1 -> skill
// type 4 -> user interface, open menus, chat
// type 5 -> action (attack, jump, pick up)
// type 6 -> emotion
// type 7 -> item
// NEED TO CHECK
// type 2 -> pet command?
// type 3 -> mount command?
// type 8 -> cash item?
// type 9 -> quest item?
// type 10 -> skill macro?