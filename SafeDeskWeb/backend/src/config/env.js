require("dotenv").config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const env = {
    // SERVER
    PORT: process.env.PORT || 8889,
    FRONTEND_URL: process.env.FRONTEND_URL || "*",

    // DATABASE 
    DB_HOST: requireEnv("DB_HOST"),
    DB_USER: requireEnv("DB_USER"),
    DB_PASSWORD: requireEnv("DB_PASSWORD"),
    DB_NAME: requireEnv("DB_NAME"),
    URL_BE: requireEnv("URL_BE"),
    // AUTH
    JWT_SECRET: requireEnv("JWT_SECRET_KEY"),
};

module.exports = env;
