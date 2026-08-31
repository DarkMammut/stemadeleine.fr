-- Table pour les tokens de réinitialisation de mot de passe
CREATE TABLE password_reset_tokens
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID         NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP    NOT NULL,
    used        BOOLEAN          DEFAULT FALSE,
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
);

-- Index pour recherche rapide par token
CREATE INDEX idx_password_reset_token ON password_reset_tokens (token);

-- Index pour recherche par account_id
CREATE INDEX idx_password_reset_account ON password_reset_tokens (account_id);
