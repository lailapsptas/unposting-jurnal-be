import knex from "knex";
import config from "../knexfile.js";

const environment = process.env.NODE_ENV || "development";
console.log("Environment:", environment);
console.log(
  "Database Config:",
  JSON.stringify(
    {
      host: config[environment].connection.host,
      port: config[environment].connection.port,
      user: config[environment].connection.user,
      database: config[environment].connection.database,
    },
    null,
    2
  )
);

const db = knex(config[environment]);

db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

export default db;
