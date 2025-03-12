import db from "../../db/knex.js";

export class PettyCashesService {
  // Helper function to safely parse float values
  safeParseFloat(value) {
    const stringValue = String(value || "0").replace(/,/g, ".");
    const numValue = parseFloat(stringValue);
    return isNaN(numValue) ? 0 : Number(numValue.toFixed(2));
  }

  // Helper function to validate debit and credit
  validateDebitCredit(debit, credit) {
    debit = this.safeParseFloat(debit);
    credit = this.safeParseFloat(credit);

    if (debit !== 0 && credit !== 0) {
      throw new Error("Only one of debit or credit should have non-zero value");
    }

    return { debit, credit };
  }

  // Helper function to update balance for all entries on a specific date
  async updateBalanceForDate(transaction_date, trx) {
    const getAllEntriesQuery = `
      SELECT id, debit, credit
      FROM "PettyCashes"
      WHERE transaction_date = ?
      ORDER BY id ASC
    `;

    const allEntriesResult = await trx.raw(getAllEntriesQuery, [
      transaction_date,
    ]);
    const allEntries = allEntriesResult.rows;

    let currentBalance = 0;

    for (const entry of allEntries) {
      const entryDebit = this.safeParseFloat(entry.debit);
      const entryCredit = this.safeParseFloat(entry.credit);

      currentBalance = this.safeParseFloat(
        currentBalance + entryDebit - entryCredit
      );

      await trx.raw(`UPDATE "PettyCashes" SET balance = ? WHERE id = ?`, [
        currentBalance,
        entry.id,
      ]);
    }

    return currentBalance;
  }

  async create(data) {
    try {
      const {
        ledger_id,
        account_code,
        description,
        transaction_date,
        debit,
        credit,
        user_id,
      } = data;

      // Validate required fields
      if (!account_code || !transaction_date) {
        throw new Error(
          "Missing required fields: account_code and transaction_date are required"
        );
      }

      // Check if user_id is provided
      if (!user_id) {
        throw new Error("user_id is required");
      }

      // Validate debit and credit
      const { debit: validatedDebit, credit: validatedCredit } =
        this.validateDebitCredit(debit, credit);

      return await db.transaction(async (trx) => {
        // Insert the new entry with initial balance of 0
        const createQuery = `
          INSERT INTO "PettyCashes" (
            ledger_id, 
            account_code, 
            description, 
            transaction_date, 
            debit, 
            credit,
            balance,
            user_id,
            "createdAt",
            "updatedAt",
            isapproved,
            approved_date
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
          RETURNING *
        `;

        const createResult = await trx.raw(createQuery, [
          ledger_id || null,
          account_code,
          description || null,
          transaction_date,
          validatedDebit,
          validatedCredit,
          0, // Initial balance will be calculated
          user_id,
          data.isapproved || false,
          data.approved_date || null,
        ]);

        // Update balances for all entries on this date
        await this.updateBalanceForDate(transaction_date, trx);

        return {
          status: "success",
          message: "Petty cash created successfully",
          data: createResult.rows[0],
        };
      });
    } catch (error) {
      throw new Error(`Error creating petty cash: ${error.message}`);
    }
  }

