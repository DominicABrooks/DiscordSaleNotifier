# Discord Steam Sale Notifier
Simple node application to fetch from steamworks api and post to a Discord webhook when new specials go live.
![Untitled](https://user-images.githubusercontent.com/51772450/208909372-14931855-6fcc-47f6-9b20-dfe92b6a03cf.png)

## Guide 

To get a webhook url, follow this [guide](https://support.discord.com/hc/en-us/articles/360045093012-Server-Integrations-Page).

All webhooks you want to post to go in ``./webhooks.json`` in this format -\
``{"url": "https://discord.com/api/webhooks/example"}``
