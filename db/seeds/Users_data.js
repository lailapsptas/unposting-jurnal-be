export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE Users RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO Users (username, fullname, email, password, role_id, jobPosition_id) VALUES
    ('superAdmin', 'Super Admin Application', 'superAdmin@siskeu.com', 's_admin123', 1, 1),
    ('admin', 'Admin', 'admin@siskeu.com', 'admin123', 2, 2),
    ('user', 'User', 'user@siskeu.com', 'user123', 3, 3);
  `);
}
