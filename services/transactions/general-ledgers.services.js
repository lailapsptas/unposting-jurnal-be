import db from "../../db/knex.js";

export class GeneralLedgersService {
  async create(data) {
    try {
      const { transaction_date, description } = data;

      const formattedDate = new Date(transaction_date).toLocaleDateString(
        "en-CA",
        { year: "numeric", month: "2-digit", day: "2-digit" }
      );

      const transaction_code = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();

      const query = `
        INSERT INTO "GeneralLedgers" (
          transaction_date, 
          transaction_code, 
          description, 
          total_debit,
          total_credit,
          total_balance,
          remaining_balance,
          "isPosting",
          "createdAt"
        )
        VALUES (?, ?, ?, 0.00, 0.00, 0.00, 0.00, false, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.raw(query, [
        formattedDate,
        transaction_code,
        description,
      ]);

      return {
        status: "success",
        message: "General Ledger created successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error creating general ledger: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT 
          "GeneralLedgers".*, 
          json_agg(DISTINCT jsonb_build_object(
            'id', "GeneralJournals".id,
            'account_code', "GeneralJournals".account_code,
            'description', "GeneralJournals".description,
            'transaction_date', "GeneralJournals".transaction_date,
            'debit', "GeneralJournals".debit,
            'credit', "GeneralJournals".credit,
            'balance', "GeneralJournals".balance
          )) AS journals,
          json_agg(DISTINCT jsonb_build_object(
            'id', "PettyCashes".id,
            'account_code', "PettyCashes".account_code,
            'description', "PettyCashes".description,
            'transaction_date', "PettyCashes".transaction_date,
            'debit', "PettyCashes".debit,
            'credit', "PettyCashes".credit,
            'balance', "PettyCashes".balance
          )) AS petty_cash
        FROM "GeneralLedgers"
        LEFT JOIN "GeneralJournals" ON "GeneralLedgers".id = "GeneralJournals".ledger_id
        LEFT JOIN "PettyCashes" ON "GeneralLedgers".id = "PettyCashes".ledger_id
        GROUP BY "GeneralLedgers".id
        ORDER BY "GeneralLedgers".transaction_date DESC;
      `;

      const result = await db.raw(query);
      return {
        status: "success",
        message: "General Ledgers fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching general ledgers: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const query = `
        WITH journals AS (
          SELECT 
            "GeneralJournals".ledger_id,
            jsonb_build_object(
              'id', "GeneralJournals".id,
              'account_code', "GeneralJournals".account_code,
              'account_info', jsonb_build_object(
                'code', "Accounts".code,
                'name', "Accounts".name
              ),
              'description', "GeneralJournals".description,
              'transaction_date', "GeneralJournals".transaction_date,
              'debit', "GeneralJournals".debit,
              'credit', "GeneralJournals".credit,
              'balance', "GeneralJournals".balance
            ) AS journal_entry
          FROM "GeneralJournals"
          LEFT JOIN "Accounts" ON "GeneralJournals".account_code = "Accounts".id
        ),
        petty_cashes AS (
          SELECT 
            "PettyCashes".ledger_id,
            jsonb_build_object(
              'id', "PettyCashes".id,
              'account_code', "PettyCashes".account_code,
              'account_info', jsonb_build_object(
                'code', "Accounts".code,
                'name', "Accounts".name
              ),
              'description', "PettyCashes".description,
              'transaction_date', "PettyCashes".transaction_date,
              'debit', "PettyCashes".debit,
              'credit', "PettyCashes".credit,
              'balance', "PettyCashes".balance
            ) AS petty_cash_entry
          FROM "PettyCashes"
          LEFT JOIN "Accounts" ON "PettyCashes".account_code = "Accounts".id
        )
        SELECT 
          "GeneralLedgers".*, 
          COALESCE(json_agg(DISTINCT journals.journal_entry) FILTER (WHERE journals.journal_entry IS NOT NULL), '[]'::json) AS journals,
          COALESCE(json_agg(DISTINCT petty_cashes.petty_cash_entry) FILTER (WHERE petty_cashes.petty_cash_entry IS NOT NULL), '[]'::json) AS petty_cash
        FROM "GeneralLedgers"
        LEFT JOIN journals ON "GeneralLedgers".id = journals.ledger_id
        LEFT JOIN petty_cashes ON "GeneralLedgers".id = petty_cashes.ledger_id
        WHERE "GeneralLedgers".id = ?
        GROUP BY "GeneralLedgers".id;
      `;

      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "General Ledger not found",
          data: null,
        };
      }

      const yesterdayBalance = await this.getPreviousDayRemainingBalance(
        id,
        result.rows[0].transaction_date
      );

      const responseData = {
        ...result.rows[0],
        yesterday_remaining_balance: yesterdayBalance,
      };

      return {
        status: "success",
        message: "General Ledger fetched successfully",
        data: responseData,
      };
    } catch (error) {
      throw new Error(`Error fetching general ledger: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const updateFields = [];
      const values = [];

      if (data.transaction_date) {
        const formattedDate = new Date(data.transaction_date).toISOString();
        updateFields.push(`transaction_date = ?`);
        values.push(formattedDate);
      }

      if (data.description) {
        updateFields.push(`description = ?`);
        values.push(data.description);
      }

      updateFields.push(`"updatedAt" = ?`);
      values.push(new Date().toISOString());

      if (updateFields.length === 0) {
        return {
          status: "error",
          message: "No fields to update",
        };
      }

      const query = `
        UPDATE "GeneralLedgers" 
        SET ${updateFields.join(", ")}
        WHERE id = ?
        RETURNING *
      `;

      values.push(id);

      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "General Ledger not found",
        };
      }

      return {
        status: "success",
        message: "General Ledger updated successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error updating general ledger: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM "GeneralLedgers" WHERE id = ? RETURNING *`;
      const result = await db.raw(query, [id]);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "General Ledger not found",
        };
      }

