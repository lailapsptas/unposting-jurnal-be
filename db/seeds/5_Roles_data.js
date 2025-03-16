export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "Roles" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "Roles" (name, description, "createdAt", "updatedAt") VALUES
    ('Super Admin', 'Has full access to the system', NOW(), NOW()),
    ('Admin', 'Manage the application', NOW(), NOW()),
    ('User', 'Regular access', NOW(), NOW());
  `);
}
