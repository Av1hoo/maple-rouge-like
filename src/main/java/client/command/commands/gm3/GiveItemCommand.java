
package client.command.commands.gm3;

import client.Character;
import client.Client;
import client.command.Command;
import client.inventory.Pet;
import client.inventory.manipulator.InventoryManipulator;
import config.YamlConfig;
import constants.inventory.ItemConstants;
import server.ItemInformationProvider;

import static java.util.concurrent.TimeUnit.DAYS;

public class GiveItemCommand extends Command {
    {
        setDescription("Give item to a player.");
    }

    @Override
    public void execute(Client client, String[] params) {
        Character player = client.getPlayer();
        if (params.length < 2) {
            player.yellowMessage("Syntax: !giveitem <playername> <itemid> <quantity>");
            return;
        }

        // Get the target player
        String targetName = params[0];
        Character target = client.getWorldServer().getPlayerStorage().getCharacterByName(targetName);
        if (target == null) {
            player.yellowMessage("Player '" + targetName + "' could not be found.");
            return;
        }

        // Parse item ID
        int itemId;
        try {
            itemId = Integer.parseInt(params[1]);
        } catch (NumberFormatException e) {
            player.yellowMessage("Invalid item ID: '" + params[1] + "'.");
            return;
        }

        // Validate item exists
        ItemInformationProvider ii = ItemInformationProvider.getInstance();
        if (ii.getName(itemId) == null) {
            player.yellowMessage("Item ID '" + itemId + "' does not exist.");
            return;
        }

        // Parse quantity (default to 1 if not provided)
        short quantity = 1;
        if (params.length >= 3) {
            try {
                quantity = Short.parseShort(params[2]);
            } catch (NumberFormatException e) {
                player.yellowMessage("Invalid quantity: '" + params[2] + "'.");
                return;
            }
        }

        // Check for cash item restriction
        if (YamlConfig.config.server.BLOCK_GENERATE_CASH_ITEM && ii.isCash(itemId)) {
            player.yellowMessage("You cannot give a cash item with this command.");
            return;
        }

        // Handle pet items
        if (ItemConstants.isPet(itemId)) {
            if (params.length >= 3) {
                quantity = 1; // Pets are limited to quantity 1
                long days;
                try {
                    days = Math.max(1, Integer.parseInt(params[2]));
                } catch (NumberFormatException e) {
                    player.yellowMessage("Invalid expiration days: '" + params[2] + "'.");
                    player.yellowMessage("Pet Syntax: !giveitem <playername> <itemid> <expiration>");
                    return;
                }
                long expiration = System.currentTimeMillis() + DAYS.toMillis(days);
                int petid = Pet.createPet(itemId);

                InventoryManipulator.addById(target.getClient(), itemId, quantity, player.getName(), petid, expiration);
                player.yellowMessage("Pet (ID: " + itemId + ") given to " + targetName + " with expiration in " + days + " days.");
                target.yellowMessage("You have received a pet (ID: " + itemId + ") from " + player.getName() + ".");
                return;
            } else {
                player.yellowMessage("Pet Syntax: !giveitem <playername> <itemid> <expiration>");
                return;
            }
        }

        // Set item flags for non-GM3+ users
        short flag = 0;
        if (player.gmLevel() < 3) {
            flag |= ItemConstants.ACCOUNT_SHARING;
            flag |= ItemConstants.UNTRADEABLE;
        }

        // Add the item to the target player's inventory
        InventoryManipulator.addById(target.getClient(), itemId, quantity, player.getName(), -1, flag, -1);
        player.yellowMessage("Item (ID: " + itemId + ", Qty: " + quantity + ") given to " + targetName + ".");
        target.yellowMessage("You have received an item (ID: " + itemId + ", Qty: " + quantity + ") from " + player.getName() + ".");
    }
}