import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { AuctionRollbackQueue } from "../class/queue.js";
import { getEmbedColor } from "../utility/pokemon.js";
import { CountdownTimer } from "./timer.js";
import { deleteBroadcastMessage } from '../utility/broadcast.js';

/**
 * Pokemeow auction class
 */
export class Auction {
    active = true;
    idAuction = 'N/A';
    host = null;
    channel = null;
    /**
     * Duration in minutes
     */
    duration = 30;
    /**
     * Auction end time
     */
    endTime = Date.now();
    /**
     * The autobuy threshold of this auction
     * - `-1` means no autobuy set
     */
    autobuy = -1;
    rarity;

    /**
     * Data regarding current auction
     * - dataAuction.pokemons: pokemons included
     */
    dataAuction = {
        pokemons: [],
    };

    /**
     * Data regarding current bidder
     * - dataBid.bidder: current highest bidder
     * - dataBid.bid: highest bid in Pokecoins
     */
    dataBid = {
        bidder: null,
        bid: 0,
    }
    /**
     * Bid history for rollback
     */
    bidHistory = new AuctionRollbackQueue(config.auction.rollbackLimit);

    /**
     * 
     */
    accept = null;
    
    /**
     * Constructor
     * @param {*} host 
     * @param {*} channel 
     * @param {*} duration 
     * @param {*} autobuy 
     * @param {*} dataAuction 
     * @param {*} dataBid 
     * @param {*} rarity 
     * @param {*} auctions 
     * @param {*} gifUrl 
     */
    constructor (host, channel, duration, autobuy, dataAuction, dataBid, rarity, auctions, gifUrl, bulkPokemon, isLocal, interaction, broadcasts) {
        // this.idAuction = 'N/A';
        this.active = true;
        this.host = host;
        this.channel = channel;
        this.durationMinutes = duration;
        this.endTime = Date.now() + this.durationMinutes * 60 * 1000;
        this.autobuy = autobuy;
        this.dataAuction = dataAuction;
        this.dataBid = dataBid;
        this.rarity = rarity;

        this.auctions = auctions; // Giữ tham chiếu đến danh sách đấu giá
        this.gifUrl = gifUrl; // Thêm dòng này

        // setup timer
        this.timer = new CountdownTimer(duration * 60 + 1, {
            // last call ping
            600: async () => {
                if (this.durationMinutes > 20) { // Chỉ ping nếu thời lượng đấu giá > 20 phút
                    console.log('AUCTION', '|', `last call auction in #${channel.id}!`);
                    await channel.send(`<@&${config.ping.lastCall}> Auction is ending in 10 minutes!`).catch(console.error);}
            },
            // auction end
            0: async () => {
                console.log('AUCTION', '|', `auction ended in #${channel.id}!`);
                auctions.delete(channel.id);
                bulkPokemon.delete(channel.id);
                this.endAuction();
    
                // auction end embed
                const endEmbed = new EmbedBuilder()
                    .setTitle("🎉 Auction Ended!")
                    .setDescription(`Auction hosted by ${host.username}`)
                    .addFields(
                        { name: "Pokémon", value: this.dataAuction.pokemons[0], inline: true },
                        { name: "Rarity", value: config.auction.rarityEmoji[this.rarity] || this.rarity, inline: true },
                        { name: "Winner", value: this.dataBid.bidder ? `<@${this.dataBid.bidder.id}>` : "No bids", inline: true },
                        { name: "Final Bid", value: this.formatNumber(this.dataBid.bid), inline: true },
                        { name: "Autobuy", value: this.autobuy !== -1 ? this.formatNumber(this.autobuy) : "N/A", inline: true }
                    )
                    .setFooter({ text: `Pokemon accepted: ${this.accept === null ? '❌' : '✔️'}` })
                    .setImage(this.gifUrl)
                    .setColor(getEmbedColor(this.rarity))
                    .setTimestamp();
    
                // add pokemon gif & send
                if (isLocal) {
                    endEmbed.setImage(`attachment://${path.basename(gifUrl)}`);
                    await channel.send({
                        embeds: [endEmbed],
                        files: [{ attachment: gifUrl, name: path.basename(gifUrl) }]
                    }).catch(console.error);
                } else {
                    endEmbed.setImage(gifUrl);
                    await channel.send({ embeds: [endEmbed] }).catch(console.error);
                }
    
                // send end notification
                if (this.dataBid.bidder) {
                    this.channel.send(`Auction ended!!! <@${this.dataBid.bidder.id}> pls ping <@${this.host.id}> in <#${config.tradeChannels.first}> to <#${config.tradeChannels.last}> to claim`).catch(console.error);
                } else {
                    this.channel.send('Auction ended!!!').catch(console.error);
                }
    
                // delete broadcast message
                deleteBroadcastMessage(interaction, config.broadcast.channel, broadcasts.get(channel.id));
            },
        });

        // start timer
        this.timer.start();
    }

