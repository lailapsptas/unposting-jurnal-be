export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE Roles RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO Roles (name, description) VALUES
    ('Super Admin', 'Has full access to the system'),
    ('Admin', 'Manage the application'),
    ('User', 'Regular access');
  `);
}
