import bcrypt from "bcryptjs";

export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE;`);

  const saltRounds = 15;
  const superAdminPassword = await bcrypt.hash("s_admin123", saltRounds);
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const userPassword = await bcrypt.hash("user123", saltRounds);

  await knex.raw(`
    INSERT INTO "Users" (username, full_name, email, password, role_id, "jobPosition_id", "createdAt", "updatedAt") VALUES
    ('superAdmin', 'Super Admin Application', 'superAdmin@siskeu.com', '${superAdminPassword}', 1, 1, NOW(), NOW()),
    ('admin', 'Admin', 'admin@siskeu.com', '${adminPassword}', 2, 2, NOW(), NOW()),
    ('user', 'User', 'user@siskeu.com', '${userPassword}', 3, 3, NOW(), NOW());
  `);
}
