const { Sequelize } = require("sequelize");
require("dotenv").config();

const required = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME"
];

const missing = required.filter(
  (key) => !process.env[key]
);

if (missing.length) {
  throw new Error(
    `Missing database variables: ${missing.join(", ")}`
  );
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 27507),
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      },
      connectTimeout: 20000
    },

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
  console.log("Aiven MySQL connected successfully.");
};

module.exports = {
  sequelize,
  testConnection,
  isUsingSQLite: false
};
