import express from "express";

import RolesRoute from "../routes/userManagement/roles.routes.js";
import JobPositionsRoute from "../routes/userManagement/jobPositions.routes.js";
import UsersRoute from "../routes/userManagement/users.routes.js";
import AccountsRoute from "../routes/transactions/accounts.routes.js";
import ReportsRoute from "../routes/transactions/reports.routes.js";
import GeneralLedgersRoute from "../routes/transactions/general-ledgers.routes.js";
import GeneralJournalsRoute from "../routes/transactions/general-journals.routes.js";
import PettyCashesRoute from "../routes/transactions/petty-cashes.routes.js";
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

// Transactions routes
router.use("/accounts", AccountsRoute);
router.use("/reports", ReportsRoute);
router.use("/general-ledgers", GeneralLedgersRoute);
router.use("/general-journals", GeneralJournalsRoute);
router.use("/petty-cash", PettyCashesRoute);

export default router;
