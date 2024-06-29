-- Drop the table if it exists
DROP TABLE IF EXISTS sales;

-- Create the sales table
CREATE TABLE sales (
    game_id VARCHAR(255) PRIMARY KEY,       -- Unique identifier for each webhook
    expiration_date TIMESTAMP  -- Record creation timestamp
);