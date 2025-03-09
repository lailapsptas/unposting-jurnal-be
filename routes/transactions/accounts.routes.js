import express from "express";
import { AccountsControllers } from "../../controllers/transactions/accounts.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.admin, AccountsControllers.create);
router.get("/", middleware.login, AccountsControllers.findAll);
router.get("/:id", middleware.login, AccountsControllers.findById);
router.put("/:id", middleware.admin, AccountsControllers.update);
router.delete("/:id", middleware.admin, AccountsControllers.delete);

export default router;
