const webhookURLs = require('../webhooks.json');
const chalk = require('chalk');

/**
 * Summary: Post to Discord
 * 
 * Description: Post passed payload to Discord webhook urls from ./webhooks
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

/** 
 * Summary: Handle Discord Post
 */
const handleDiscordPost = (payload) => {
    if(payload.embeds && payload.embeds.length > 0)
    {
        console.log(chalk.bold.blue("New specials found: "))
        payload.embeds.forEach((embed) => console.log(chalk.green(`- ${embed.title}`)));

        postToDiscord(payload);
    }
    else
    {
        console.log(chalk.bold.blue("No new specials found!"));
    }
};

module.exports = { handleDiscordPost };