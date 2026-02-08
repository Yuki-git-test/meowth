import { EmbedBuilder } from "discord.js";
import { getEmbedColor, getPokemonGif } from "../utility/pokemon.js";
import { config } from "../config.js";
import { deleteBroadcastMessage } from "../utility/broadcast.js";

/**
 * Bid on auction
 * @param {*} auctions 
 * @param {*} options 
 * @param {*} user 
 * @param {*} channel 
 * @param {*} interaction 
 * @returns 
 */
export async function auctionBid(auctions, options, user, channel, interaction, broadcasts) {
    // get auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // check if first bid
    const oldBidder = auction.dataBid.bidder;

    // parse bid amount 
    const bidAmount = options.getString("amount");

    // place bid
    const response = auction.placeBid(user, bidAmount);

    // bid unsuccessful
    if (typeof response === "string") {
        return interaction.reply({ content: response, ephemeral: true }).catch(console.error);
    }

    // bid successful
    if (response === false) {
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
    
            // response
            const response = {
                embeds: [embed],
                files: [{ attachment: gifUrl, name: path.basename(gifUrl) }]
            };
    
            // outbid message
            if (oldBidder != null) response.content = `You have been outbid <@${oldBidder.id}>!`;
    
            await interaction.reply(response).catch(console.error);
        } else {
            embed.setImage(gifUrl);
    
            // response
            const response = { embeds: [embed] };
    
            // outbid message
            if (oldBidder != null) response.content = `You have been outbid <@${oldBidder.id}>!`;
    
            await interaction.reply(response).catch(console.error);
        }
    } else if (response === true) {
        // autobuy
        console.log('AUCTION', '|', `autobuy triggered in #${channel.name}`);

        // set inactive
        auction.active = false;
        auction.timer.stop();

        // send embed
        const embed = new EmbedBuilder()
            .setTitle("🎉 Auction Ended!")
            .setDescription(`Auction hosted by ${auction.host.username}`)
            .addFields(
                { name: "Pokémon", value: auction.dataAuction.pokemons[0], inline: true },
                { name: "Rarity", value: config.auction.rarityEmoji[auction.rarity.toLowerCase()] || auction.rarity, inline: true },
                { name: "Highest Bidder", value: auction.dataBid.bidder ? `<@${auction.dataBid.bidder.id}>` : "No bids", inline: true },
                { name: "Current Bid", value: auction.formatNumber(auction.dataBid.bid), inline: true },
                { name: "Autobuy", value: auction.autobuy !== -1 ? auction.formatNumber(auction.autobuy) : "N/A", inline: true },
                { name: "Time Remaining", value: auction.getDynamicTimeRemaining(), inline: true }
            )
            .setFooter({ text: `Pokemon accepted: ${auction.accept === null ? '❌' : '✔️'}` })
            .setColor(getEmbedColor(auction.rarity))
            .setTimestamp();

        // get image
        if (auction.isLocal) {
            embed.setImage(`attachment://${path.basename(auction.gifUrl)}`);
            response.files = [auction.gifUrl]; // Đính kèm file
        } else {
            embed.setImage(auction.gifUrl);
        }

        auction.channel.send({ embeds: [embed] });

        // delete from active auctions
        auction.auctions.delete(auction.channel.id);

        // Send notification to the same channel
        auction.channel.send(`Auction ended!!! <@${auction.dataBid.bidder.id}> pls ping <@${auction.host.id}> in <#${config.tradeChannels.first}> to <#${config.tradeChannels.last}> to claim`).catch(console.error);

        // delete broadcast message
        deleteBroadcastMessage(interaction, config.broadcast.channel, broadcasts.get(channel.id));
    }
}