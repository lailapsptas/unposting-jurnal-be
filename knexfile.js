import dotenv from "dotenv";

dotenv.config();

export default {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      charset: "utf8",
    },
    migrations: {
      directory: "db/migrations",
    },
    seeds: {
      directory: "db/seeds",
    },
  },
};
