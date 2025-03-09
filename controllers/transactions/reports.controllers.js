import { ReportsService } from "../../services/transactions/reports.services.js";

export class ReportsControllers {
  static reportsService = new ReportsService();

  static async create(req, res) {
    try {
      const report = await ReportsControllers.reportsService.create(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const reports = await ReportsControllers.reportsService.findAll();
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const report = await ReportsControllers.reportsService.findById(
        req.params.id
      );
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async downloadReport(req, res) {
    try {
      const report = await ReportsControllers.reportsService.findById(
        req.params.id
      );

      if (!report.data) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.data.fileData || !report.data.fileData.buffer) {
        return res.status(404).json({ message: "File data not found" });
      }

      const buffer = Buffer.from(report.data.fileData.buffer, "base64");

      res.setHeader("Content-Type", report.data.fileData.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${report.data.fileData.fileName}`
      );
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const report = await ReportsControllers.reportsService.delete(
        req.params.id
      );
      if (!report.data) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
