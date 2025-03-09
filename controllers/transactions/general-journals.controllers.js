import { GeneralJournalsService } from "../../services/transactions/general-journals.services.js";

export class GeneralJournalsControllers {
  static generalJournalsService = new GeneralJournalsService();

  static async create(req, res) {
    try {
      const generalJournal =
        await GeneralJournalsControllers.generalJournalsService.create(
          req.body
        );
      res.status(201).json(generalJournal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const generalJournals =
        await GeneralJournalsControllers.generalJournalsService.findAll();
      res.status(200).json(generalJournals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const generalJournal =
        await GeneralJournalsControllers.generalJournalsService.findById(
          req.params.id
        );
      if (generalJournal.status === "error") {
        return res.status(404).json(generalJournal);
      }
      res.status(200).json(generalJournal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const generalJournal =
        await GeneralJournalsControllers.generalJournalsService.update(
          req.params.id,
          req.body
        );
      if (generalJournal.status === "error") {
        return res.status(404).json(generalJournal);
      }
      res.status(200).json(generalJournal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response =
        await GeneralJournalsControllers.generalJournalsService.delete(
          req.params.id
        );
      if (response.status === "error") {
        return res.status(404).json(response);
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createMultiple(req, res) {
    try {
      if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Input must be a non-empty array of journal entries",
        });
      }

      const result =
        await GeneralJournalsControllers.generalJournalsService.createMultiple(
          req.body
        );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to create multiple general journals",
      });
    }
  }

  static async updateMultiple(req, res) {
    try {
      const result =
        await GeneralJournalsControllers.generalJournalsService.updateMultiple(
          req.body
        );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createOrUpdateGeneralJournals(req, res) {
    try {
      const result =
        await GeneralJournalsControllers.generalJournalsService.createOrUpdateGeneralJournals(
          req.body
        );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
