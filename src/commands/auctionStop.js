import { config } from "../config.js";
import { deleteBroadcastMessage } from "../utility/broadcast.js";

/**
 * Stop current auction in the channel
 * @param {*} auctions 
 * @param {*} channel 
 * @param {*} bulkPokemon 
 * @param {*} interaction 
 * @returns 
 */
export async function auctionStop(auctions, channel, bulkPokemon, interaction, broadcasts) {
    if (!auctions.has(channel.id)) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // check if is auctioneer
    const hasRequiredRole = interaction.member.roles.cache.has(config.auction.auctioneerRoleId);
    if (!hasRequiredRole) {
        return interaction.reply({ content: "⚠ You need the required role to stop the auction!", ephemeral: true }).catch(console.error);
    }

    // stop timer
    const auction = auctions.get(channel.id);
    auction.timer.stop();

    // delete broadcast message
    deleteBroadcastMessage(interaction, config.broadcast.channel, broadcasts.get(channel.id));
    console.log('AUCTION', '|', `auction stopped in #${interaction.channel.name}`);

    // set auction inactive
    auction.active = false;
    
    auctions.delete(channel.id);
    bulkPokemon.delete(channel.id);
    
    await interaction.reply("Auction stopped!").catch(console.error);
}