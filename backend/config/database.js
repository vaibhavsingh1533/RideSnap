const { Sequelize } = require('sequelize');
require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.warn(`Missing database environment variables: ${missing.join(', ')}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ridesnap',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  await sequelize.authenticate();
  console.log('MySQL database connection established successfully.');
};

module.exports = {
  sequelize,
  testConnection,
  isUsingSQLite: false
};
