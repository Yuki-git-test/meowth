import { EmbedBuilder } from "discord.js";
import { getEmbedColor, getPokemonGif } from "../utility/pokemon.js";
import { config } from "../config.js";
import path from 'node:path';

/**
 * Check active auction info
 * @param {*} auctions 
 * @param {*} channel 
 * @param {*} interaction 
 * @returns 
 */
export async function auctionInfo(auctions, channel, interaction) {
    // check ongoing auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // set info
    const pokemon = auction.dataAuction.pokemons[0];
    const rarity = auction.rarity;
    const autobuy = auction.autobuy;
    const currentBid = auction.dataBid.bid;

    // send info embed
    const { url: gifUrl, isLocal } = await getPokemonGif(pokemon, rarity);
    const embed = new EmbedBuilder()
        .setTitle("🔍 Auction Info")
        .addFields(
            { name: "Pokémon", value: pokemon, inline: true },
            { name: "Rarity", value: config.auction.rarityEmoji[rarity] || rarity, inline: true },
            { name: "Highest Bidder", value: auction.dataBid.bidder ? `<@${auction.dataBid.bidder.id}>` : "No bids", inline: true },
            { name: "Current Bid", value: currentBid.toString(), inline: true },
            { name: "Autobuy", value: autobuy > -1 ? auction.formatNumber(autobuy) : "N/A", inline: true },
            { name: "Time Remaining", value: auction.getDynamicTimeRemaining(), inline: true }
        )
        .setFooter({ text: `Pokemon accepted: ${auction.accept === null ? '❌' : '✔️'}` })
        .setColor(getEmbedColor(auction.rarity))
        .setTimestamp();

    // add image
    if (isLocal) {
        embed.setImage(`attachment://${path.basename(gifUrl)}`);
        await interaction.reply({
            embeds: [embed],
            files: [{ attachment: gifUrl, name: path.basename(gifUrl) }]
        }).catch(console.error);
    } else {
        embed.setImage(gifUrl);
        await interaction.reply({ embeds: [embed] }).catch(console.error);
    }
}