const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  JWT_REMEMBER_EXPIRES_IN: process.env.JWT_REMEMBER_EXPIRES_IN || "30d",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@liveclasscode.com",
  CLIENT_URL: process.env.CLIENT_URL || "https://lcc-learn.onrender.com",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
  LIVEKIT_HOST: process.env.LIVEKIT_HOST,
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
  MTN_MOMO_API_KEY: process.env.MTN_MOMO_API_KEY,
  MTN_MOMO_API_USER: process.env.MTN_MOMO_API_USER,
  MTN_MOMO_ENVIRONMENT: process.env.MTN_MOMO_ENVIRONMENT || "sandbox",
  MTN_MOMO_COLLECTION_PRIMARY_KEY: process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
  MTN_MOMO_PROVIDER_CALLBACK_HOST: process.env.MTN_MOMO_PROVIDER_CALLBACK_HOST,
  AIRTEL_MONEY_API_KEY: process.env.AIRTEL_MONEY_API_KEY,
  AIRTEL_MONEY_ENVIRONMENT: process.env.AIRTEL_MONEY_ENVIRONMENT || "sandbox",
  AIRTEL_MONEY_CLIENT_ID: process.env.AIRTEL_MONEY_CLIENT_ID,
  AIRTEL_MONEY_CLIENT_SECRET: process.env.AIRTEL_MONEY_CLIENT_SECRET,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};

module.exports = env;
