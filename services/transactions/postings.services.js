import db from "../../db/knex.js";

export class PostingsService {
  async createPosting(data) {
    try {
      return await db.transaction(async (trx) => {
        const ledger = await trx.raw(
          `
          SELECT * FROM "GeneralLedgers" WHERE id = ? AND "isPosting" = false
        `,
          [data.ledger_id]
        );

        if (ledger.rows.length === 0) {
          return {
            status: "error",
            message: "Ledger not found or already posted",
          };
        }

        const ledgerData = ledger.rows[0];

        const journals = await trx.raw(
          `
          SELECT * FROM "GeneralJournals" WHERE ledger_id = ?
        `,
          [data.ledger_id]
        );

        if (journals.rows.length === 0) {
          return {
            status: "error",
            message: "No journal entries found for this ledger",
          };
        }

        const transactionDate = new Date(ledgerData.transaction_date);
        const periodMonth = transactionDate.getMonth() + 1; // JavaScript months are 0-indexed
        const periodYear = transactionDate.getFullYear();

        const posting = await trx.raw(
          `
          INSERT INTO "Postings" (
            ledger_id, posting_date, posted_by, period_month, period_year,
            transaction_date, transaction_code, description,
            total_debit, total_credit, total_balance, is_unposted,
            "createdAt", "updatedAt"
          )
          VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `,
          [
            ledgerData.id,
            data.posted_by,
            periodMonth,
            periodYear,
            ledgerData.transaction_date,
            ledgerData.transaction_code,
            ledgerData.description,
            ledgerData.total_debit,
            ledgerData.total_credit,
            ledgerData.total_balance,
          ]
        );

        const postingId = posting.rows[0].id;

        for (const journal of journals.rows) {
          await trx.raw(
            `
            INSERT INTO "PostingDetails" (
              posting_id, journal_id, account_code, description,
              debit, credit, balance, "createdAt"
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,
            [
              postingId,
              journal.id,
              journal.account_code,
              journal.description,
              journal.debit,
              journal.credit,
              journal.balance,
            ]
          );
        }

        await trx.raw(
          `
          UPDATE "GeneralLedgers"
          SET "isPosting" = true, posting_date = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
          [ledgerData.id]
        );

        return {
          status: "success",
          message: "Posting completed successfully",
          data: posting.rows[0],
        };
      });
    } catch (error) {
      throw new Error(`Error creating posting: ${error.message}`);
    }
  }

  async unpostMonth(data) {
    try {
      return await db.transaction(async (trx) => {
        const postings = await trx.raw(
          `
          SELECT * FROM "Postings" 
          WHERE period_month = ? AND period_year = ? AND is_unposted = false
        `,
          [data.month, data.year]
        );

        if (postings.rows.length === 0) {
          return {
            status: "error",
            message: "No postings found for the specified month and year",
          };
        }

        const ledgerIds = postings.rows.map((posting) => posting.ledger_id);

        await trx.raw(
          `
          UPDATE "Postings"
          SET is_unposted = true, unposting_date = CURRENT_TIMESTAMP, unposted_by = ?, "updatedAt" = CURRENT_TIMESTAMP
          WHERE period_month = ? AND period_year = ? AND is_unposted = false
        `,
          [data.unposted_by, data.month, data.year]
        );

        await trx.raw(`
          UPDATE "GeneralLedgers"
          SET "isPosting" = false, posting_date = NULL, unposting_date = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
          WHERE id IN (${ledgerIds.join(",")})
        `);

        return {
          status: "success",
          message: `Successfully unposted all transactions for ${data.month}/${data.year}`,
          data: {
            month: data.month,
            year: data.year,
            count: postings.rows.length,
          },
        };
      });
    } catch (error) {
      throw new Error(`Error during unposting: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      let whereClause = "";
      const values = [];

      if (filters.month) {
        whereClause += '"Postings".period_month = ? AND ';
        values.push(filters.month);
      }

      if (filters.year) {
        whereClause += '"Postings".period_year = ? AND ';
        values.push(filters.year);
      }

      if (filters.is_unposted !== undefined) {
        whereClause += '"Postings".is_unposted = ? AND ';
        values.push(filters.is_unposted);
      } else {
        whereClause += '"Postings".is_unposted = ? AND ';
        values.push(false);
      }

      if (whereClause) {
        whereClause = "WHERE " + whereClause.slice(0, -5);
      }

      const query = `
        SELECT "Postings".*, "GeneralLedgers".transaction_date, "GeneralLedgers".transaction_code
        FROM "Postings"
        JOIN "GeneralLedgers" ON "Postings".ledger_id = "GeneralLedgers".id
        ${whereClause}
        ORDER BY "Postings".id DESC
      `;

      const result = await db.raw(query, values);

      return {
        status: "success",
        message: "Postings fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching postings: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const postingQuery = `
        SELECT "Postings".*, "GeneralLedgers".transaction_date, "GeneralLedgers".transaction_code, "Users".full_name AS posted_by_name
        FROM "Postings"
        JOIN "GeneralLedgers" ON "Postings".ledger_id = "GeneralLedgers".id
        JOIN "Users" ON "Postings".posted_by = "Users".id
        WHERE "Postings".id = ?
      `;
      const posting = await db.raw(postingQuery, [id]);

      if (posting.rows.length === 0) {
        return {
          status: "error",
          message: "Posting not found",
          data: null,
        };
      }

      const detailsQuery = `
        SELECT "PostingDetails".*, "Accounts".name as account_name, "Accounts".code as account_code_number
        FROM "PostingDetails"
        JOIN "Accounts" ON "PostingDetails".account_code = "Accounts".id
        WHERE "PostingDetails".posting_id = ?
        ORDER BY "PostingDetails".id ASC
      `;
      const details = await db.raw(detailsQuery, [id]);

      return {
        status: "success",
        message: "Posting fetched successfully",
        data: {
          posting: posting.rows[0],
          details: details.rows,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching posting: ${error.message}`);
    }
  }

  async getUnpostedLedgers() {
    try {
      const query = `
        SELECT *
        FROM "GeneralLedgers"
        WHERE "isPosting" = false
        ORDER BY transaction_date ASC
      `;

      const result = await db.raw(query);

      return {
        status: "success",
        message: "Unposted ledgers fetched successfully",
        data: result.rows,
      };
    } catch (error) {
      throw new Error(`Error fetching unposted ledgers: ${error.message}`);
    }
  }

  async getPostingReport(filters) {
    try {
      if (!filters.month || !filters.year) {
        return {
          status: "error",
          message: "Month and year are required for the report",
        };
      }

      const query = `
        SELECT 
          "Postings".id, 
          "Postings".ledger_id, 
          "GeneralLedgers".transaction_date, 
          "GeneralLedgers".transaction_code, 
          "GeneralLedgers".description, 
          "Postings".total_debit, 
          "Postings".total_credit, 
          "Postings".total_balance,
          "Postings".posting_date,
          "Postings".posted_by,
          "Postings".is_unposted,
          "Postings".unposting_date,
          "Postings".unposted_by
        FROM "Postings"
        JOIN "GeneralLedgers" ON "Postings".ledger_id = "GeneralLedgers".id
        WHERE "Postings".period_month = ? AND "Postings".period_year = ?
        ORDER BY "GeneralLedgers".transaction_date ASC
      `;

      const result = await db.raw(query, [filters.month, filters.year]);

      const summary = {
        totalCount: result.rows.length,
        totalDebit: result.rows.reduce(
          (sum, row) => sum + parseFloat(row.total_debit),
          0
        ),
        totalCredit: result.rows.reduce(
          (sum, row) => sum + parseFloat(row.total_credit),
          0
        ),
        totalBalance: result.rows.reduce(
          (sum, row) => sum + parseFloat(row.total_balance),
          0
        ),
        postedCount: result.rows.filter((row) => !row.is_unposted).length,
        unpostedCount: result.rows.filter((row) => row.is_unposted).length,
      };

      return {
        status: "success",
        message: "Posting report generated successfully",
        data: {
          transactions: result.rows,
          summary,
        },
      };
    } catch (error) {
      throw new Error(`Error generating posting report: ${error.message}`);
    }
  }
}
