-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Créer l'utilisateur "Admin SuperUser" si inexistant
INSERT INTO users (id, firstname, lastname, created_at, updated_at)
SELECT gen_random_uuid(), 'Admin', 'SuperUser', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE firstname = 'Admin' AND lastname = 'SuperUser'
);

-- 2) Créer un compte admin rattaché si inexistant
INSERT INTO accounts (id, user_id, email, password_hash, provider, provider_account_id, role, created_at, updated_at)
SELECT
    gen_random_uuid(),
    u.id,
    'admin@example.com',
    '$2a$10$GIeBHC9bnbU28GMA8F8DauC1FHCJfTbXipuMmRtWnsiXyWnbt.GRe', -- mot de passe "admin"
    'email',
    NULL,
    'ADMIN',
    NOW(),
    NOW()
FROM users u
WHERE u.firstname = 'Admin' AND u.lastname = 'SuperUser'
  AND NOT EXISTS (
    SELECT 1 FROM accounts a WHERE a.email = 'admin@example.com'
);
