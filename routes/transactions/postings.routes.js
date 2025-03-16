import express from "express";
import { PostingsControllers } from "../../controllers/transactions/postings.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, PostingsControllers.createPosting);
router.post("/unpost", middleware.admin, PostingsControllers.unpostMonth);

router.get("/", middleware.login, PostingsControllers.findAll);
router.get("/:id", middleware.login, PostingsControllers.findById);
router.get(
  "/unposted-ledgers",
  middleware.login,
  PostingsControllers.getUnpostedLedgers
);
router.get("/report", middleware.login, PostingsControllers.getPostingReport);

export default router;
