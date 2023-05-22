const fs = require('fs');

const tracking = require('./tracking.json');

/**
 * Summary: Create embed from specials JSON
 * 
 * Description: Use passed specials json to create embed and pass to postToDiscord.
 * 
 * @param {JSON} specialsJson JSON from specials section of featured categories streamworks api.
 */
const createEmbed = (specialsJson) => {
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

    // Remove expired deals from tracking
    removeExpired();

    // Jsonify tracking list, and write to tracking json
    var track = JSON.stringify(tracking);
    fs.writeFileSync("./tracking.json", track);

    return data;
}

const removeExpired = () => {
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
        try {
            fs.writeFileSync("./tracking.json", JSON.stringify(updatedData));
        } catch (err) {
            console.error('Error writing file:', err);
        }
    });
}

module.exports = {
    createEmbed
};
  