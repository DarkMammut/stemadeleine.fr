-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Créer un user si aucun "Admin SuperUser" n'existe
INSERT INTO users (id, firstname, lastname, created_at, updated_at)
SELECT gen_random_uuid(), 'Admin', 'SuperUser', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE firstname = 'Admin' AND lastname = 'SuperUser'
);

-- 2) Créer un compte admin rattaché
INSERT INTO accounts (id, user_id, email, password_hash, provider, provider_account_id, role, created_at, updated_at)
SELECT
    gen_random_uuid(),
    u.id,
    'admin@example.com',
    '$2a$10$Dow1q4Q6lJw3XK2XpDbcOebX3i8v7ZzPbl.9y.9Fq9rh4p1jVwBdy', -- mot de passe "admin"
    'local',
    NULL,
    'ADMIN',
    NOW(),
    NOW()
FROM users u
WHERE u.firstname = 'Admin' AND u.lastname = 'SuperUser'
  AND NOT EXISTS (SELECT 1 FROM accounts WHERE email = 'admin@example.com');