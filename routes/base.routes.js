import express from "express";

import RolesRoute from "../routes/userManagement/roles.routes.js";
import JobPositionsRoute from "../routes/userManagement/jobPositions.routes.js";
import UsersRoute from "../routes/userManagement/users.routes.js";
import { BaseController } from "../controllers/base.controllers.js";
import { AuthController } from "../controllers/authentication/auth.controllers.js";

const router = express.Router();

// Base routes
router.get("/", BaseController.getMessage);

// Authentication routes
router.post("/auth/login", AuthController.login);
router.post("/auth/logout", AuthController.logout);

// User management routes
router.use("/roles", RolesRoute);
router.use("/job-positions", JobPositionsRoute);
router.use("/users", UsersRoute);

export default router;
