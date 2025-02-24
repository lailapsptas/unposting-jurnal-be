import db from "../../db/knex.js";

export class RolesService {
  async create(data) {
    try {
      const { name, description } = data;
      const query = `
        INSERT INTO "Roles" (name, description, "createdAt")
        VALUES (?, ?, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.raw(query, [name, description]);

      return {
        status: "success",
        message: "Role created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT * FROM "Roles"
        ORDER BY id ASC
      `;

      const result = await db.raw(query);

      return {
        status: "success",
        message: "Roles fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT * FROM "Roles"
        WHERE id = ?
      `;

      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Role not found",
          data: null,
        };
      }

      return {
        status: "success",
        message: "Role fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.name) {
        updateFields.push(`name = ?`);
        values.push(data.name);
      }

      if (data.description) {
        updateFields.push(`description = ?`);
        values.push(data.description);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "Roles" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);
      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Role not found",
        };
      }

      return {
        status: "success",
        message: "Role updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `
        DELETE FROM "Roles"
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Role not found",
        };
      }

      return {
        status: "success",
        message: "Role deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }
}
