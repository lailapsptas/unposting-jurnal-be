import express from "express";
import { PettyCashesControllers } from "../../controllers/transactions/petty-cashes.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.login, PettyCashesControllers.create);
router.get("/", middleware.login, PettyCashesControllers.findAll);
router.get("/:id", middleware.login, PettyCashesControllers.findById);
router.put("/:id", middleware.login, PettyCashesControllers.update);
router.delete("/:id", middleware.login, PettyCashesControllers.delete);
router.post(
  "/approve/:id",
  middleware.login,
  PettyCashesControllers.approvePettyCash
);

export default router;
