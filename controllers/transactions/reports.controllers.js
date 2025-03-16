import { ReportsService } from "../../services/transactions/reports.services.js";

export class ReportsControllers {
  static reportsService = new ReportsService();

  static async create(req, res) {
    try {
      const result = await ReportsControllers.reportsService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async findAll(req, res) {
    try {
      const result = await ReportsControllers.reportsService.findAll();
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
      const result = await ReportsControllers.reportsService.findById(
        req.params.id
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

  static async downloadReport(req, res) {
    try {
      const result = await ReportsControllers.reportsService.findById(
        req.params.id
      );

      if (result.status === "error" || !result.data) {
        return res.status(404).json({
          status: "error",
          message: "Report not found",
        });
      }

      if (!result.data.fileData || !result.data.fileData.buffer) {
        return res.status(404).json({
          status: "error",
          message: "File data not found",
        });
      }

      const buffer = Buffer.from(result.data.fileData.buffer, "base64");

      res.setHeader("Content-Type", result.data.fileData.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${result.data.fileData.fileName}`
      );

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const result = await ReportsControllers.reportsService.delete(
        req.params.id
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
}
