import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from "./config.js";

const commands = [
  new SlashCommandBuilder()
    .setName("auction")
    .setDescription("Start a Pokémon auction")
    .addStringOption(option => 
        option.setName("pokemon").setDescription("Pokémon name").setRequired(true))
    .addStringOption((option) =>
        option.setName("rarity").setDescription("Pokémon rarity").setRequired(true).addChoices(
            { name: "Legendary", value: "legendary" },
            { name: "Shiny", value: "shiny" },
            { name: "Mega", value: "mega" },
            { name: "Shiny Mega", value: "shiny mega" },
            { name: "Form", value: "form" },
            { name: "Shiny Form", value: "shiny form" }, // Add shiny form here
            { name: "Golden", value: "golden" },
            { name: "Gmax", value: "gmax" },
            { name: "Shiny Gmax", value: "shiny gmax" },
            { name: "Bulk", value: "bulk" },
            { name: "Exclusive", value: "exclusive" },
            { name: "Golden Form", value: "golden form" }
        )
    )
    .addStringOption(option =>
        option.setName("autobuy").setDescription("Autobuy price (optional)").setRequired(false))
    .addIntegerOption(option =>
        option.setName("duration").setDescription("Auction duration in minutes (default: 10)").setRequired(false)),

  new SlashCommandBuilder()
    .setName("bid")
    .setDescription("Place a bid on the current auction")
    .addStringOption(option =>
        option.setName("amount").setDescription("Bid amount (e.g., 100k, 1.2m)").setRequired(true)),

  new SlashCommandBuilder()
    .setName("bulk")
    .setDescription("Manage bulk Pokémon list")
    .addSubcommand(subcommand =>
        subcommand.setName("check")
            .setDescription("Check the current bulk Pokémon list")),

  new SlashCommandBuilder()
    .setName("auction-check")
    .setDescription("Check the current auction details"),

  new SlashCommandBuilder()
    .setName("auction-stop")
    .setDescription("Stop the current auction"),
];

// register commands
const newCommands = [
    // auction command tree
    new SlashCommandBuilder()
        .setName("auction")
        .setDescription("Pokemon Auction")
        // auction start subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName("start")
                .setDescription("Start a Pokémon auction")
                .addStringOption(option => 
                    option.setName("pokemon").setDescription("Pokémon name").setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName("rarity").setDescription("Pokémon rarity").setRequired(true).addChoices(
                        { name: "Legendary", value: "legendary" },
                        { name: "Shiny", value: "shiny" },
                        { name: "Mega", value: "mega" },
                        { name: "Shiny Mega", value: "shiny mega" },
                        { name: "Form", value: "form" },
                        { name: "Shiny Form", value: "shiny form" }, // Add shiny form here
                        { name: "Golden", value: "golden" },
                        { name: "Gmax", value: "gmax" },
                        { name: "Shiny Gmax", value: "shiny gmax" },
                        { name: "Bulk", value: "bulk" },
                        { name: "Exclusive", value: "exclusive" },
                        { name: "Golden Form", value: "golden form" }
                    )
                )
                .addStringOption(option =>
                    option.setName("autobuy").setDescription("Autobuy price (optional)").setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName("duration").setDescription("Auction duration in minutes (default: 10)").setRequired(false)
                )
        )
        // auction stop subcommand
        .addSubcommand(subcommand => 
            subcommand
                .setName('stop')
                .setDescription("Stop the current auction")
        )
        // auction info subcommand
        .addSubcommand(subcommand => 
            subcommand
                .setName('info')
                .setDescription('Check the current auction details')
        )
        // auction bid subcommand
        .addSubcommand(subcommand => 
            subcommand
                .setName('bid')
                .setDescription("Place a bid on the current auction")
                .addStringOption(option =>
                    option.setName("amount").setDescription("Bid amount (e.g., 100k, 1.2m)").setRequired(true)
                )
        )
        // auction rollback subcommand
        .addSubcommand(subcommand => 
            subcommand
                .setName('rollback')
                .setDescription("[ADMIN] Rollback to previous bid")
        ),
    
    // bulk command tree
    new SlashCommandBuilder()
        .setName("bulk")
        .setDescription("Manage bulk Pokémon list")
        // bulk info subcommand
        .addSubcommand(subcommand =>
            subcommand.setName("info")
                .setDescription("Check the current bulk Pokémon list")
        )
        // bulk set subcommand
        .addSubcommand(subcommand =>
            subcommand.setName("set")
                .setDescription("Set current auction's bulk Pokémon list")
                .addStringOption(option =>
                    option.setName("content").setDescription("Bulk contents (pokemon list)").setRequired(true)
                )
        ),

    // accepted command tree
    new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Manage accepted pokemons')
        // accepted set
        .addSubcommand(subcommand =>
            subcommand.setName("set")
                .setDescription("Set curent accepted pokemons list")
        )
        // accepted set
        .addSubcommand(subcommand =>
            subcommand.setName("info")
                .setDescription("Set curent accepted pokemons list")
        )
        // accepted clear
        .addSubcommand(subcommand =>
            subcommand.setName("clear")
                .setDescription("Clear curent accepted pokemons list")
        ),
]

// put in rest
const rest = new REST({ version: '10' }).setToken(config.token);

// refresh commands
try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(config.clientId), { body: newCommands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}