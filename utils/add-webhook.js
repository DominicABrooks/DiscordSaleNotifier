const fs = require('fs');
const path = require('path');

// Function to add a webhook URL
const addWebhook = (webhookURL) => {
  const filePath = path.join(__dirname, '../webhooks.json');

  // Read the existing data from the file
  let existingData = [];
  try {
    existingData = JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.error('Error reading webhook data:', error);
    return;
  }

  // Append the new webhook URL to the existing array
  existingData.push({ url: webhookURL });

  // Write the updated data back to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(existingData));
    console.log(`Webhook URL "${webhookURL}" added successfully.`);
  } catch (error) {
    console.error('Error writing webhook data:', error);
  }
};

// Retrieve the webhook URL from the npm script arguments
const webhookArg = process.argv[3];

// Check if the webhook URL argument is provided
if (webhookArg) {
  // Parse out the webhook URL from the argument
  addWebhook(webhookArg);
} else {
  console.error('Webhook URL is missing. Please provide the webhook argument.');
  console.error('Example:\n npm run add-webhook -- your webhook url here');
}