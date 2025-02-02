// roles.routes.js
import express from "express";
import { RolesControllers } from "../../controllers/userManagement/roles.controllers.js";

const router = express.Router();

router.post("/", RolesControllers.create);
router.get("/", RolesControllers.findAll);
router.get("/:id", RolesControllers.findById);
router.put("/:id", RolesControllers.update);
router.delete("/:id", RolesControllers.delete);

export default router;
