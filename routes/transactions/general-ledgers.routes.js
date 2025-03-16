import express from "express";
import { GeneralLedgersControllers } from "../../controllers/transactions/general-ledgers.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.login, GeneralLedgersControllers.create);
router.get("/", middleware.login, GeneralLedgersControllers.findAll);
router.get("/:id", middleware.login, GeneralLedgersControllers.findById);
router.put("/:id", middleware.login, GeneralLedgersControllers.update);
router.delete("/:id", middleware.login, GeneralLedgersControllers.delete);
router.put("/post/:id", middleware.login, GeneralLedgersControllers.updatePost);

router.get(
  "/recap/:year/:month",
  middleware.login,
  GeneralLedgersControllers.getMonthlyRecap
);
export default router;
