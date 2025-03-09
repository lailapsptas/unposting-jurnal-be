import db from "../../db/knex.js";

export class AccountsService {
  async create(data) {
    try {
      const { code, name, description, account_type, currency } = data;
      const query = `
        INSERT INTO "Accounts" (code, name, description, account_type, currency, active, "createdAt")
        VALUES (?, ?, ?, ?, ?, true, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.raw(query, [
        code,
        name,
        description,
        account_type,
        currency,
      ]);
      return {
        status: "success",
        message: "Account created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating account: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `SELECT * FROM "Accounts" ORDER BY id ASC`;
      const result = await db.raw(query);
      return {
        status: "success",
        message: "Accounts fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching accounts: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `SELECT * FROM "Accounts" WHERE id = ?`;
      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Account not found",
          data: null,
        };
      }
      return {
        status: "success",
        message: "Account fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error fetching account: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.code) {
        updateFields.push(`code = ?`);
        values.push(data.code);
      }
      if (data.name) {
        updateFields.push(`name = ?`);
        values.push(data.name);
      }
      if (data.description) {
        updateFields.push(`description = ?`);
        values.push(data.description);
      }
      if (data.account_type) {
        updateFields.push(`account_type = ?`);
        values.push(data.account_type);
      }
      if (data.currency) {
        updateFields.push(`currency = ?`);
        values.push(data.currency);
      }
      if (data.active !== undefined) {
        updateFields.push(`active = ?`);
        values.push(data.active);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "Accounts" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);
      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Account not found",
        };
      }

      return {
        status: "success",
        message: "Account updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating account: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM "Accounts" WHERE id = ? RETURNING *`;
      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Account not found",
        };
      }

      return {
        status: "success",
        message: "Account deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting account: ${error.message}`);
    }
  }
}
