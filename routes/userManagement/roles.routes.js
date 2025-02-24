import express from "express";
import { RolesControllers } from "../../controllers/userManagement/roles.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, RolesControllers.create);
router.get("/", middleware.login, RolesControllers.findAll);
router.get("/:id", middleware.login, RolesControllers.findById);
router.put("/:id", middleware.admin, RolesControllers.update);
router.delete("/:id", middleware.admin, RolesControllers.delete);

export default router;
