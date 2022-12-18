# Discord Steam Sale Notifier
Simple node application to fetch from steamworks api and post to a Discord webhook when new specials go live.
![image](https://user-images.githubusercontent.com/51772450/208270334-23e44856-507f-4ad0-b1f0-cd2279437d3c.png)
![image](https://user-images.githubusercontent.com/51772450/208270444-4c853785-1371-486e-b6a2-febc6731dd7d.png)
![image](https://user-images.githubusercontent.com/51772450/208270450-42732571-6435-435a-9d1a-71eeceffa610.png)
![image](https://user-images.githubusercontent.com/51772450/208270233-e583a5df-1b01-4583-8656-13f8ccf7412a.png)


## Guide 

To get a webhook url, follow this [guide](https://docs.github.com/en/developers/webhooks-and-events/webhooks/creating-webhooks).

All webhooks you want to post to go in ``./webhooks.json`` in this format -\
``{"url": "https://discord.com/api/webhooks/example"}``
