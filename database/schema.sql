-- SamVyt Rifas - Database Schema
-- PostgreSQL/Supabase Database Structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: raffle_configs
-- Stores raffle configuration and details
CREATE TABLE IF NOT EXISTS raffle_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    prize TEXT NOT NULL,
    total_quotas INTEGER NOT NULL DEFAULT 17000,
    price_per_quota DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    draw_date TIMESTAMP NOT NULL,
    draw_method VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: users
-- Stores user information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: quotas
-- Stores all 17,000 quotas
CREATE TABLE IF NOT EXISTS quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES raffle_configs(id) ON DELETE CASCADE,
    number VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    transaction_id UUID,
    purchase_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(raffle_id, number)
);

-- Table: transactions
-- Stores payment transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES raffle_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'expired')),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'pix',
    pix_code TEXT,
    qr_code_base64 TEXT,
    external_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    expires_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: transaction_quotas
-- Junction table linking transactions to quotas (many-to-many)
CREATE TABLE IF NOT EXISTS transaction_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    quota_id UUID REFERENCES quotas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(transaction_id, quota_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_quotas_raffle_status ON quotas(raffle_id, status);
CREATE INDEX IF NOT EXISTS idx_quotas_number ON quotas(number);
CREATE INDEX IF NOT EXISTS idx_quotas_user_id ON quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
CREATE TRIGGER update_raffle_configs_updated_at BEFORE UPDATE ON raffle_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotas_updated_at BEFORE UPDATE ON quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Initialize quotas for a raffle
CREATE OR REPLACE FUNCTION initialize_raffle_quotas(p_raffle_id UUID, p_total_quotas INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..p_total_quotas LOOP
        INSERT INTO quotas (raffle_id, number, status)
        VALUES (p_raffle_id, LPAD(i::TEXT, 5, '0'), 'available');
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Get raffle statistics
CREATE OR REPLACE FUNCTION get_raffle_stats(p_raffle_id UUID)
RETURNS TABLE(
    total_quotas BIGINT,
    sold_quotas BIGINT,
    pending_quotas BIGINT,
    available_quotas BIGINT,
    revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_quotas,
        COUNT(*) FILTER (WHERE status = 'sold')::BIGINT as sold_quotas,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_quotas,
        COUNT(*) FILTER (WHERE status = 'available')::BIGINT as available_quotas,
        (COUNT(*) FILTER (WHERE status = 'sold') * 
         (SELECT price_per_quota FROM raffle_configs WHERE id = p_raffle_id))::DECIMAL as revenue
    FROM quotas
    WHERE raffle_id = p_raffle_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Release expired pending quotas
CREATE OR REPLACE FUNCTION release_expired_quotas()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update transactions to expired
    UPDATE transactions
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    -- Release quotas from expired transactions
    UPDATE quotas q
    SET status = 'available', transaction_id = NULL
    FROM transactions t
    WHERE q.transaction_id = t.id
    AND t.status = 'expired'
    AND q.status = 'pending';
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE raffle_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_quotas ENABLE ROW LEVEL SECURITY;

-- Public read access to raffle configs
CREATE POLICY "Public can view raffle configs" ON raffle_configs
    FOR SELECT USING (true);

-- Public read access to quotas
CREATE POLICY "Public can view quotas" ON quotas
    FOR SELECT USING (true);

-- Users can view their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Insert initial raffle configuration
INSERT INTO raffle_configs (name, prize, total_quotas, price_per_quota, draw_date, draw_method, status)
VALUES (
    'Rifa iPhone 17',
    'iPhone 17 Pro Max 256GB',
    17000,
    1.00,
    '2025-03-15 20:00:00',
    'Loteria Federal',
    'active'
)
ON CONFLICT DO NOTHING;

-- Get the raffle ID and initialize quotas
DO $$
DECLARE
    v_raffle_id UUID;
BEGIN
    SELECT id INTO v_raffle_id FROM raffle_configs WHERE name = 'Rifa iPhone 17' LIMIT 1;
    IF v_raffle_id IS NOT NULL THEN
        PERFORM initialize_raffle_quotas(v_raffle_id, 17000);
    END IF;
END $$;
