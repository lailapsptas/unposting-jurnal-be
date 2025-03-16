export async function up(knex) {
  await knex.raw(`
      CREATE TABLE IF NOT EXISTS "PostingDetails" (
        id SERIAL PRIMARY KEY,
        posting_id INTEGER NOT NULL REFERENCES "Postings"(id) ON DELETE CASCADE,
        journal_id INTEGER NOT NULL REFERENCES "GeneralJournals"(id) ON DELETE CASCADE,
        account_code INTEGER NOT NULL REFERENCES "Accounts"(id) ON DELETE CASCADE,
        description TEXT,
        debit DECIMAL(15,2) NOT NULL,
        credit DECIMAL(15,2) NOT NULL,
        balance DECIMAL(15,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

       CREATE TRIGGER set_timestamp
       BEFORE UPDATE ON  "PostingDetails"
       FOR EACH ROW
       EXECUTE FUNCTION update_timestamp();
    `);
}

export async function down(knex) {
  await knex.raw(`
      DROP TABLE IF EXISTS "PostingDetails";
    `);
}
