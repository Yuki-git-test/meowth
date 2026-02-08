import { config } from "../config.js";

/**
 * Rollback operation on an auction
 * @param {*} interaction 
 * @param {*} auctions 
 * @param {*} channel 
 * @returns 
 */
export async function auctionRollback(interaction, auctions, channel) {
    // get auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // limit to auctioneer use only
    const isAuctioneer = interaction.member.roles.cache.has(config.auction.auctioneerRoleId);
    if (isAuctioneer) {
        const result = auction.rollback();
        if (result) {
            await interaction.reply({ content: "Auction rollback success!" }).catch(console.error);
        } else {
            await interaction.reply({ content: "⚠ Unable to rollback! (limit reached)", ephemeral: true }).catch(console.error);
        }
    } else {
        await interaction.reply({ content: "⚠ You don't have sufficient permission to use this command! Ping an auctioneer!", ephemeral: true }).catch(console.error);
    }
}