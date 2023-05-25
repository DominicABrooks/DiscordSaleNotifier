const api = require('./api');
const data = require('./data');
const webhooks = require('./webhooks');

/**
 * Summary: Update Specials and Post to Discord
 */
const updateSpecials = async () => {
    // Retrieve the current specials from api
    const specials = await api.getCurrentSpecials();

    // Create an embed payload using retrieved specials
    const payload = data.createEmbed(specials);
    
    // Handle posting payload to Discord
    webhooks.handleDiscordPost(payload);
};

module.exports = { updateSpecials };