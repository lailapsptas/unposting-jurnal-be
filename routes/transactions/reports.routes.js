import express from "express";
import { ReportsControllers } from "../../controllers/transactions/reports.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, ReportsControllers.create);
router.get("/", middleware.login, ReportsControllers.findAll);
router.get("/:id", middleware.login, ReportsControllers.findById);
router.delete("/:id", middleware.admin, ReportsControllers.delete);

router.get(
  "/:id/download",
  middleware.admin,
  ReportsControllers.downloadReport
);

export default router;
