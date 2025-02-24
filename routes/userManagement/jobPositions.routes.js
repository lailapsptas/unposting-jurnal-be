import express from "express";
import { JobPositionsControllers } from "../../controllers/userManagement/jobPositions.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, JobPositionsControllers.create);
router.get("/", middleware.login, JobPositionsControllers.findAll);
router.get("/:id", middleware.login, JobPositionsControllers.findById);
router.put("/:id", middleware.admin, JobPositionsControllers.update);
router.delete("/:id", middleware.admin, JobPositionsControllers.delete);

export default router;
