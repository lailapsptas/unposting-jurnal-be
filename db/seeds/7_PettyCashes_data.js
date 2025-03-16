export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "PettyCashes" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "PettyCashes" (ledger_id, account_code, description, transaction_date, debit, credit, balance) VALUES
    (1, 1, 'Cash Bon Keramik', '2013-09-11', 0.00, 134600.00, -134600.00); 
  `);
}
