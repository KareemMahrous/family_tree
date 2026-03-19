const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const userRepository = require("../repositories/userRepository");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    mobile: user.phone,
    verified: user.verified,
    isFamily: user.isFamily,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validatePhone(phone) {
  if (typeof phone !== "string") {
    return false;
  }

  const normalizedPhone = phone.trim();
  return /^01[0125][0-9]{8}$/.test(normalizedPhone);
}

async function register({ name, phone, password, isFamilyMember = false }, t) {
  if (!name) {
    const error = new Error(t("nameRequired"));
    error.status = 400;
    throw error;
  }

  if (!phone) {
    const error = new Error(t("phoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!validatePhone(phone)) {
    const error = new Error(t("validEgyptianPhoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!password) {
    const error = new Error(t("passwordRequired"));
    error.status = 400;
    throw error;
  }

  const normalizedPhone = phone.trim();
  const existingUser = await userRepository.findByPhone(normalizedPhone);

  if (existingUser) {
    const error = new Error(t("phoneAlreadyRegistered"));
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name: name.trim(),
    phone: normalizedPhone,
    passwordHash,
    isFamily: isFamilyMember,
  });

  return sanitizeUser(user);
}

async function login({ phone, password }, t) {
  if (!phone) {
    const error = new Error(t("phoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!validatePhone(phone)) {
    const error = new Error(t("validEgyptianPhoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!password) {
    const error = new Error(t("passwordRequired"));
    error.status = 400;
    throw error;
  }

  const normalizedPhone = phone.trim();
  const user = await userRepository.findByPhone(normalizedPhone);

  if (!user) {
    const error = new Error(t("invalidPhoneOrPassword"));
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error(t("invalidPhoneOrPassword"));
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { sub: String(user.id), phone: user.phone, name: user.name },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

  return {
    ...sanitizeUser(user),
    token,
  };
}

async function forgotPassword({ phone }, t) {
  if (!phone) {
    const error = new Error(t("phoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!validatePhone(phone)) {
    const error = new Error(t("validEgyptianPhoneRequired"));
    error.status = 400;
    throw error;
  }

  const normalizedPhone = phone.trim();
  const user = await userRepository.findByPhone(normalizedPhone);

  if (!user) {
    const error = new Error(t("userNotFound"));
    error.status = 404;
    throw error;
  }

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await userRepository.updateOtp({
    phone: normalizedPhone,
    otp: config.defaultOtp,
    otpExpiresAt,
  });

  return {
    otp: config.defaultOtp,
    expiresAt: otpExpiresAt,
  };
}

async function resetPassword({ phone, otp, password, newPassword }, t) {
  const nextPassword = newPassword || password;

  if (!phone) {
    const error = new Error(t("phoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!validatePhone(phone)) {
    const error = new Error(t("validEgyptianPhoneRequired"));
    error.status = 400;
    throw error;
  }

  if (!otp) {
    const error = new Error(t("otpRequired"));
    error.status = 400;
    throw error;
  }

  if (!nextPassword) {
    const error = new Error(t("newPasswordRequired"));
    error.status = 400;
    throw error;
  }

  const normalizedPhone = phone.trim();
  const user = await userRepository.findByPhone(normalizedPhone);

  if (!user) {
    const error = new Error(t("userNotFound"));
    error.status = 404;
    throw error;
  }

  const otpExpired =
    !user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date();

  if (user.otp !== otp || otpExpired) {
    const error = new Error(t("invalidOrExpiredOtp"));
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(nextPassword, 10);
  const updatedUser = await userRepository.updatePassword({
    phone: normalizedPhone,
    passwordHash,
  });

  return {
    mobile: updatedUser.phone,
  };
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
