// controllers/userManagement/users.controllers.js
import { UsersService } from "../../services/userManagement/users.services.js";

export class UsersControllers {
  static usersService = new UsersService();

  static async create(req, res) {
    try {
      const user = await UsersControllers.usersService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const users = await UsersControllers.usersService.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const user = await UsersControllers.usersService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User  not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const user = await UsersControllers.usersService.update(
        req.params.id,
        req.body
      );
      res.status(200).json(user);
    } catch (error) {
      if (error.message === "User  not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response = await UsersControllers.usersService.delete(
        req.params.id
      );
      res.status(200).json(response);
    } catch (error) {
      if (error.message === "User  not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}
