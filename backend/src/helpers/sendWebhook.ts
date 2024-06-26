const sendToDiscordWebhook = async (hookURL: string, payload: any): Promise<Response> => {
    try {
        const response = await fetch(hookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to send message to Discord webhook. Status: ${response.status}`);
        }

        return response;
    } catch (err) {
        console.error('Error sending message to Discord webhook:', err);
        // Needs to return response is not okay
        throw err;
    };
};

export default sendToDiscordWebhook;