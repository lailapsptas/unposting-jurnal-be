// routes/userManagement/users.routes.js
import express from "express";
import { UsersControllers } from "../../controllers/userManagement/users.controllers.js";

const router = express.Router();

router.post("/", UsersControllers.create);
router.get("/", UsersControllers.findAll);
router.get("/:id", UsersControllers.findById);
router.put("/:id", UsersControllers.update);
router.delete("/:id", UsersControllers.delete);

export default router;
