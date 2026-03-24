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

DROP TABLE IF EXISTS family_relations;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'family_members'
  ) AND (
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'family_members'
        AND column_name IN (
          'owner_user_id',
          'linked_user_id',
          'death_date',
          'bio',
          'notes',
          'created_at',
          'updated_at'
        )
    ) OR EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'family_members'
        AND column_name = 'id'
        AND data_type <> 'integer'
    )
  ) THEN
    DROP TABLE family_members;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY,
  title VARCHAR(100),
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(30),
  birth_date DATE,
  gender VARCHAR(20),
  job_title VARCHAR(255),
  branch VARCHAR(255),
  education VARCHAR(255),
  is_alive BOOLEAN NOT NULL DEFAULT TRUE,
  mother_name VARCHAR(255),
  wife_name VARCHAR(255),
  photo_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_family_members_full_name ON family_members (full_name);
CREATE INDEX IF NOT EXISTS idx_family_members_mobile ON family_members (mobile);
