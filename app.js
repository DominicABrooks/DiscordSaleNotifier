const api = require('./api');
const data = require('./data');
const webhooks = require('./webhooks');

const updateSpecials = async () => {
    try {
      const specials = await api.getCurrentSpecials();
      const embed = data.createEmbed(specials);
      webhooks.postToDiscord(embed);
    } catch (error) {
      console.error('Error updating specials:', error);
    }
  };

// Initial request, update every 100,000 milliseconds
updateSpecials();
setInterval(updateSpecials, 100000);
