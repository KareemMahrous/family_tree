const { query } = require("../database/db");

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    passwordHash: row.password_hash,
    verified: row.verified,
    isFamily: row.is_family,
    otp: row.otp,
    otpExpiresAt: row.otp_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByPhone(phone) {
  const result = await query(
    `SELECT id, name, phone, password_hash, verified, is_family, otp, otp_expires_at, created_at, updated_at
     FROM users
     WHERE phone = $1`,
    [phone],
  );

  return mapUser(result.rows[0]);
}

async function findById(id) {
  const result = await query(
    `SELECT id, name, phone, password_hash, verified, is_family, otp, otp_expires_at, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return mapUser(result.rows[0]);
}

async function createUser({ name, phone, passwordHash, isFamily }) {
  const result = await query(
    `INSERT INTO users (name, phone, password_hash, is_family)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, phone, password_hash, verified, is_family, otp, otp_expires_at, created_at, updated_at`,
    [name, phone, passwordHash, isFamily],
  );

  return mapUser(result.rows[0]);
}

async function updateOtp({ phone, otp, otpExpiresAt }) {
  const result = await query(
    `UPDATE users
     SET otp = $2,
         otp_expires_at = $3,
         updated_at = NOW()
     WHERE phone = $1
     RETURNING id, name, phone, password_hash, verified, is_family, otp, otp_expires_at, created_at, updated_at`,
    [phone, otp, otpExpiresAt],
  );

  return mapUser(result.rows[0]);
}

async function updatePassword({ phone, passwordHash }) {
  const result = await query(
    `UPDATE users
     SET password_hash = $2,
         otp = NULL,
         otp_expires_at = NULL,
         updated_at = NOW()
     WHERE phone = $1
     RETURNING id, name, phone, password_hash, verified, is_family, otp, otp_expires_at, created_at, updated_at`,
    [phone, passwordHash],
  );

  return mapUser(result.rows[0]);
}

module.exports = {
  findById,
  findByPhone,
  createUser,
  updateOtp,
  updatePassword,
};