    /**
     * Extend the auction's duration if x minutes left
     */
    updateEndTime() {
        // check timer
        if (this.timer === null) {
            console.log('TIMER  ', '|', `no timer found for auction in ${this.channel.name}!`);
        }
        
        // extend duration
        if (
            this.durationMinutes >= 20 
            && this.timer.getRemainingTime() < config.auction.lastCallDurationExtend.minimumDurationLeft * 60
        ) {
            console.log('AUCTION', '|', `auction extended in ${this.channel.name}!`);
            this.timer.addTime(60 * config.auction.lastCallDurationExtend.extendDuration);
        }
    }

    /**
     * Place bid
     * @param {*} user 
     * @param {*} amount 
     * @returns 
     */
    placeBid(user, amount) {
        // auction ended
        if (!this.active) {
            return "⚠ The auction has ended!";
        }
        // own auction bid
        if (user.id === this.host.id) {
            return "⚠ You cannot bid on your own auction!";
        }
        // re-bid
        if (this.dataBid?.bidder?.id && user.id === this.dataBid.bidder.id) {
            return "⚠ You cannot bid twice in a row!";
        }
        // invalid bid amount
        const bidAmount = this.parseBidAmount(amount);
        if (isNaN(bidAmount) || bidAmount <= 0) {
            return "⚠ Invalid bid amount!";
        }
        // new bid not higher than old bid
        if (bidAmount <= this.dataBid.bid) {
            return `⚠ Your bid must be higher than the current bid of ${this.formatNumber(this.dataBid.bid)}!`;
        }
        // bid interval
        const minimumBidIncrement = config.auction.bidIncrement[this.rarity.toLowerCase()];
        if (bidAmount < this.dataBid.bid + minimumBidIncrement) {
            return `⚠ Your bid must be at least ${this.formatNumber(minimumBidIncrement)} higher than the current bid!`;
        }

        // register new bid
        this.dataBid.bid = bidAmount;
        this.dataBid.bidder = user;

        // push to rollback history
        this.bidHistory.push(user, bidAmount);

        // extend duration
        this.updateEndTime();
        console.log('AUCTION', '|', `bid placed in #${this.channel.name}: ${amount}`);

        // trigger autobuy
        if (
            this.autobuy > -1 && this.dataBid.bid >= this.autobuy
        ) return true;
        else return false;
    }

    /**
     * Rollback current bid to the previous one
     * @returns 
     */
    rollback() {
        const result = this.bidHistory.rollback();

        // unable to rollback
        if (result === null) {
            return false;
        } else {
            this.dataBid.bid = result.bid;
            this.dataBid.bidder = result.bidder;
            return true;
        }
    }

    /**
     * Parse bid amount
     * @param {*} amount 
     * @returns 
     */
    parseBidAmount(amount) {
        if (typeof amount === 'number') {
            return amount;
        }
        if (typeof amount === 'string') {
            if (amount.toLowerCase().endsWith('k')) {
                return parseFloat(amount) * 1000;
            } else if (amount.toLowerCase().endsWith('m')) {
                return parseFloat(amount) * 1000000;
            }
        }
        return parseFloat(amount);
    }

    /**
     * End this auction immediately
     * @returns 
     */
    endAuction() {
        this.active = false;
        return { winner: this.currentBidder, host: this.host };
    }

    /**
     * Check if auction is expired
     * @returns 
     */
    isExpired() {
        return Date.now() > this.endTime;
    }

    /**
     * Format bid number with K or M for big numbers
     * @param {*} number 
     * @returns 
     */
    formatNumber(number) {
        let formatter = Intl.NumberFormat('en', { notation: 'compact' });
        return formatter.format(number);
    }

    /**
     * Get special timestamp in Discord
     * @returns 
     */
    getDynamicTimeRemaining() {
        const timestamp = Math.floor(this.endTime / 1000);
        return `<t:${timestamp}:R>`;
    }
} 