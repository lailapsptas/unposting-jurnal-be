import { PostingsService } from "../../services/transactions/postings.services.js";

export class PostingsControllers {
  static postingsService = new PostingsService();

  static async createPosting(req, res) {
    try {
      const result = await PostingsControllers.postingsService.createPosting({
        ledger_id: req.body.ledger_id,
        posted_by: req.user.id,
      });

      if (result.status === "error") {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async unpostMonth(req, res) {
    try {
      const result = await PostingsControllers.postingsService.unpostMonth({
        month: parseInt(req.body.month),
        year: parseInt(req.body.year),
        unposted_by: req.user.id,
      });

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

  static async findAll(req, res) {
    try {
      const filters = {
        month: req.query.month ? parseInt(req.query.month) : null,
        year: req.query.year ? parseInt(req.query.year) : null,
        is_unposted:
          req.query.is_unposted !== undefined
            ? req.query.is_unposted === "true"
            : undefined,
      };

      const result = await PostingsControllers.postingsService.findAll(filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async findById(req, res) {
    try {
      const result = await PostingsControllers.postingsService.findById(
        parseInt(req.params.id)
      );

      if (result.status === "error") {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async getUnpostedLedgers(req, res) {
    try {
      const result =
        await PostingsControllers.postingsService.getUnpostedLedgers();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async getPostingReport(req, res) {
    try {
      const filters = {
        month: parseInt(req.query.month),
        year: parseInt(req.query.year),
      };

      const result = await PostingsControllers.postingsService.getPostingReport(
        filters
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
