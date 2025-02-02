import db from "../../db/knex.js";

export class RolesService {
  async create(data) {
    try {
      const { name, description } = data;
      const query = `
        INSERT INTO Roles (name, description)
        VALUES (?, ?)
        RETURNING *
      `;

      const result = await db.raw(query, [name, description]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT * FROM Roles
        ORDER BY id ASC
      `;

      const result = await db.raw(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT * FROM Roles
        WHERE id = ?
      `;

      const result = await db.raw(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const { name, description } = data;
      const query = `
        UPDATE Roles
        SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [name, description, id]);

      if (result.rows.length === 0) {
        throw new Error("Role not found");
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `
        DELETE FROM Roles
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        throw new Error("Role not found");
      }

      return { message: "Role deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }
}
