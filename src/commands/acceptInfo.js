import { blockQuote } from "discord.js";

/**
 * Get accepted pokemon list
 * @param {*} interaction 
 * @param {*} auctions 
 * @param {*} channel 
 * @returns 
 */
export async function acceptInfo(interaction, auctions, channel) {
    // get auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // show accepted pokemon list
    if (auction.accept !== null)
        await interaction.reply({ content: `**Accepted pokemons:** \n${blockQuote(auction.accept)}`, ephemeral: true }).catch(console.error);
    else 
        await interaction.reply({ content: 'This auction does not accept pokemons!', ephemeral: true });
}