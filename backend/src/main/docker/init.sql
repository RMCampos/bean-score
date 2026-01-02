-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Coffee Places Table
CREATE TABLE IF NOT EXISTS coffee_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    instagram_handle VARCHAR(100),
    coffee_quality INTEGER CHECK (coffee_quality >= 1 AND coffee_quality <= 5),
    ambient INTEGER CHECK (ambient >= 1 AND ambient <= 5),
    has_gluten_free BOOLEAN DEFAULT FALSE,
    has_veg_milk BOOLEAN DEFAULT FALSE,
    has_vegan_food BOOLEAN DEFAULT FALSE,
    has_sugar_free BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coffee_places_user_id ON coffee_places(user_id);
CREATE INDEX IF NOT EXISTS idx_coffee_places_created_at ON coffee_places(created_at DESC);