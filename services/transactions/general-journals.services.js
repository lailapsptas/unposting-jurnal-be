import db from "../../db/knex.js";
import { GeneralLedgersService } from "./general-ledgers.services.js";

export class GeneralJournalsService {
  constructor() {
    this.generalLedgersService = new GeneralLedgersService();
  }

  async create(data) {
    try {
      const {
        ledger_id,
        account_code,
        description,
        transaction_date,
        debit = 0,
        credit = 0,
      } = data;

      if (debit !== 0 && credit !== 0) {
        throw new Error("Only one of debit or credit should be provided");
      }

      const previousDayBalance =
        await this.generalLedgersService.getPreviousDayRemainingBalance(
          ledger_id,
          transaction_date
        );

      const balance = previousDayBalance + (debit !== 0 ? debit : -credit);

      const query = `
        INSERT INTO "GeneralJournals" (
          ledger_id, 
          account_code, 
          description, 
          transaction_date, 
          debit, 
          credit, 
          balance, 
          "createdAt"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
      ]);

      await this.generalLedgersService.updateGeneralLedger(
        ledger_id,
        transaction_date,
        debit,
        credit
      );

      return {
        status: "success",
        message: "General Journal created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating general journal: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `SELECT * FROM "GeneralJournals" ORDER BY id ASC`;
      const result = await db.raw(query);
      return {
        status: "success",
        message: "General Journals fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching general journals: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `SELECT * FROM "GeneralJournals" WHERE id = ?`;
      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "General Journal not found",
          data: null,
        };
      }
      return {
        status: "success",
        message: "General Journal fetched successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error fetching general journal: ${error.message}`);
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
      if (data.debit !== undefined) {
        updateFields.push(`debit = ?`);
        values.push(data.debit ?? 0);
      }
      if (data.credit !== undefined) {
        updateFields.push(`credit = ?`);
        values.push(data.credit ?? 0);
      }

      if (data.debit !== undefined || data.credit !== undefined) {
        const debit = data.debit ?? 0;
        const credit = data.credit ?? 0;
        const balance = debit !== 0 ? debit : -credit;
        updateFields.push(`balance = ?`);
        values.push(balance);
      }

      updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "GeneralJournals" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);
      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "General Journal not found",
        };
      }

      const updatedEntry = result.rows[0];
      await this.generalLedgersService.updateGeneralLedger(
        updatedEntry.ledger_id,
        updatedEntry.transaction_date,
        updatedEntry.debit,
        updatedEntry.credit
      );

      return {
        status: "success",
        message: "General Journal updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating general journal: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const getQuery = `SELECT * FROM "GeneralJournals" WHERE id = ?`;
      const getResult = await db.raw(getQuery, [id]);

      if (getResult.rows.length === 0) {
        return {
          status: "error",
          message: "General Journal not found",
        };
      }

      const entryToDelete = getResult.rows[0];
      const { ledger_id, transaction_date, debit, credit } = entryToDelete;

      await db.transaction(async (trx) => {
        const deleteQuery = `DELETE FROM "GeneralJournals" WHERE id = ? RETURNING *`;
        const deleteResult = await trx.raw(deleteQuery, [id]);

        if (deleteResult.rows.length === 0) {
          throw new Error("Failed to delete general journal");
        }

        const recalculateQuery = `
          WITH updated_balances AS (
            SELECT 
              id,
              SUM(debit - credit) OVER (ORDER BY transaction_date, id) AS new_balance
            FROM "GeneralJournals"
            WHERE ledger_id = ? AND transaction_date >= ?
          )
          UPDATE "GeneralJournals" gj
          SET balance = ub.new_balance
          FROM updated_balances ub
          WHERE gj.id = ub.id
        `;
        await trx.raw(recalculateQuery, [ledger_id, transaction_date]);

        const totalsQuery = `
          SELECT 
            COALESCE(SUM(debit), 0) AS total_debit,
            COALESCE(SUM(credit), 0) AS total_credit
          FROM "GeneralJournals"
          WHERE ledger_id = ?
        `;
        const totalsResult = await trx.raw(totalsQuery, [ledger_id]);
        const { total_debit, total_credit } = totalsResult.rows[0];

        const lastBalanceQuery = `
          SELECT balance 
          FROM "GeneralJournals" 
          WHERE ledger_id = ? 
          ORDER BY transaction_date DESC, id DESC 
          LIMIT 1
        `;
        const lastBalanceResult = await trx.raw(lastBalanceQuery, [ledger_id]);
        const remaining_balance = lastBalanceResult.rows[0]
          ? lastBalanceResult.rows[0].balance
          : 0;

        await this.generalLedgersService.updateGeneralLedger(
          ledger_id,
          transaction_date,
          -debit,
          -credit,
          remaining_balance,
          total_debit,
          total_credit
        );
      });

      return {
        status: "success",
        message: "General Journal deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting general journal: ${error.message}`);
    }
  }

  async createMultiple(data) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {
          status: "error",
          message: "No data provided for creation",
        };
      }

      const ledger_id = data[0].ledger_id;
      const transaction_date = data[0].transaction_date;

      const previousDayBalance =
        await this.generalLedgersService.getPreviousDayRemainingBalance(
          ledger_id,
          transaction_date
        );

      let currentBalance = previousDayBalance;
      const validatedData = data.map((entry) => {
        if (
          !entry.ledger_id ||
          !entry.account_code ||
          !entry.transaction_date
        ) {
          throw new Error("Missing required fields in one or more entries");
        }

        const debit = entry.debit ?? 0;
        const credit = entry.credit ?? 0;

        if (debit !== 0 && credit !== 0) {
          throw new Error(
            "Only one of debit or credit should be provided in each entry"
          );
        }

        currentBalance += debit !== 0 ? debit : -credit;

        return {
          ledger_id: entry.ledger_id,
          account_code: entry.account_code,
          description: entry.description || null,
          transaction_date: entry.transaction_date,
          debit,
          credit,
          balance: currentBalance,
        };
      });

      const query = `
        INSERT INTO "GeneralJournals" (
          ledger_id, 
          account_code, 
          description, 
          transaction_date, 
          debit, 
          credit, 
          balance, 
          "createdAt"
        )
        VALUES ${validatedData
          .map(() => "(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
          .join(", ")}
        RETURNING *
      `;

      const values = validatedData.flatMap((entry) => [
        entry.ledger_id,
        entry.account_code,
        entry.description,
        entry.transaction_date,
        entry.debit,
        entry.credit,
        entry.balance,
      ]);

      const result = await db.raw(query, values);

      const total_debit = validatedData.reduce(
        (sum, entry) => sum + (entry.debit || 0),
        0
      );
      const total_credit = validatedData.reduce(
        (sum, entry) => sum + (entry.credit || 0),
        0
      );
      await this.generalLedgersService.updateGeneralLedger(
        ledger_id,
        transaction_date,
        total_debit,
        total_credit
      );

      return {
        status: "success",
        message: "Multiple General Journals created successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(
        `Error creating multiple general journals: ${error.message}`
      );
    }
  }

  async updateMultiple(data) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {
          status: "error",
          message: "No data provided for update",
        };
      }

      const queries = data.map((entry) => {
        const updateFields = [];
        const values = [];

        if (entry.debit !== undefined) {
          updateFields.push(`debit = ?`);
          values.push(entry.debit ?? 0);
        }
        if (entry.credit !== undefined) {
          updateFields.push(`credit = ?`);
          values.push(entry.credit ?? 0);
        }
        if (entry.account_code) {
          updateFields.push(`account_code = ?`);
          values.push(entry.account_code);
        }
        if (entry.description) {
          updateFields.push(`description = ?`);
          values.push(entry.description);
        }
        if (entry.transaction_date) {
          updateFields.push(`transaction_date = ?`);
          values.push(entry.transaction_date);
        }

        if (entry.debit !== undefined || entry.credit !== undefined) {
          const debit = entry.debit ?? 0;
          const credit = entry.credit ?? 0;
          const balance = debit !== 0 ? debit : -credit;
          updateFields.push(`balance = ?`);
          values.push(balance);
        }

        updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
        values.push(entry.id, entry.ledger_id);

        return db.raw(
          `UPDATE "GeneralJournals" SET ${updateFields.join(
            ", "
          )} WHERE id = ? AND ledger_id = ? RETURNING *`,
          values
        );
      });

      const results = await Promise.all(queries);
      const updatedRows = results.flatMap((result) => result.rows);

      for (const entry of updatedRows) {
        await this.generalLedgersService.updateGeneralLedger(
          entry.ledger_id,
          entry.transaction_date,
          entry.debit,
          entry.credit
        );
      }

      return {
        status: "success",
        message: "General Journals updated successfully",
        data: updatedRows,
      };
    } catch (error) {
      throw new Error(`Error updating general journals: ${error.message}`);
    }
  }

  async createOrUpdateGeneralJournals(data) {
    try {
      const {
        ledger_id,
        transaction_date,
        createEntries = [],
        updateEntries = [],
      } = data;

      if (!ledger_id || !transaction_date) {
        throw new Error(
          "Missing required fields: ledger_id or transaction_date"
        );
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
      let total_debit = 0;
      let total_credit = 0;

      await db.transaction(async (trx) => {
        const previousDayBalance =
          await this.generalLedgersService.getPreviousDayRemainingBalance(
            ledger_id,
            transaction_date
          );

        if (updateEntries.length > 0) {
          for (const entry of updateEntries) {
            if (!entry.id) {
              throw new Error("Missing ID in update entries");
            }

            const currentEntryQuery = `
            SELECT id, debit, credit FROM "GeneralJournals"
            WHERE id = ? AND ledger_id = ?
          `;
            const currentEntryResult = await trx.raw(currentEntryQuery, [
              entry.id,
              ledger_id,
            ]);

            if (currentEntryResult.rows.length === 0) {
              throw new Error(`Entry with id ${entry.id} not found`);
            }

            const debit =
              entry.debit !== undefined ? safeParseFloat(entry.debit) : null;
            const credit =
              entry.credit !== undefined ? safeParseFloat(entry.credit) : null;

            if (
              debit !== null &&
              credit !== null &&
              debit !== 0 &&
              credit !== 0
            ) {
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
            values.push(ledger_id);

            const updateQuery = `
            UPDATE "GeneralJournals" 
            SET ${updateFields.join(", ")}
            WHERE id = ? AND ledger_id = ?
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
              ledger_id,
              account_code: entry.account_code,
              description: entry.description || null,
              transaction_date: entry.transaction_date,
              debit: debit,
              credit: credit,
            };
          });

          const createQuery = `
          INSERT INTO "GeneralJournals" (
            ledger_id, 
            account_code, 
            description, 
            transaction_date, 
            debit, 
            credit,
            balance,
            "createdAt"
          )
          VALUES ${validatedCreateData
            .map(() => "(?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)")
            .join(", ")}
          RETURNING *
        `;

          const createValues = validatedCreateData.flatMap((entry) => [
            entry.ledger_id,
            entry.account_code,
            entry.description,
            entry.transaction_date,
            entry.debit,
            entry.credit,
          ]);

          const createResult = await trx.raw(createQuery, createValues);
          createdEntries.push(...createResult.rows);
        }

        const getAllEntriesQuery = `
        SELECT id, debit, credit
        FROM "GeneralJournals"
        WHERE ledger_id = ? AND transaction_date = ?
        ORDER BY id ASC
      `;

        const allEntriesResult = await trx.raw(getAllEntriesQuery, [
          ledger_id,
          transaction_date,
        ]);

        const allEntries = allEntriesResult.rows;

        let currentBalance = safeParseFloat(previousDayBalance);
        total_debit = 0;
        total_credit = 0;

        for (const entry of allEntries) {
          const entryDebit = safeParseFloat(entry.debit);
          const entryCredit = safeParseFloat(entry.credit);

          total_debit += entryDebit;
          total_credit += entryCredit;

          currentBalance = safeParseFloat(
            currentBalance + entryDebit - entryCredit
          );

          await trx.raw(
            `UPDATE "GeneralJournals" SET balance = ? WHERE id = ?`,
            [currentBalance, entry.id]
          );
        }

        const remaining_balance = currentBalance;

        const checkLedgerQuery = `
        SELECT id FROM "GeneralLedgers" 
        WHERE id = ? AND transaction_date = ?
      `;

        const ledgerResult = await trx.raw(checkLedgerQuery, [
          ledger_id,
          transaction_date,
        ]);

        if (ledgerResult.rows.length > 0) {
          await trx.raw(
            `
          UPDATE "GeneralLedgers" 
          SET 
            total_debit = ?, 
            total_credit = ?, 
            total_balance = ?, 
            remaining_balance = ?,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = ? AND transaction_date = ?
        `,
            [
              total_debit,
              total_credit,
              total_debit - total_credit,
              remaining_balance,
              ledger_id,
              transaction_date,
            ]
          );
        } else {
          await trx.raw(
            `
          INSERT INTO "GeneralLedgers"
          (id, transaction_date, total_debit, total_credit, total_balance, remaining_balance, "createdAt")
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
            [
              ledger_id,
              transaction_date,
              total_debit,
              total_credit,
              total_debit - total_credit,
              remaining_balance,
            ]
          );
        }

        const updateFutureLedgersQuery = `
        SELECT id, transaction_date FROM "GeneralLedgers"
        WHERE id = ? AND transaction_date > ?
        ORDER BY transaction_date ASC
      `;

        const futureLedgersResult = await trx.raw(updateFutureLedgersQuery, [
          ledger_id,
          transaction_date,
        ]);

        const futureLedgers = futureLedgersResult.rows;

        if (futureLedgers.length > 0) {
          let previousBalance = remaining_balance;

          for (const ledger of futureLedgers) {
            const dayEntriesQuery = `
            SELECT id, debit, credit FROM "GeneralJournals"
            WHERE ledger_id = ? AND transaction_date = ?
            ORDER BY id ASC
          `;

            const dayEntriesResult = await trx.raw(dayEntriesQuery, [
              ledger_id,
              ledger.transaction_date,
            ]);

            const dayEntries = dayEntriesResult.rows;
            let dayDebit = 0;
            let dayCredit = 0;
            let newBalance = previousBalance;

            for (const entry of dayEntries) {
              const entryDebit = safeParseFloat(entry.debit);
              const entryCredit = safeParseFloat(entry.credit);

              dayDebit += entryDebit;
              dayCredit += entryCredit;

              newBalance = safeParseFloat(
                newBalance + entryDebit - entryCredit
              );

              await trx.raw(
                `UPDATE "GeneralJournals" SET balance = ? WHERE id = ?`,
                [newBalance, entry.id]
              );
            }

            await trx.raw(
              `
            UPDATE "GeneralLedgers" 
            SET 
              total_debit = ?, 
              total_credit = ?, 
              total_balance = ?, 
              remaining_balance = ?,
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = ? AND transaction_date = ?
          `,
              [
                dayDebit,
                dayCredit,
                dayDebit - dayCredit,
                newBalance,
                ledger_id,
                ledger.transaction_date,
              ]
            );

            previousBalance = newBalance;
          }
        }
      });

      return {
        status: "success",
        message: "General Journals created and updated successfully",
        data: {
          created: createdEntries,
          updated: updatedEntries,
        },
      };
    } catch (error) {
      throw new Error(
        `Error creating or updating general journals: ${error.message}`
      );
    }
  }
}
