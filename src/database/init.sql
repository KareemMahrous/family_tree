CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_family BOOLEAN NOT NULL DEFAULT FALSE,
  otp VARCHAR(10),
  otp_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100),
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(30),
  gender VARCHAR(20),
  birth_date DATE,
  job_title VARCHAR(255),
  branch VARCHAR(255),
  education VARCHAR(255),
  death_date DATE,
  is_alive BOOLEAN NOT NULL DEFAULT TRUE,
  mother_name VARCHAR(255),
  wife_name VARCHAR(255),
  photo_url TEXT,
  bio TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE family_members ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS mobile VARCHAR(30);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS branch VARCHAR(255);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS education VARCHAR(255);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS wife_name VARCHAR(255);
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE INDEX IF NOT EXISTS idx_family_members_owner_user_id ON family_members (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_linked_user_id ON family_members (linked_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_full_name ON family_members (full_name);
CREATE INDEX IF NOT EXISTS idx_family_members_mobile ON family_members (mobile);

CREATE TABLE IF NOT EXISTS family_relations (
  id BIGSERIAL PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  related_family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_member_id, related_family_member_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_family_relations_family_member_id ON family_relations (family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_relations_related_family_member_id ON family_relations (related_family_member_id);
