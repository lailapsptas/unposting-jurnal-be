// roles.controllers.js
import { RolesService } from "../../services/userManagement/roles.services.js";

export class RolesControllers {
  static rolesService = new RolesService();

  static async create(req, res) {
    try {
      const role = await RolesControllers.rolesService.create(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const roles = await RolesControllers.rolesService.findAll();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const role = await RolesControllers.rolesService.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const role = await RolesControllers.rolesService.update(
        req.params.id,
        req.body
      );
      res.status(200).json(role);
    } catch (error) {
      if (error.message === "Role not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response = await RolesControllers.rolesService.delete(
        req.params.id
      );
      res.status(200).json(response);
    } catch (error) {
      if (error.message === "Role not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}
