// controllers/userManagement/jobPositions.controllers.js
import { JobPositionsService } from "../../services/userManagement/jobPositions.services.js";

export class JobPositionsControllers {
  static jobPositionsService = new JobPositionsService();

  static async create(req, res) {
    try {
      const jobPosition =
        await JobPositionsControllers.jobPositionsService.create(req.body);
      res.status(201).json(jobPosition);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const jobPositions =
        await JobPositionsControllers.jobPositionsService.findAll();
      res.status(200).json(jobPositions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const jobPosition =
        await JobPositionsControllers.jobPositionsService.findById(
          req.params.id
        );
      if (!jobPosition) {
        return res.status(404).json({ message: "Job position not found" });
      }
      res.status(200).json(jobPosition);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const jobPosition =
        await JobPositionsControllers.jobPositionsService.update(
          req.params.id,
          req.body
        );
      res.status(200).json(jobPosition);
    } catch (error) {
      if (error.message === "Job position not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response = await JobPositionsControllers.jobPositionsService.delete(
        req.params.id
      );
      res.status(200).json(response);
    } catch (error) {
      if (error.message === "Job position not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}
