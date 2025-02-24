import db from "../../db/knex.js";
import bcrypt from "bcryptjs";

export class UsersService {
  async create(data) {
    try {
      const { username, full_name, email, password, role_id, jobPosition_id } =
        data;
      const saltRounds = 15;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO "Users" (username, full_name, email, password, role_id, "jobPosition_id", "createdAt")
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.raw(query, [
        username,
        full_name,
        email,
        hashedPassword,
        role_id,
        jobPosition_id,
      ]);

      return {
        status: "success",
        message: "User created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error creating user: ${error.message}`,
      };
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT "Users".*, "Roles".name AS role_name, "JobPositions".title AS job_position_title
        FROM "Users" 
        LEFT JOIN "Roles" ON "Users".role_id = "Roles".id
        LEFT JOIN "JobPositions" ON "Users"."jobPosition_id" = "JobPositions".id
        ORDER BY "Users".id ASC
      `;

      const result = await db.raw(query);
      return {
        status: "success",
        message: "Users fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error fetching users: ${error.message}`,
      };
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT "Users".*, "Roles".name AS role_name, "JobPositions".title AS job_position_title
        FROM "Users" 
        LEFT JOIN "Roles" ON "Users".role_id = "Roles".id
        LEFT JOIN "JobPositions" ON "Users"."jobPosition_id" = "JobPositions".id
        WHERE "Users".id = ?
      `;

      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "User not found",
          data: null,
        };
      }

      return {
        status: "success",
        message: "User fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error fetching user: ${error.message}`,
      };
    }
  }

  async findByEmail(email) {
    try {
      const query = `SELECT * FROM "Users" WHERE email = ?`;
      const result = await db.raw(query, [email]);

      return {
        status: "success",
        message: "User fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error fetching user by email: ${error.message}`,
      };
    }
  }

  async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.username) {
        updateFields.push(`username = ?`);
        values.push(data.username);
      }
      if (data.full_name) {
        updateFields.push(`full_name = ?`);
        values.push(data.full_name);
      }
      if (data.email) {
        updateFields.push(`email = ?`);
        values.push(data.email);
      }
      if (data.password) {
        const saltRounds = 15;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        updateFields.push(`password = ?`);
        values.push(hashedPassword);
      }
      if (data.role_id) {
        updateFields.push(`role_id = ?`);
        values.push(data.role_id);
      }
      if (data.jobPosition_id) {
        updateFields.push(`"jobPosition_id" = ?`);
        values.push(data.jobPosition_id);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "Users" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;
      values.push(id);

      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      return {
        status: "success",
        message: "User updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error updating user: ${error.message}`,
      };
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM "Users" WHERE id = ? RETURNING *`;
      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "User not found",
        };
      }

      return {
        status: "success",
        message: "User deleted successfully",
      };
    } catch (error) {
      return {
        status: "error",
        message: `Error deleting user: ${error.message}`,
      };
    }
  }

  async comparePassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
}
