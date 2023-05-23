const webhookURLs = require('./webhooks.json');

/**
 * Summary: Post to Discord
 * 
 * Description: Post passed webhook JSON to Discord webhook urls from ./webhooks
 * 
 * @param {JSON} data    webhook JSON formatted for Discord embed formatting
 * @link https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object
 */
const postToDiscord = async (data) => {
    webhookURLs.forEach(async WEBHOOK_URL => {
        await fetch(WEBHOOK_URL.url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

module.exports = {
    postToDiscord
};