import cron from 'node-cron';
import pool from '../../db/db.js'
import { sendToDiscordWebhookBulk, sendToDiscordWebhooksInDb } from '../helpers/sendWebhook.js';
import formatSpecial from '../helpers/formatSpecial.js';

async function clearExpiredRows() {
  await pool.query('DELETE FROM sales WHERE expiration_date < NOW()');
}

async function getAllFromSalesTable(): Promise<string[]> {
  try {
    const query = 'SELECT game_id FROM sales';
    const result = await pool.query(query);

    // Extract game IDs from the query result
    const gameIds = result.rows.map(row => row.game_id);

    return gameIds;
  } catch (error) {
    console.error('Error retrieving game IDs from sales table:', error);
    throw error;
  }
}

/**
 * Fetches data from the Steamworks API endpoint.
 * 
 * @returns {Promise<any[]>} A promise resolving to an array of special items from the Steamworks API response,
 *                           or null if there's an error.
 */
async function fetchDataFromSteamworks(): Promise<any[]> {
  const url = "https://store.steampowered.com/api/featuredcategories?cc=US";

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Steamworks API. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.specials.items;
  } catch (error) {
    console.error('Error fetching data from Steamworks API:', error);
    return []; // Return an empty array or handle error case as needed
  }
}

/**
 * Function to add a new sale to the database.
 * Adjust this function based on your actual database schema and logic.
 * 
 * @param {string} id - The ID of the special sale.
 * @param {Date} expirationDate - The expiration date of the special sale.
 */
async function addSaleToDatabase(id: string, expirationDate: string): Promise<void> {
  try {
    // Example SQL query to insert into `sales` table
    const query = 'INSERT INTO sales (game_id, expiration_date) VALUES ($1, $2)';
    await pool.query(query, [id, expirationDate]);
    console.log(`Added sale to database: ID ${id}, Expiration ${expirationDate}`);
  } catch (error) {
    console.error('Error adding sale to database:', error);
    throw error;
  }
}

const steamworksCron = async (cronExpression: string) => {
  // Define your cron job schedule
  cron.schedule(cronExpression, async () => {
    console.log('Running cron job...');
    try {
      await clearExpiredRows();
      const existingSales = await getAllFromSalesTable();

      const steamData = await fetchDataFromSteamworks();
      if (steamData) {
        // Iterate through each special item from Steamworks API response
        for (const special of steamData) {
          const specialId = special.id.toString()
          // Check if the special ID is not already in the existing sales data
          if (!existingSales.includes(specialId)) {
            // Add new sale to the database
            const expirationTimestamp = new Date(special.discount_expiration * 1000).toISOString();
            await addSaleToDatabase(special.id, expirationTimestamp);
            // Post to all webhooks
            const payload = formatSpecial(special);
            await sendToDiscordWebhooksInDb(payload);
          }
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

export default steamworksCron;