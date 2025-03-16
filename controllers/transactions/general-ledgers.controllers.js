import { GeneralLedgersService } from "../../services/transactions/general-ledgers.services.js";

export class GeneralLedgersControllers {
  static generalLedgersService = new GeneralLedgersService();

  static async create(req, res) {
    try {
      const generalLedger =
        await GeneralLedgersControllers.generalLedgersService.create(req.body);
      res.status(201).json(generalLedger);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const generalLedgers =
        await GeneralLedgersControllers.generalLedgersService.findAll();
      res.status(200).json(generalLedgers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const generalLedger =
        await GeneralLedgersControllers.generalLedgersService.findById(
          req.params.id
        );
      if (!generalLedger) {
        return res.status(404).json({ message: "General Ledger not found" });
      }
      res.status(200).json(generalLedger);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const generalLedger =
        await GeneralLedgersControllers.generalLedgersService.update(
          req.params.id,
          req.body
        );
      res.status(200).json(generalLedger);
    } catch (error) {
      if (error.message === "General Ledger not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response =
        await GeneralLedgersControllers.generalLedgersService.delete(
          req.params.id
        );
      res.status(200).json(response);
    } catch (error) {
      if (error.message === "General Ledger not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async updatePost(req, res) {
    try {
      const { id } = req.params;
      const result =
        await GeneralLedgersControllers.generalLedgersService.updatePost(id);

      if (result.status === "error") {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getMonthlyRecap(req, res) {
    try {
      const { year, month } = req.params;
      const recap =
        await GeneralLedgersControllers.generalLedgersService.getMonthlyRecap(
          year,
          month
        );
      res.status(200).json(recap);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
