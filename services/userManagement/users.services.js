// services/userManagement/users.services.js
import db from "../../db/knex.js";

export class UsersService {
  async create(data) {
    try {
      const { username, fullname, email, password, role_id, jobPosition_id } =
        data;
      const query = `
        INSERT INTO Users (username, fullname, email, password, role_id, jobPosition_id)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
      `;

      const result = await db.raw(query, [
        username,
        fullname,
        email,
        password,
        role_id,
        jobPosition_id,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT * FROM Users
        ORDER BY id ASC
      `;

      const result = await db.raw(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT * FROM Users
        WHERE id = ?
      `;

      const result = await db.raw(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const { username, fullname, email, password, role_id, jobPosition_id } =
        data;
      const query = `
        UPDATE Users
        SET username = ?, fullname = ?, email = ?, password = ?, role_id = ?, jobPosition_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [
        username,
        fullname,
        email,
        password,
        role_id,
        jobPosition_id,
        id,
      ]);

      if (result.rows.length === 0) {
        throw new Error("User  not found");
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `
        DELETE FROM Users
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        throw new Error("User  not found");
      }

      return { message: "User  deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}
