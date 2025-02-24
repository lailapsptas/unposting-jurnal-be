import express from "express";
import { UsersControllers } from "../../controllers/userManagement/users.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, UsersControllers.create);
router.get("/", middleware.login, UsersControllers.findAll);
router.get("/:id", middleware.login, UsersControllers.findById);
router.put("/:id", middleware.admin, UsersControllers.update);
router.delete("/:id", middleware.admin, UsersControllers.delete);

export default router;
