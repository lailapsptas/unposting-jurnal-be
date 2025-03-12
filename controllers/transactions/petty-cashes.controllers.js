import { PettyCashesService } from "../../services/transactions/petty-cashes.services.js";

export class PettyCashesControllers {
  static pettyCashesService = new PettyCashesService();

  static async create(req, res) {
    try {
      const result = await PettyCashesControllers.pettyCashesService.create(
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const result = await PettyCashesControllers.pettyCashesService.findAll();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const result = await PettyCashesControllers.pettyCashesService.findById(
        req.params.id
      );
      if (result.status === "error") {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const result = await PettyCashesControllers.pettyCashesService.update(
        req.params.id,
        req.body
      );
      if (result.status === "error") {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await PettyCashesControllers.pettyCashesService.delete(
        req.params.id
      );
      if (result.status === "error") {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async approvePettyCash(req, res) {
    try {
      const result =
        await PettyCashesControllers.pettyCashesService.approvePettyCash(
          req.params.id,
          req.body
        );

      if (result.status === "error") {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}
