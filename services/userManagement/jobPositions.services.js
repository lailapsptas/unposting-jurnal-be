// services/userManagement/jobPositions.services.js
import db from "../../db/knex.js";

export class JobPositionsService {
  async create(data) {
    try {
      const { title, purpose } = data;
      const query = `
        INSERT INTO JobPositions (title, purpose)
        VALUES (?, ?)
        RETURNING *
      `;

      const result = await db.raw(query, [title, purpose]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating job position: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT * FROM JobPositions
        ORDER BY id ASC
      `;

      const result = await db.raw(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching job positions: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT * FROM JobPositions
        WHERE id = ?
      `;

      const result = await db.raw(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching job position: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const { title, purpose } = data;
      const query = `
        UPDATE JobPositions
        SET title = ?, purpose = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [title, purpose, id]);

      if (result.rows.length === 0) {
        throw new Error("Job position not found");
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating job position: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `
        DELETE FROM JobPositions
        WHERE id = ?
        RETURNING *
      `;

      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        throw new Error("Job position not found");
      }

      return { message: "Job position deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting job position: ${error.message}`);
    }
  }
}
