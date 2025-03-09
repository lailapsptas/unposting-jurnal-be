import db from "../../db/knex.js";

export class PettyCashesService {
  async create(data) {
    try {
      const {
        ledger_id,
        account_code,
        description,
        transaction_date,
        debit,
        credit,
        balance,
        isapproved,
        approved_date,
      } = data;
      const query = `
        INSERT INTO "PettyCashes" (ledger_id, account_code, description, transaction_date, debit, credit, balance, "createdAt", "updatedAt", isapproved, approved_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
        RETURNING *
      `;

      const result = await db.raw(query, [
        ledger_id,
        account_code,
        description,
        transaction_date,
        debit,
        credit,
        balance,
        isapproved,
        approved_date,
      ]);
      return {
        status: "success",
        message: "Petty cash created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating petty cash: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `SELECT * FROM "PettyCashes" ORDER BY id ASC`;
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
      const query = `SELECT * FROM "PettyCashes" WHERE id = ?`;
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
      const updateFields = [];
      const values = [];

      if (data.ledger_id) {
        updateFields.push(`ledger_id = ?`);
        values.push(data.ledger_id);
      }
      if (data.account_code) {
        updateFields.push(`account_code = ?`);
        values.push(data.account_code);
      }
      if (data.description) {
        updateFields.push(`description = ?`);
        values.push(data.description);
      }
      if (data.transaction_date) {
        updateFields.push(`transaction_date = ?`);
        values.push(data.transaction_date);
      }
      if (data.debit) {
        updateFields.push(`debit = ?`);
        values.push(data.debit);
      }
      if (data.credit) {
        updateFields.push(`credit = ?`);
        values.push(data.credit);
      }
      if (data.balance) {
        updateFields.push(`balance = ?`);
        values.push(data.balance);
      }
      if (data.isapproved !== undefined) {
        updateFields.push(`isapproved = ?`);
        values.push(data.isapproved);
      }
      if (data.approved_date) {
        updateFields.push(`approved_date = ?`);
        values.push(data.approved_date);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "PettyCashes" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);
      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Petty cash not found",
        };
      }

      return {
        status: "success",
        message: "Petty cash updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating petty cash: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM "PettyCashes" WHERE id = ? RETURNING *`;
      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "Petty cash not found",
        };
      }

      return {
        status: "success",
        message: "Petty cash deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting petty cash: ${error.message}`);
    }
  }

  async createOrUpdatePettyCashes(data) {
    try {
      const { transaction_date, createEntries = [], updateEntries = [] } = data;

      if (!transaction_date) {
        throw new Error("Missing required field: transaction_date");
      }

      if (!Array.isArray(createEntries) || !Array.isArray(updateEntries)) {
        throw new Error("createEntries and updateEntries must be arrays");
      }

      const safeParseFloat = (value) => {
        const stringValue = String(value || "0").replace(/,/g, ".");
        const numValue = parseFloat(stringValue);
        return isNaN(numValue) ? 0 : Number(numValue.toFixed(2));
      };

      const createdEntries = [];
      const updatedEntries = [];

      await db.transaction(async (trx) => {
        if (updateEntries.length > 0) {
          for (const entry of updateEntries) {
            if (!entry.id) {
              throw new Error("Missing ID in update entries");
            }

            const currentEntryQuery = `
              SELECT id, debit, credit, balance FROM "PettyCashes"
              WHERE id = ?
            `;
            const currentEntryResult = await trx.raw(currentEntryQuery, [
              entry.id,
            ]);

            if (currentEntryResult.rows.length === 0) {
              throw new Error(`Entry with id ${entry.id} not found`);
            }

            const currentEntry = currentEntryResult.rows[0];

            const debit =
              entry.debit !== undefined
                ? safeParseFloat(entry.debit)
                : currentEntry.debit;
            const credit =
              entry.credit !== undefined
                ? safeParseFloat(entry.credit)
                : currentEntry.credit;

            if (debit !== 0 && credit !== 0) {
              throw new Error(
                "Only one of debit or credit should have non-zero value in each entry"
              );
            }

            const updateFields = [];
            const values = [];

            if (entry.account_code) {
              updateFields.push(`account_code = ?`);
              values.push(entry.account_code);
            }

            if (entry.description !== undefined) {
              updateFields.push(`description = ?`);
              values.push(entry.description);
            }

            if (entry.transaction_date) {
              updateFields.push(`transaction_date = ?`);
              values.push(entry.transaction_date);
            }

            if (debit !== null) {
              updateFields.push(`debit = ?`);
              values.push(debit);
            }

            if (credit !== null) {
              updateFields.push(`credit = ?`);
              values.push(credit);
            }

            if (updateFields.length > 0) {
              updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
            } else {
              continue;
            }

            values.push(entry.id);

            const updateQuery = `
              UPDATE "PettyCashes" 
              SET ${updateFields.join(", ")}
              WHERE id = ?
              RETURNING *
            `;

            const updateResult = await trx.raw(updateQuery, values);

            if (updateResult.rows.length === 0) {
              throw new Error(`Failed to update entry with id ${entry.id}`);
            }

            updatedEntries.push(...updateResult.rows);
          }
        }

        if (createEntries.length > 0) {
          const validatedCreateData = createEntries.map((entry) => {
            if (!entry.account_code || !entry.transaction_date) {
              throw new Error("Missing required fields in create entries");
            }

            const debit = safeParseFloat(entry.debit);
            const credit = safeParseFloat(entry.credit);

            if (debit !== 0 && credit !== 0) {
              throw new Error(
                "Only one of debit or credit should be provided in each entry"
              );
            }

            return {
              account_code: entry.account_code,
              description: entry.description || null,
              transaction_date: entry.transaction_date,
              debit: debit,
              credit: credit,
              balance: 0,
            };
          });

          const createQuery = `
            INSERT INTO "PettyCashes" (
              account_code, 
              description, 
              transaction_date, 
              debit, 
              credit,
              balance,
              "createdAt"
            )
            VALUES ${validatedCreateData
              .map(() => "(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
              .join(", ")}
            RETURNING *
          `;

          const createValues = validatedCreateData.flatMap((entry) => [
            entry.account_code,
            entry.description,
            entry.transaction_date,
            entry.debit,
            entry.credit,
            entry.balance,
          ]);

          const createResult = await trx.raw(createQuery, createValues);
          createdEntries.push(...createResult.rows);
        }

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
          const entryDebit = safeParseFloat(entry.debit);
          const entryCredit = safeParseFloat(entry.credit);

          currentBalance = safeParseFloat(
            currentBalance + entryDebit - entryCredit
          );

          await trx.raw(`UPDATE "PettyCashes" SET balance = ? WHERE id = ?`, [
            currentBalance,
            entry.id,
          ]);
        }
      });

      return {
        status: "success",
        message: "Petty cashes created and updated successfully",
        data: {
          created: createdEntries,
          updated: updatedEntries,
        },
      };
    } catch (error) {
      throw new Error(
        `Error creating or updating petty cashes: ${error.message}`
      );
    }
  }

  async approvedPettyCash(id, approvedData) {
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
