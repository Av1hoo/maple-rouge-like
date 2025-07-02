package client.command.commands.gm0;

import client.Client;
import client.command.Command;

public class QuestCommand2 extends Command {
    {
        setDescription("Bind a previously learned skill to your keyboard");
    }

    @Override
    public void execute(Client c, String[] params) {
        c.getAbstractPlayerInteraction().openNpc(9200000, "9200000");
    }
}