      return {
        status: "success",
        message: "General Ledger deleted successfully",
      };
    } catch (error) {
      throw new Error(`Error deleting general ledger: ${error.message}`);
    }
  }

  async getPreviousDayRemainingBalance(ledger_id, transaction_date) {
    try {
      const previousDay = new Date(transaction_date);
      previousDay.setDate(previousDay.getDate() - 1);

      const formattedPreviousDay =
        previousDay.getFullYear() +
        "-" +
        String(previousDay.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(previousDay.getDate()).padStart(2, "0");

      const query = `
        SELECT remaining_balance 
        FROM "GeneralLedgers" 
        WHERE transaction_date <= ?
        ORDER BY transaction_date DESC
        LIMIT 1
      `;

      const result = await db.raw(query, [formattedPreviousDay]);

      return result.rows[0] ? result.rows[0].remaining_balance : 0.0;
    } catch (error) {
      throw new Error(
        `Error fetching previous day remaining balance: ${error.message}`
      );
    }
  }

  async updateGeneralLedger(
    ledger_id,
    transaction_date,
    total_debit,
    total_credit,
    remaining_balance
  ) {
    try {
      const total_balance = total_debit - total_credit;

      const query = `
        UPDATE "GeneralLedgers" 
        SET 
          total_debit = ?, 
          total_credit = ?, 
          total_balance = ?, 
          remaining_balance = ?
        WHERE id = ? AND transaction_date = ?
      `;

      await db.raw(query, [
        total_debit,
        total_credit,
        total_balance,
        remaining_balance,
        ledger_id,
        transaction_date,
      ]);
    } catch (error) {
      throw new Error(`Error updating General Ledger: ${error.message}`);
    }
  }

  async updatePost(id) {
    try {
      const postingDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const query = `
        UPDATE "GeneralLedgers" 
        SET "isPosting" = ?, 
            "posting_date" = ?, 
            "updatedAt" = ?
        WHERE id = ?
        RETURNING *
      `;

      const values = [true, postingDate, new Date().toISOString(), id];

      const result = await db.raw(query, values);

      if (result.rows.length === 0) {
        return {
          status: "error",
          message: "General Ledger not found",
        };
      }

      return {
        status: "success",
        message: "General Ledger posted successfully",
        data: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error posting general ledger: ${error.message}`);
    }
  }

  async getMonthlyRecap(year, month) {
    try {
      const numYear = parseInt(year, 10);
      const numMonth = parseInt(month, 10);

      if (isNaN(numYear) || isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
        throw new Error("Invalid year or month input");
      }

      const startDate = `${numYear}-${String(numMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(numYear, numMonth, 0).getDate();
      const endDate = `${numYear}-${String(numMonth).padStart(
        2,
        "0"
      )}-${lastDay}`;

      const query = `
      SELECT 
        id,
        transaction_date,
        transaction_code,
        description,
        total_debit,
        total_credit,
        total_balance,
        remaining_balance
      FROM "GeneralLedgers"
      WHERE 
        transaction_date >= ? AND 
        transaction_date <= ? AND
        "isPosting" = true
      ORDER BY transaction_date ASC
    `;

      const result = await db.raw(query, [startDate, endDate]);
      const dailyEntries = result.rows;

      let monthlyTotalDebit = 0;
      let monthlyTotalCredit = 0;

      const formattedDailyEntries = dailyEntries.map((entry) => {
        monthlyTotalDebit += parseFloat(entry.total_debit);
        monthlyTotalCredit += parseFloat(entry.total_credit);

        const date = new Date(entry.transaction_date);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${date.getFullYear().toString().slice(-2)}`;

        return {
          date: formattedDate,
          transaction_date: entry.transaction_date,
          transaction_code: entry.transaction_code,
          description: entry.description,
          debit: parseFloat(entry.total_debit),
          credit: parseFloat(entry.total_credit),
        };
      });

      const monthlyBalance = monthlyTotalDebit - monthlyTotalCredit;
      const isBalanced = Math.abs(monthlyBalance) < 0.001; // Account for floating point precision

      return {
        status: "success",
        message: "Monthly recapitulation generated successfully",
        data: {
          year: numYear,
          month: numMonth,
          monthName: new Date(numYear, numMonth - 1, 1).toLocaleString(
            "default",
            { month: "long" }
          ),
          dailyEntries: formattedDailyEntries,
          summary: {
            totalDebit: monthlyTotalDebit,
            totalCredit: monthlyTotalCredit,
            balance: monthlyBalance,
            isBalanced: isBalanced,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `Error generating monthly recapitulation: ${error.message}`
      );
    }
  }
}
