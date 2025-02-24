import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export class AuthMiddleware {
  verifyToken(req) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      throw new Error("No authorization header found");
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  login = (req, res, next) => {
    try {
      const decoded = this.verifyToken(req);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  admin = (req, res, next) => {
    try {
      const decoded = this.verifyToken(req);
      req.user = decoded;

      if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  hasPermission = (permission) => {
    return (req, res, next) => {
      try {
        const decoded = this.verifyToken(req);
        req.user = decoded;

        if (!req.user.permissions?.includes(permission)) {
          return res
            .status(403)
            .json({ message: `Required permission: ${permission}` });
        }
        next();
      } catch (error) {
        return res.status(401).json({ message: error.message });
      }
    };
  };
}

export const middleware = new AuthMiddleware();
