package client.command.commands.gm0;

import client.Client;
import client.command.Command;
import client.keybind.KeyBinding;

import java.util.Map;

import client.Character;

public class SetKeyCommand extends Command{
    {
        setDescription("Set skill in keymap, usage for previous jobs");
    }

    @Override
    public void execute(Client client, String[] params) {
        // params[0] = key - string representation of key in the keyboard
        // params[1] = skill - number

        Character player = client.getPlayer();
        player.changeKeybinding(20, new KeyBinding(1, 4101004));

        // send yellow message to user that Haste assign to 't' key
        player.yellowMessage("Haste assign to 't' key");

        //ret.keymap.put(20, new KeyBinding(1, 4101004));
    }
    
}
