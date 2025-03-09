import express from "express";
import { GeneralJournalsControllers } from "../../controllers/transactions/general-journals.controllers.js";
import { middleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", middleware.login, GeneralJournalsControllers.create);
router.get("/", middleware.login, GeneralJournalsControllers.findAll);
router.get("/:id", middleware.login, GeneralJournalsControllers.findById);
router.put("/:id", middleware.login, GeneralJournalsControllers.update);
router.delete("/:id", middleware.login, GeneralJournalsControllers.delete);
router.post(
  "/create-multiple",
  middleware.login,
  GeneralJournalsControllers.createMultiple
);
router.put(
  "/update-multiple",
  middleware.login,
  GeneralJournalsControllers.updateMultiple
);
router.post(
  "/create-or-update",
  middleware.login,
  GeneralJournalsControllers.createOrUpdateGeneralJournals
);

export default router;