  async findAll() {
    try {
      // Mengasumsikan bahwa nama kolom foreign key yang benar adalah "user_id" bukan "users_id"
      const query = `
        SELECT 
          "PettyCashes".*,
          json_build_array(
            json_build_object(
              'id', "Users".id,
              'name', "Users".full_name,
              'email', "Users".email
            )
          ) as users
        FROM "PettyCashes"
        LEFT JOIN "Users" ON "PettyCashes"."user_id" = "Users".id
        ORDER BY "PettyCashes".id ASC
      `;

      const result = await db.raw(query);

      return {
        status: "success",
        message: "Petty cashes fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching petty cashes: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      // Modified query without using the "name" alias
      const query = `
        SELECT 
          "PettyCashes".*,
          json_build_array(
            json_build_object(
              'id', "Users".id,
              'name', "Users".full_name,
              'email', "Users".email
            )
          ) as users
        FROM "PettyCashes"
        LEFT JOIN "Users" ON "PettyCashes".user_id = "Users".id
        WHERE "PettyCashes".id = ?
      `;

      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Petty cash not found",
          data: null,
        };
      }

      return {
        status: "success",
        message: "Petty cash fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error fetching petty cash: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await db.transaction(async (trx) => {
        // First get the current entry to check if it exists and get its current transaction_date
        const currentEntryQuery = `
          SELECT * FROM "PettyCashes"
          WHERE id = ?
        `;
        const currentEntryResult = await trx.raw(currentEntryQuery, [id]);

        if (currentEntryResult.rows.length === 0) {
          return {
            status: "error",
            message: "Petty cash not found",
          };
        }

        const currentEntry = currentEntryResult.rows[0];
        const oldTransactionDate = currentEntry.transaction_date;
        const updateFields = [];
        const values = [];

        // Handle each possible field update
        if (data.ledger_id) {
          updateFields.push(`ledger_id = ?`);
          values.push(data.ledger_id);
        }

        if (data.account_code) {
          updateFields.push(`account_code = ?`);
          values.push(data.account_code);
        }

        if (data.description !== undefined) {
          updateFields.push(`description = ?`);
          values.push(data.description);
        }

        if (data.transaction_date) {
          updateFields.push(`transaction_date = ?`);
          values.push(data.transaction_date);
        }

        // Handle debit and credit with validation
        let debit = currentEntry.debit;
        let credit = currentEntry.credit;

        if (data.debit !== undefined || data.credit !== undefined) {
          const newDebit =
            data.debit !== undefined ? data.debit : currentEntry.debit;
          const newCredit =
            data.credit !== undefined ? data.credit : currentEntry.credit;

          const validated = this.validateDebitCredit(newDebit, newCredit);
          debit = validated.debit;
          credit = validated.credit;

          updateFields.push(`debit = ?`);
          values.push(debit);
          updateFields.push(`credit = ?`);
          values.push(credit);
        }

        if (data.isapproved !== undefined) {
          updateFields.push(`isapproved = ?`);
          values.push(data.isapproved);
        }

        if (data.approved_date) {
          updateFields.push(`approved_date = ?`);
          values.push(data.approved_date);
        }

        if (data.user_id) {
          updateFields.push(`user_id = ?`);
          values.push(data.user_id);
        }

        updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

        if (updateFields.length === 0) {
          return {
            status: "error",
            message: "No fields to update",
          };
        }

        // Update the entry
        const query = `
          UPDATE "PettyCashes" 
          SET ${updateFields.join(", ")}
          WHERE id = ?
          RETURNING *
        `;

        values.push(id);
        const result = await trx.raw(query, values);

        if (result.rows.length === 0) {
          return {
            status: "error",
            message: "Failed to update petty cash",
          };
        }

        // Update balances for all entries on the affected dates
        const newTransactionDate = data.transaction_date || oldTransactionDate;

        // If transaction date changed, update balances for both old and new dates
        if (
          data.transaction_date &&
          data.transaction_date !== oldTransactionDate
        ) {
          await this.updateBalanceForDate(oldTransactionDate, trx);
        }

        await this.updateBalanceForDate(newTransactionDate, trx);

        return {
          status: "success",
          message: "Petty cash updated successfully",
          data: result.rows[0],
        };
      });
    } catch (error) {
      throw new Error(`Error updating petty cash: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await db.transaction(async (trx) => {
        // First get the transaction date of the entry
        const getDateQuery = `SELECT transaction_date FROM "PettyCashes" WHERE id = ?`;
        const dateResult = await trx.raw(getDateQuery, [id]);

        if (dateResult.rows.length === 0) {
          return {
            status: "error",
            message: "Petty cash not found",
          };
        }

        const transactionDate = dateResult.rows[0].transaction_date;

        // Delete the entry
        const query = `DELETE FROM "PettyCashes" WHERE id = ? RETURNING *`;
        const result = await trx.raw(query, [id]);

        if (result.rows.length === 0) {
          return {
            status: "error",
            message: "Failed to delete petty cash",
          };
        }

        // Update balances for remaining entries on this date
        await this.updateBalanceForDate(transactionDate, trx);

        return {
          status: "success",
          message: "Petty cash deleted successfully",
        };
      });
    } catch (error) {
      throw new Error(`Error deleting petty cash: ${error.message}`);
    }
  }

  async approvePettyCash(id, approvedData) {
    try {
      const { isapproved } = approvedData;

      if (isapproved !== true) {
        return {
          status: "error",
          message: "isapproved must be true for posting",
        };
      }

      const today = new Date();
      const approved_date = today.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }); // Format: YYYY-MM-DD

      return await db.transaction(async (trx) => {
        const pettyCashQuery = `SELECT * FROM "PettyCashes" WHERE id = ?`;
        const pettyCashResult = await trx.raw(pettyCashQuery, [id]);

        if (pettyCashResult.rows.length === 0) {
          throw new Error("Petty cash record not found");
        }

        const pettyCash = pettyCashResult.rows[0];

        if (pettyCash.isapproved) {
          return {
            status: "error",
            message: "Petty cash record is already approved",
          };
        }

        const ledgerQuery = `
          SELECT DISTINCT "GeneralLedgers".id 
          FROM "GeneralLedgers" 
          INNER JOIN "GeneralJournals" ON "GeneralLedgers".id = "GeneralJournals".ledger_id
          WHERE "GeneralJournals".transaction_date = ?
          LIMIT 1
        `;
        const ledgerResult = await trx.raw(ledgerQuery, [approved_date]);

        if (ledgerResult.rows.length === 0) {
          throw new Error(
            `No ledger found for approved date: ${approved_date}`
          );
        }

        const ledger_id = ledgerResult.rows[0].id;

        const updateQuery = `
          UPDATE "PettyCashes"
          SET isapproved = ?, approved_date = ?, ledger_id = ?, "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = ?
          RETURNING *
        `;

        const updateResult = await trx.raw(updateQuery, [
          true,
          approved_date,
          ledger_id,
          id,
        ]);

        if (updateResult.rows.length === 0) {
          throw new Error("Failed to update petty cash record");
        }

        const balanceQuery = `
          SELECT balance FROM "GeneralJournals"
          WHERE ledger_id = ?
          ORDER BY id DESC LIMIT 1
        `;

        const balanceResult = await trx.raw(balanceQuery, [ledger_id]);
        let previousBalance = 0;

        if (balanceResult.rows.length > 0) {
          previousBalance = parseFloat(balanceResult.rows[0].balance);
        }

        const newBalance =
          pettyCash.debit > 0
            ? previousBalance + parseFloat(pettyCash.debit)
            : previousBalance - parseFloat(pettyCash.credit);

        const insertJournalQuery = `
          INSERT INTO "GeneralJournals" (
            ledger_id,
            account_code,
            description,
            transaction_date,
            debit,
            credit,
            balance,
            "createdAt",
            "updatedAt",
            pettycash_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
          RETURNING *
        `;

        const journalResult = await trx.raw(insertJournalQuery, [
          ledger_id,
          pettyCash.account_code,
          pettyCash.description,
          approved_date,
          pettyCash.debit,
          pettyCash.credit,
          newBalance.toFixed(2),
          id,
        ]);

        return {
          status: "success",
          message: "Petty cash posted successfully to general journal",
          data: {
            pettyCash: updateResult.rows[0],
            generalJournal: journalResult.rows[0],
          },
        };
      });
    } catch (error) {
      return {
        status: "error",
        message: `Error posting petty cash: ${error.message}`,
      };
    }
  }
}
