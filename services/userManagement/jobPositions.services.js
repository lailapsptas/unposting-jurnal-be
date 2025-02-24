import db from "../../db/knex.js";

export class JobPositionsService {
  async create(data) {
    try {
      const { title, purpose } = data;
      const query = `
        INSERT INTO "JobPositions" (title, purpose, "createdAt")
        VALUES (?, ?, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.raw(query, [title, purpose]);

      return {
        status: "success",
        message: "Job position created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating job position: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT * FROM "JobPositions"
        ORDER BY id ASC
      `;

      const result = await db.raw(query);

      return {
        status: "success",
        message: "Job positions fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching job positions: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT * FROM "JobPositions"
        WHERE id = ?
      `;

      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Job position not found",
          data: null,
        };
      }

      return {
        status: "success",
        message: "Job position fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error fetching job position: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.title) {
        updateFields.push("title = ?");
        values.push(data.title);
      }

      if (data.purpose) {
        updateFields.push("purpose = ?");
        values.push(data.purpose);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "JobPositions" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);
      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Job position not found",
        };
      }

      return {
        status: "success",
        message: "Job position updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating job position: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `
        DELETE FROM "JobPositions"
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Job position not found",
        };
      }

      return {
        status: "success",
        message: "Job position deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting job position: ${error.message}`);
    }
  }
}
