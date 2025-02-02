export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE JobPositions RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO JobPositions (title, purpose) VALUES
    ('Head of Finance Department', 'Lead the finance department and report to the school principal.'),
    ('Financial Administration Officer', 'Manage daily financial administration and processing of payments.'),
    ('School Financial Consultant', 'Provide advice on financial planning and fundraising strategies.'),
    ('Fundraising Coordinator', 'Manage fundraising activities to support school programs.');
  `);
}
