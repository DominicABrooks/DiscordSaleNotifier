const api = require('./utils/api');
const data = require('./utils/data');
const webhooks = require('./utils/webhooks');

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

// Initial request, update every 100,000 milliseconds
updateSpecials();
setInterval(updateSpecials, 100000);
