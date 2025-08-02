DROP TABLE IF EXISTS items;

CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL
);

-- Optional: Insert initial data
INSERT INTO items (name, description, price) VALUES
    ('Canned Tuna', 'Korean spicy red tuna in a can', 7.99),
    ('Tissue Paper', '2-ply tissue paper box', 13.49);