/**
 * Delete broadcast message with message ID
 * @param {*} interaction 
 * @param {*} channelId 
 * @param {*} messageId 
 */
export async function deleteBroadcastMessage(interaction, channelId, messageId) {
    const message = await interaction.guild.channels.cache.get(channelId).messages.fetch(messageId);
    message.delete().catch(console.error);
}