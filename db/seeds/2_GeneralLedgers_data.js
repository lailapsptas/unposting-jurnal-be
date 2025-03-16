export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "GeneralLedgers" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "GeneralLedgers" (transaction_date, transaction_code, description, total_debit, total_credit, total_balance, remaining_balance, "isPosting") VALUES
    ('2013-09-11', '87654321', 'Transaksi Tanggal 10 September 2013', 550000.00, 550000.00, 0.00, 0.00, FALSE), 
    ('2013-09-12', '12345678', 'Transaksi Tanggal 11 September 2013', 510000.00, 503000.00, 7000.00, 7000.00, FALSE);
  `);
}
