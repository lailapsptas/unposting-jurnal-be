// routes/userManagement/jobPositions.routes.js
import express from "express";
import { JobPositionsControllers } from "../../controllers/userManagement/jobPositions.controllers.js";

const router = express.Router();

router.post("/", JobPositionsControllers.create);
router.get("/", JobPositionsControllers.findAll);
router.get("/:id", JobPositionsControllers.findById);
router.put("/:id", JobPositionsControllers.update);
router.delete("/:id", JobPositionsControllers.delete);

export default router;
