export async function up(knex) {
  await knex.raw(`
            CREATE TABLE IF NOT EXISTS "GeneralLedgers" (
              id SERIAL PRIMARY KEY,
              transaction_date DATE NOT NULL,
              transaction_code VARCHAR(8) NOT NULL,
              description VARCHAR(255) NOT NULL,
              total_debit DECIMAL(15,2),
              total_credit DECIMAL(15,2),
              total_balance DECIMAL(15,2),
              remaining_balance DECIMAL(15,2),
              "isPosting" BOOLEAN NOT NULL DEFAULT FALSE,
              posting_date TIMESTAMP,
              unposting_date TIMESTAMP,
              "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TRIGGER set_timestamp_reports
            BEFORE UPDATE ON "GeneralLedgers"
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
          `);
}

export async function down(knex) {
  await knex.raw(`
            DROP TRIGGER IF EXISTS set_timestamp_reports ON "GeneralLedgers";
            DROP TABLE IF EXISTS "GeneralLedgers";
        `);
}
