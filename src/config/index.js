/**
 * Application configuration
 */

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'horeca',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || ''
  }
};
