/**
 * Sends a GET request to a specified URL.
 * 
 * This function uses the `fetch` API to send a GET request to a given URL.
 * It is typically used to retrieve data or verify the URL.
 * If the request fails, it throws an error.
 * 
 * @param {string} url - The URL to which the GET request is sent.
 * @returns {Promise<Response>} - A promise that resolves to the response of the fetch request.
 * 
 * @throws Will throw an error if the request fails (i.e., the response status is not OK).
 * 
 * @example
 * const url = 'https://example.com/api/data';
 * 
 * sendGetRequest(url)
 *   .then(response => response.json())
 *   .then(data => console.log('Received data:', data))
 *   .catch(err => console.error('Error making GET request:', err));
 */
const getFromWebhook = async (url: string): Promise<Response> => {
    try {
        // Send a GET request to the specified URL
        const response = await fetch(url, {
            method: 'GET', // Use the GET method
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is not OK (status code outside the range 200-299)
        if (!response.ok) {
            throw new Error(`Failed to fetch data from URL. Status: ${response.status}`);
        }

        // Return the response if the request was successful
        return response;
    } catch (err) {
        // Log the error to the console and rethrow it
        console.error('Error making GET request:', err);
        throw err;
    }
};

export default getFromWebhook;