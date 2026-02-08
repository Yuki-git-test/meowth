import { EmbedBuilder } from 'discord.js';
import { Auction } from '../class/auction.js';
import { config } from "../config.js";
import { getEmbedColor, getPokemonGif } from '../utility/pokemon.js';
import path from 'node:path';

/**
 * Start an auction in the current channel
 * @param {*} auctions 
 * @param {*} options 
 * @param {*} user 
 * @param {*} channel 
 * @param {*} bulkPokemon 
 * @param {*} interaction 
 * @returns 
 */
export async function auctionStart(auctions, options, user, channel, bulkPokemon, interaction, broadcasts) {
    if (auctions.has(channel.id)) {
        return interaction.reply({ content: "⚠ An auction is already ongoing!", ephemeral: true }).catch(console.error);
    }

    // get pokemon info
    let pokemon = options.getString("pokemon").toLowerCase();
    const rarity = options.getString("rarity").toLowerCase();
    const { url: gifUrl, isLocal } = await getPokemonGif(pokemon, rarity);
    const autobuyInput = options.getString("autobuy");
    const autobuy = autobuyInput ? Auction.prototype.parseBidAmount(autobuyInput) : -1;
    const duration = options.getInteger("duration") || 30;

    // check duration & auctioneer
    const isAuctioneer = interaction.member.roles.cache.has(config.auction.auctioneerRoleId);
    if (duration < 10 && !isAuctioneer) {
        return interaction.reply({ content: "⚠ You can't create an auction below 10 minutes!", ephemeral: true }).catch(console.error);
    }

    // set pokemon bulk list
    if (rarity === 'bulk') {
        const pokemonList = pokemon.split(",").map(p => p.trim());
        bulkPokemon.set(channel.id, pokemonList);
        pokemon = "bulk";
    }
    
    // put auction to cache
    const auction = new Auction(user, channel, duration, autobuy, {pokemons: [pokemon]}, {bidder: null, bid: 0}, rarity, auctions, gifUrl, bulkPokemon, isLocal, interaction, broadcasts);
    auctions.set(channel.id, auction);

    // put auction on broadcast
    if (config.broadcast.enabled) {
        // build embed
        const embedBroadcast = new EmbedBuilder()
            .setTitle(`Ongoing auction in <#${channel.id}>`)
            .addFields(
                { name: "Pokémon", value: pokemon, inline: true },
                { name: "Rarity", value: config.auction.rarityEmoji[rarity] || rarity, inline: true },
                { name: "Autobuy", value: autobuy !== -1 ? auction.formatNumber(autobuy) : "N/A", inline: true },
            )
            .setColor(getEmbedColor(rarity))
            .setTimestamp();
    
        // set pokemon image
        let broadcastMessage;
        if (isLocal) {
            embedBroadcast.setImage(`attachment://${path.basename(gifUrl)}`);
            broadcastMessage = await interaction.guild.channels.cache.get(config.broadcast.channel).send({
                embeds: [embed],
                files: [{ attachment: gifUrl, name: path.basename(gifUrl) }] // Gửi tệp đúng cách
            }).catch(console.error);
        } else {
            embedBroadcast.setImage(gifUrl);
            broadcastMessage = await interaction.guild.channels.cache.get(config.broadcast.channel).send({ embeds: [embedBroadcast] }).catch(console.error);
        }
    
        // cache broadcast message id
        broadcasts.set(channel.id, broadcastMessage.id);
    }

    // auction start embed
    const embed = new EmbedBuilder()
        .setTitle("🎉 Auction Started! 🎉")
        .setDescription(`Auction hosted by ${user.username}`)
        .addFields(
            { name: "Pokémon", value: pokemon, inline: true },
            { name: "Rarity", value: config.auction.rarityEmoji[rarity] || rarity, inline: true },
            { name: "Highest Bidder", value: auction.dataBid.bidder ? `<@${auction.dataBid.bidder.id}>` : "No bids", inline: true },
            { name: "Autobuy", value: autobuy !== -1 ? auction.formatNumber(autobuy) : "N/A", inline: true },
            { name: "Current Bid", value: "0", inline: true },
            { name: "Time Remaining", value: auction.getDynamicTimeRemaining(), inline: true }
        )
        .setFooter({ text: `Pokemon accepted: ${auction.accept === null ? '❌' : '✔️'}` })
        .setColor(getEmbedColor(rarity))
        .setTimestamp();

    // set pokemon image
    if (isLocal) {
        embed.setImage(`attachment://${path.basename(gifUrl)}`);

        await interaction.reply({
            embeds: [embed],
            files: [{ attachment: gifUrl, name: path.basename(gifUrl) }] // Gửi tệp đúng cách
        }).catch(console.error);
    } else {
        embed.setImage(gifUrl);
        await interaction.reply({ embeds: [embed] }).catch(console.error);
    }

    // ping auctioneer
    await channel.send(`<@&${config.auction.auctioneerRoleId}> An auction has started! Please wait for a staff member to ping auction roles`).catch(console.error);
    console.log('AUCTION', '|', `new auction started: ${pokemon} in #${interaction.channel.name}`);
}