import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { acceptClear } from './commands/acceptClear.js';
import { acceptInfo } from './commands/acceptInfo.js';
import { acceptSet, acceptSetModal } from './commands/acceptSet.js';
import { auctionBid } from './commands/auctionBid.js';
import { auctionInfo } from './commands/auctionInfo.js';
import { auctionRollback } from './commands/auctionRollback.js';
import { auctionStart } from './commands/auctionStart.js';
import { auctionStop } from './commands/auctionStop.js';
import { bulkInfo } from './commands/bulkInfo.js';
import { bulkSet } from './commands/bulkSet.js';
dotenv.config();

/**
 * Auction caches
 */
const auctions = new Map();
const bulkPokemon = new Map();
const broadcasts = new Map();

/**
 * Client
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/**
 * On Ready
 */
client.on(Events.ClientReady, readyClient => {
  console.log('INFO   ', '|', `logged in as ${readyClient.user.tag}!`);
});

/**
 * On Interaction
 */
client.on(Events.InteractionCreate, async interaction => {
  if (
    // application commands (/)
    interaction.isCommand()
  ) {
    // get essential info
    const { commandName, options, user, channel } = interaction;
    const subcommandName = options.getSubcommand();

    // command handling
    switch (commandName) {
      case 'auction':
        if (subcommandName === 'start') {
          auctionStart(auctions, options, user, channel, bulkPokemon, interaction, broadcasts);
        } else if (subcommandName === 'stop') {
          auctionStop(auctions, channel, bulkPokemon, interaction, broadcasts);
        } else if (subcommandName === 'info') {
          auctionInfo(auctions, channel, interaction);
        } else if (subcommandName === 'bid') {
          auctionBid(auctions, options, user, channel, interaction, broadcasts);
        } else if (subcommandName === 'rollback') {
          auctionRollback(interaction, auctions, channel);
        }
        break;

      case 'bulk':
        if (subcommandName === 'set') {
          bulkSet(bulkPokemon, options, channel, interaction);
        } else if (subcommandName === 'info') {
          bulkInfo(bulkPokemon, channel, interaction);
        }
        break;

      case 'accept':
        if (subcommandName === 'set') {
          acceptSetModal(interaction);
        } else if (subcommandName === 'info') {
          acceptInfo(interaction, auctions, channel);
        } else if (subcommandName === 'clear') {
          acceptClear(interaction, auctions, channel);
        }
        break;

      default:
        console.log('ERROR  ', '|', `command unknown: /${commandName}`);
        break;
    }
  } else if (
    // modal submit
    interaction.isModalSubmit()
  ) {
    // get essential info
    const { user, channel } = interaction;

    // accept set modal
    if (interaction.customId === 'acceptSetModal') {
      acceptSet(interaction, auctions, channel, user);
    }
  }
});

/**
 * Login with token
 */
client.login(process.env.DISCORD_TOKEN);