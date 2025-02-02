// routes/base.routes.js
import express from "express";
import RolesRoute from "../routes/userManagement/roles.routes.js";
import JobPositionsRoute from "../routes/userManagement/jobPositions.routes.js";
import UsersRoute from "../routes/userManagement/users.routes.js"; // Import Users routes
import { BaseController } from "../controllers/base.controllers.js";

const router = express.Router();

router.get("/", BaseController.getMessage);
router.use("/roles", RolesRoute);
router.use("/jobpositions", JobPositionsRoute);
router.use("/users", UsersRoute);

export default router;
