/**
 * Set current bulk contents
 * @param {*} bulkPokemon 
 * @param {*} channel 
 * @param {*} interaction 
 */
export async function bulkSet(bulkPokemon, options, channel, interaction) {
    const bulkContent = options.getString("content").toLowerCase();
    const pokemonList = bulkContent.split(",").map(p => p.trim());

    // set bulk
    bulkPokemon.set(channel.id, pokemonList);
    console.log('BULK   ', '|', `bulk auction in #${channel.name} set to: ${bulkContent}`);
    await interaction.reply(`📋 Bulk set to: ${pokemonList.join(", ")}`).catch(console.error);
}