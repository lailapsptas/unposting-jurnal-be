import { UsersService } from "../../services/userManagement/users.services.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    const usersService = new UsersService();

    try {
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        });
      }

      // Find user by email
      const userResult = await usersService.findByEmail(email);

      if (!userResult.data) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      const user = userResult.data;

      // Compare password
      const isPasswordValid = await usersService.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "6h" }
      );

      // Remove sensitive data from response
      delete user.password;

      return res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role_id: user.role_id,
          },
          token: token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred during login",
      });
    }
  }

  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          status: "error",
          message: "No token provided",
        });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          status: "error",
          message: "Invalid token format",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Add token to blacklist (if you have a blacklist service)
      // await TokenBlacklistService.addToBlacklist(token);

      return res.status(200).json({
        status: "success",
        message: "Logout successful",
        data: {
          user_id: decoded.id,
          full_name: decoded.full_name,
          logout_time: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }
      return res.status(500).json({
        status: "error",
        message: "An error occurred during logout",
      });
    }
  }
}
