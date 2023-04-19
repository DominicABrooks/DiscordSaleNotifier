const tracking = require('./tracking.json');
const webhookURLs = require('./webhooks.json');
const fs = require('fs');

// Get featured categories, pull specials from it and pass it create the webhook
const getCurrentSpecials = async () => {
    let dataJson = await getSteamFeatured();
    let specialsJson = dataJson['specials']['items'];
    createWebhook(specialsJson);
}

// Fetch from steampowered storefront api and return json object
const getSteamFeatured = async (req, res) => {
    let featuredCategories = await fetch(`https://store.steampowered.com/api/featuredcategories?cc=US`)
    let featuredCategoriesJson = await featuredCategories.json();
    return featuredCategoriesJson;
}

/**
 * Summary: Create webhook from specials JSON
 * 
 * Description: Use passed specials json to create webhook and pass to postToDiscord.
 * 
 * @param {JSON} specialsJson    JSON from specials section of featured categories streamworks api.
 */
const createWebhook = async (specialsJson) => {
    // Create discord bot header
    let data = {
        "username": 'Steam Specials Bot',
        "avatar_url": "https://cdn-icons-png.flaticon.com/512/220/220223.png",
        "embeds": [],
    }

    // Attempt to create new embed for each game in steam specials
    let i = 0;
    specialsJson.forEach(async (game) => {
        if(tracking.find(tracking => tracking.id == game.id))
        {
            console.log("Game ID " + game.id + " already tracked");
        }
        else
        {
            var expires = new Date(game.discount_expiration * 1000).toLocaleString()
            if(data.embeds.length >= 10)
            {
                postToDiscord(data);
                data.embeds = [];
                i = 0;
            }

            data["embeds"][i] = 
            {
                "title": game.name,
                "description": "~~$" + (game.original_price / 100).toFixed(2) +
                "~~\n" + "$" + (game.final_price / 100).toFixed(2) + " (-" + game.discount_percent + "%)",
                "url": "https://store.steampowered.com/app/" + game.id,
                "color": null,
                "footer": 
                {
                    "text": "Last until " + expires
                },
                "image": 
                {
                    "url": game.header_image
                }
            }

            i++;
            let id = game.id;
            let expireEpoch = game.discount_expiration;
            tracking[tracking.length] = {"id": id, "expires": expireEpoch};
        }
    });

    // Remove expired deals
    fs.readFile("./tracking.json", (err, data) => {
        if (err) throw err;
        var date = Math.floor(Date.now() / 1000);
        let obj = JSON.parse(data);

        // Load updated list into new obj
        const updatedData = Object.values(obj).filter(item => date < item.expires);
        const newData = {};
        updatedData.forEach((item, index) => {
            newData[index + 1] = item;
        });
      
        // Write the modified object back to the file
        fs.writeFileSync("./tracking.json", JSON.stringify(updatedData), err => {
          if (err) throw err;
          console.log('Removed Expired');
        });
    });

    // Jsonify tracking list, print, and write to tracking json
    var track = JSON.stringify(tracking);
    fs.writeFileSync("./tracking.json", track);

    postToDiscord(data);
}

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
        console.log("New Specials: " + data.embeds);
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

// Initial request, update every 100,000 milliseconds
getCurrentSpecials();
setInterval(getCurrentSpecials, 100000);
