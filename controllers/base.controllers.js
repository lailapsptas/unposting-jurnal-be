// controllers/base.controllers.js
import { BaseService } from "../services/base.services.js";

export class BaseController {
  static baseService = new BaseService();

  static async getMessage(req, res) {
    try {
      const message = await baseService.getMessage();
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
