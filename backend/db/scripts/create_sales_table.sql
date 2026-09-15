-- Idempotent schema: safe to re-run. Creates the sales table only if missing.
CREATE TABLE IF NOT EXISTS sales (
    game_id VARCHAR(255) PRIMARY KEY,       -- Unique identifier for each sale
    expiration_date TIMESTAMP  -- Record creation timestamp
);
