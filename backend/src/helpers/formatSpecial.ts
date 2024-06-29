
const formatSpecial = (special: any) => {
    const expires = new Date(special.discount_expiration * 1000).toLocaleString();

    const payload = {
        "username": 'Steam Specials Bot',
        "avatar_url": "https://cdn-icons-png.flaticon.com/512/220/220223.png",
        "embeds": [{
            "title": special.name,
            "description": "~~$" + (special.original_price / 100).toFixed(2) +
            "~~\n" + "$" + (special.final_price / 100).toFixed(2) + " (-" + special.discount_percent + "%)",
            "url": "https://store.steampowered.com/app/" + special.id,
            "color": null,
            "footer": {
            "text": "Last until " + expires
            },
            "image": {
            "url": special.header_image
            }
        }],
    }
    return payload;
}

export default formatSpecial;