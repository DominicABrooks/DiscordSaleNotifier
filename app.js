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
    handleDiscordPost(payload);
};

/** 
 * Summary: Handle Discord Post
 */
const handleDiscordPost = (payload) => {
    if(payload.embeds && payload.embeds.length > 0)
    {
        console.log("New specials found: ")
        payload.embeds.forEach((embed) => console.log(`\t- ${embed.title}`));

        webhooks.postToDiscord(payload);
    }
    else
    {
        console.log("No new specials found!");
    }
};

// Initial request, update every 100,000 milliseconds
updateSpecials();
setInterval(updateSpecials, 100000);
