package client.command.commands.gm0;

public class HomeCommand extends client.command.Command {
    {
        setDescription("Return to your home.");
    }

    @Override
    public void execute(client.Client c, String[] params) {
        client.Character player = c.getPlayer();
        player.saveLocationOnWarp();
        // 300000010
        player.changeMap(300000010);
    }
    
}
