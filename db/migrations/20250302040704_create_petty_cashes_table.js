export async function up(knex) {
  await knex.raw(`
                CREATE TABLE IF NOT EXISTS "PettyCashes" (
                  id SERIAL PRIMARY KEY,
                  ledger_id INTEGER REFERENCES "GeneralLedgers"(id) ON DELETE CASCADE,
                  account_code INTEGER NOT NULL REFERENCES "Accounts"(id) ON DELETE CASCADE,
                  description VARCHAR(255) NOT NULL,
                  transaction_date DATE NOT NULL,
                  debit DECIMAL(15,2),
                  credit DECIMAL(15,2),
                  balance DECIMAL(15,2),
                  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TRIGGER set_timestamp
                BEFORE UPDATE ON "PettyCashes"
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();
              `);
}

export async function down(knex) {
  await knex.raw(`
                DROP TRIGGER IF EXISTS set_timestamp ON "PettyCashes";
                DROP TABLE IF EXISTS "PettyCashes";
            `);
}
