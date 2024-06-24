-- Drop the table if it exists
DROP TABLE IF EXISTS webhooks;

-- Create the webhooks table
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,          -- Unique identifier for each webhook
    webhook_url TEXT NOT NULL,      -- The URL of the webhook
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Record creation timestamp
);