const path = require("path");

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key",
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/qawasem",
  defaultOtp: "0000",
  migrationsPath: path.join(__dirname, "database", "init.sql"),
};
