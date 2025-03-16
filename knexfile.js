import dotenv from "dotenv";
dotenv.config();

const config = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST_DEVELOPMENT,
      port: process.env.DB_PORT_DEVELOPMENT || 5432,
      user: process.env.DB_USER_DEVELOPMENT,
      password: process.env.DB_PWD_DEVELOPMENT,
      database: process.env.DB_NAME_DEVELOPMENT,
      charset: "utf8",
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST_PRODUCTION,
      port: process.env.DB_PORT_PRODUCTION || 5432,
      user: process.env.DB_USER_PRODUCTION,
      password: process.env.DB_PWD_PRODUCTION,
      database: process.env.DB_NAME_PRODUCTION,
      charset: "utf8",
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
};

export default config;
