# Discord Steam Sale Notifier
Simple node application to fetch from steamworks api and post to a Discord webhook when new specials go live.
![Untitled](https://user-images.githubusercontent.com/51772450/209007740-594c6448-e763-4e58-b60d-cfa26d6917d8.png)

## Guide 

To get a webhook url, follow this [guide](https://support.discord.com/hc/en-us/articles/360045093012-Server-Integrations-Page).

All webhooks you want to post to go in ``./webhooks.json`` in this format -\
``{"url": "https://discord.com/api/webhooks/example"}``
