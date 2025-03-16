export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "Postings" RESTART IDENTITY CASCADE;`);

  await knex.raw(`
    INSERT INTO "Postings" (
      ledger_id, posting_date, posted_by, period_month, period_year, 
      transaction_date, transaction_code, description, 
      total_debit, total_credit, total_balance, is_unposted, 
      "createdAt", "updatedAt"
    ) VALUES
    (
      3, NOW(), 2, 3, 2025, 
      '2025-03-01', '64346937', 'Transaksi Tanggal 1 Maret 2025', 
      170000.00, 130000.00, 40000.00, false, 
      NOW(), NOW()
    ),
    (
      4, NOW(), 2, 3, 2025, 
      '2025-03-02', '42002946', 'Transaksi Tanggal 2 Maret 2025', 
      120000.00, 52000.00, 68000.00, false, 
      NOW(), NOW()
    ),
    (
      5, NOW(), 2, 3, 2025, 
      '2025-03-03', '28056418', 'Transaksi Tanggal 3 Maret 2025', 
      320000.00, 420000.00, -100000.00, false, 
      NOW(), NOW()
    );
  `);
}
