export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "PostingDetails" RESTART IDENTITY CASCADE;`);

  await knex.raw(`
    INSERT INTO "PostingDetails" (
      posting_id, journal_id, account_code, description, 
      debit, credit, balance, "createdAt"
    ) VALUES
    (
      1, 25, 1, 'spp', 
      170000.00, 0.00, 177000.00, NOW()
    ),
    (
      1, 26, 4, 'pemb.', 
      0.00, 130000.00, 47000.00, NOW()
    ),
    (
      2, 27, 1, 'spp', 
      120000.00, 0.00, 167000.00, NOW()
    ),
    (
      2, 28, 4, 'pemb', 
      0.00, 52000.00, 115000.00, NOW()
    ),
    (
      3, 29, 1, 'spp', 
      320000.00, 0.00, 435000.00, NOW()
    ),
    (
      3, 30, 2, 'pemb.', 
      0.00, 420000.00, 15000.00, NOW()
    );
  `);
}
