package client.command.commands.gm0;

import client.Client;
import client.command.Command;

public class QuestCommand extends Command {
    {
        setDescription("Bind a previously learned skill to your keyboard");
    }

    @Override
    public void execute(Client c, String[] params) {
        c.getAbstractPlayerInteraction().openNpc(2082008, "2082008");
    }
}