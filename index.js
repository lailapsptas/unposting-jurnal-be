// index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import db from "./db/knex.js";
import routes from "./routes/base.routes.js"; // Pastikan path-nya benar

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Connection check
console.log(db);

// Middleware
app.use(logger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
