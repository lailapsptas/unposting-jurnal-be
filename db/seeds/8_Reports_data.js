export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "Reports" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "Reports" (printed_by, file_type, report_type, account_type, "isAllAccount", filter_by, filter_date, filter_month, "createdAt", "updatedAt") VALUES
    (1, 'pdf', 'account', 'Revenue', FALSE, NULL, NULL, NULL, NOW(), NOW()),
    (2, 'excel', 'general_ledger', NULL, NULL, 'day', '2023-10-01', NULL, NOW(), NOW()),
    (3, 'pdf', 'general_ledger', NULL, NULL, 'month', NULL, '2023-10', NOW(), NOW()),
    (1, 'excel', 'account', NULL, TRUE, NULL, NULL, NULL, NOW(), NOW());
  `);
}
