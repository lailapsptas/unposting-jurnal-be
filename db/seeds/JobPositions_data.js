export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "JobPositions" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "JobPositions" (title, purpose, "createdAt", "updatedAt") VALUES
    ('Head of Finance Department', 'Lead the finance department and report to the school principal.', NOW(), NOW()),
    ('Financial Administration Officer', 'Manage daily financial administration and processing of payments.', NOW(), NOW()),
    ('School Financial Consultant', 'Provide advice on financial planning and fundraising strategies.', NOW(), NOW()),
    ('Fundraising Coordinator', 'Manage fundraising activities to support school programs.', NOW(), NOW());
  `);
}
