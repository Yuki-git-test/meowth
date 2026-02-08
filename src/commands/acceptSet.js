import { ActionRowBuilder, blockQuote, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { config } from "../config.js";

/**
 * Send accepted list set modal
 * @param {*} interaction 
 */
export async function acceptSetModal(interaction) {
    // create input modal
    const modal = new ModalBuilder()
        .setCustomId('acceptSetModal')
        .setTitle('Set Accepted Pokemons');

    // add input fields
    const acceptSetInput = new TextInputBuilder()
        .setCustomId('acceptSetInput')
        .setLabel('Insert list of accepted pokemon - value')
        .setStyle(TextInputStyle.Paragraph);

    const actionRow1 = new ActionRowBuilder().addComponents(acceptSetInput);
    modal.addComponents(actionRow1);

    // show modal
    await interaction.showModal(modal);
}

/**
 * Set accepted pokemon list
 * @param {*} interaction 
 * @param {*} auctions 
 * @param {*} channel 
 * @param {*} user 
 * @returns 
 */
export async function acceptSet(interaction, auctions, channel, user) {
    // get accepted pokemons list
    const acceptList = interaction.fields.getTextInputValue('acceptSetInput');

    // get auction
    const auction = auctions.get(channel.id);
    if (!auction) {
        return interaction.reply({ content: "⚠ No auction is ongoing!", ephemeral: true }).catch(console.error);
    }

    // user must be host
    if (user.id !== auction.host.id) {
        return await interaction.reply('⚠ This is not your auction!');
    }
    // only allow host to set accepted list once,
    // except for auctioneers
    const isAuctioneer = interaction.member.roles.cache.has(config.auction.auctioneerRoleId);
    if (
        !isAuctioneer
        && auction.accept !== null
    ) {
        return await interaction.reply('⚠ You are forbidden from setting accepted list! (insufficient roles & already set once)');
    }

    // set auction accept
    auction.accept = acceptList;
    console.log('ACCEPT ', '|', `accepted list set in #${channel.name}`);

    // reply
    await interaction.reply(`Set accepted pokemon list to: \n${blockQuote(acceptList)}`);
}