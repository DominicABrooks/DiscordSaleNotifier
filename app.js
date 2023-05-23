const api = require('./api');
const data = require('./data');
const webhooks = require('./webhooks');

const updateSpecials = async () => {
    try {
        const specials = await api.getCurrentSpecials();

        const payload = data.createEmbed(specials);
      
        if(payload.embeds && payload.embeds.length > 0)
        {
            console.log("New specials found: ")
            payload.embeds.forEach((embed) => console.log(embed.title));
            webhooks.postToDiscord(payload);
        }
        else
        {
            console.log("No new specials found!");
        }
    } catch (error) {
        console.error('Error updating specials:', error);
    }
  };

// Initial request, update every 100,000 milliseconds
updateSpecials();
setInterval(updateSpecials, 100000);
