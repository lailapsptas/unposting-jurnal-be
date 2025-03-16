export async function up(knex) {
  await knex.raw(`
      CREATE TABLE IF NOT EXISTS "Postings" (
        id SERIAL PRIMARY KEY,
        ledger_id INTEGER REFERENCES "GeneralLedgers"(id) ON DELETE CASCADE,
        posting_date TIMESTAMP NOT NULL,
        posted_by INTEGER REFERENCES "Users"(id) ON DELETE CASCADE,
        period_month INTEGER NOT NULL,
        period_year INTEGER NOT NULL,
        transaction_date DATE NOT NULL,
        transaction_code VARCHAR(20) NOT NULL,
        description TEXT,
        total_debit DECIMAL(15,2) NOT NULL,
        total_credit DECIMAL(15,2) NOT NULL,
        total_balance DECIMAL(15,2) NOT NULL,
        is_unposted BOOLEAN DEFAULT false,
        unposting_date TIMESTAMP,
        unposted_by INTEGER REFERENCES "Users"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON  "Postings"
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `);
}

export async function down(knex) {
  await knex.raw(`
      DROP TRIGGER IF EXISTS set_timestamp ON  "Postings";
      DROP TABLE IF EXISTS  "Postings";
    `);
}
