import { config } from "../config.js";

/**
 * Clear accepted list of auction
 * @param {*} interaction 
 * @param {*} auctions 
 * @param {*} channel 
 * @returns 
 */
export async function acceptClear(interaction, auctions, channel) {
    // get auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // limit to auctioneer use only
    const isAuctioneer = interaction.member.roles.cache.has(config.auction.auctioneerRoleId);
    if (isAuctioneer) {
        // clear accepted list
        auction.accept = null;
        console.log('ACCEPT ', '|', `accepted list cleared in #${channel.name}`);
        await interaction.reply('Accepted list cleared!').catch(console.error);
    } else {
        await interaction.reply({ content: "⚠ You don't have sufficient permission to use this command! Ping an auctioneer!", ephemeral: true }).catch(console.error);
    }
}