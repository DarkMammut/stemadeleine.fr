-- V1__init_schema.sql

-- Extension nécessaire pour UUID si pas encore activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       firstname VARCHAR(255),
                       lastname VARCHAR(255),
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- ADDRESSES
-- =====================
CREATE TABLE addresses (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           street VARCHAR(255),
                           city VARCHAR(255),
                           zipcode VARCHAR(50),
                           country VARCHAR(100),
                           created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                           updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- USER_ADDRESSES (junction)
-- =====================
CREATE TABLE user_addresses (
                                user_id UUID NOT NULL,
                                address_id UUID NOT NULL,
                                type VARCHAR(50),
                                PRIMARY KEY (user_id, address_id, type),
                                CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
                                CONSTRAINT user_addresses_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- =====================
-- ACCOUNTS
-- =====================
CREATE TABLE accounts (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          user_id UUID NOT NULL,
                          email VARCHAR(255) UNIQUE,
                          password_hash VARCHAR(255),
                          provider VARCHAR(50) DEFAULT 'local',
                          provider_account_id VARCHAR(255),
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================
-- MEDIA
-- =====================
CREATE TABLE media (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       file_url VARCHAR(500) NOT NULL,
                       title VARCHAR(255),
                       alt_text VARCHAR(255),
                       file_type VARCHAR(50),
                       file_size INT,
                       is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- PAGES
-- =====================
CREATE TABLE pages (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       page_id UUID NOT NULL,
                       version INT NOT NULL,
                       name VARCHAR(255) NOT NULL,
                       title VARCHAR(255) NOT NULL,
                       sub_title VARCHAR(255),
                       description TEXT DEFAULT '',
                       slug VARCHAR(255) NOT NULL,
                       status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                       sort_order INT,
                       parent_page_id UUID,
                       hero_media_id UUID,
                       author_id UUID NOT NULL,
                       is_visible BOOLEAN DEFAULT FALSE NOT NULL,
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                       CONSTRAINT pages_parent_page_id_fkey FOREIGN KEY (parent_page_id) REFERENCES pages(id),
                       CONSTRAINT pages_hero_media_id_fkey FOREIGN KEY (hero_media_id) REFERENCES media(id),
                       CONSTRAINT pages_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Index pour retrouver rapidement la dernière version
CREATE INDEX idx_pages_page_id_version ON pages(page_id, version DESC);

-- =====================
-- SECTIONS
-- =====================
CREATE TABLE sections (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          page_id UUID NOT NULL,
                          section_id UUID NOT NULL,
                          version INT NOT NULL DEFAULT 1,
                          name VARCHAR(255) NOT NULL,
                          title VARCHAR(255),
                          sort_order INT,
                          is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                          status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                          author_id UUID NOT NULL,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          CONSTRAINT sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES pages(id),
                          CONSTRAINT sections_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- MODULES
-- =====================
CREATE TABLE modules (
                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         section_id UUID NOT NULL,
                         version INT NOT NULL DEFAULT 1,
                         name VARCHAR(255) NOT NULL,
                         type VARCHAR(50) NOT NULL,
                         variant VARCHAR(50),
                         display_variant VARCHAR(50),
                         sort_order INT,
                         is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                         status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                         author_id UUID NOT NULL,
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         CONSTRAINT modules_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id),
                         CONSTRAINT modules_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- ARTICLES
-- =====================
CREATE TABLE articles (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          module_id UUID NOT NULL,
                          version INT NOT NULL DEFAULT 1,
                          name VARCHAR(255) NOT NULL,
                          title VARCHAR(255),
                          body JSONB,
                          sort_order INT,
                          is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                          status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                          author_id UUID NOT NULL,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          CONSTRAINT articles_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id),
                          CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- CONTENTS
-- =====================
CREATE TABLE contents (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          owner_id UUID NOT NULL,
                          version INT NOT NULL DEFAULT 1, -- versioning
                          status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- status
                          title VARCHAR(255),
                          body JSONB,
                          sort_order INT,
                          is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          CONSTRAINT contents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- =====================
-- CONTENT_MEDIA (junction)
-- =====================
CREATE TABLE content_media (
                               content_id UUID NOT NULL,
                               media_id UUID NOT NULL,
                               sort_order SMALLINT,
                               PRIMARY KEY (content_id, media_id),
                               CONSTRAINT content_media_content_id_fkey FOREIGN KEY (content_id) REFERENCES contents(id),
                               CONSTRAINT content_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES media(id)
);

-- =====================
-- DONATION_CAMPAIGNS
-- =====================
CREATE TABLE donation_campaigns (
                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                    title VARCHAR(255) NOT NULL,
                                    description TEXT,
                                    goal INT,
                                    url VARCHAR(255) NOT NULL,
                                    is_active BOOLEAN DEFAULT TRUE NOT NULL,
                                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- NEWS
-- =====================
CREATE TABLE news (
                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                      public_id VARCHAR(255) UNIQUE NOT NULL,
                      title VARCHAR(255) NOT NULL,
                      description TEXT,
                      is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                      date TIMESTAMPTZ NOT NULL,
                      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- NEWSLETTERS
-- =====================
CREATE TABLE newsletters (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             public_id VARCHAR(255) UNIQUE NOT NULL,
                             title VARCHAR(255) NOT NULL,
                             description TEXT,
                             is_visible BOOLEAN DEFAULT TRUE NOT NULL,
                             date TIMESTAMPTZ NOT NULL,
                             created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                             updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
