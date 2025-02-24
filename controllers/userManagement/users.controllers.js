import { UsersService } from "../../services/userManagement/users.services.js";

export class UsersControllers {
  static usersService = new UsersService();

  static async create(req, res) {
    try {
      const userData = req.body;
      const result = await UsersControllers.usersService.create(userData);

      if (result.status === "error") {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  static async findAll(req, res) {
    try {
      const users = await UsersControllers.usersService.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async findById(req, res) {
    try {
      const user = await UsersControllers.usersService.findById(req.params.id);
      if (user.status === "error") {
        return res.status(404).json(user);
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const user = await UsersControllers.usersService.update(
        req.params.id,
        req.body
      );
      if (user.status === "error") {
        return res.status(404).json(user);
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const response = await UsersControllers.usersService.delete(
        req.params.id
      );
      if (response.status === "error") {
        return res.status(404).json(response);
      }
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}
