export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "Accounts" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
      INSERT INTO "Accounts" (code, name, description, account_type, currency, active, "createdAt", "updatedAt")
      VALUES
        (14402, 'Cash', 'Account for storing cash', 'Asset', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (21100, 'Payments', 'Account for recording payments', 'Liability', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (41000, 'Revenue', 'Account for recording revenue', 'Revenue', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (51000, 'Operational Expenses', 'Account for recording operational expenses', 'Expense', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (31100, 'Capital', 'Account for recording business capital', 'Equity', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (52000, 'Salary Expenses', 'Account for recording salary expenditures', 'Expense', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (43000, 'Service Revenue', 'Revenue from services or fees', 'Revenue', 'IDR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);
}
