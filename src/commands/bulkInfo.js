/**
 * Get current pokemon bulk
 * @param {*} bulkPokemon 
 * @param {*} channel 
 * @returns 
 */
export async function bulkInfo(bulkPokemon, channel, interaction) {
    const pokemonList = bulkPokemon.get(channel.id);
    if (!pokemonList) {
        return interaction.reply({ content: "⚠ No bulk Pokémon set!", ephemeral: true }).catch(console.error);
    }
    await interaction.reply(`📋 Bulk Pokémons: ${pokemonList.join(", ")}`).catch(console.error);
}