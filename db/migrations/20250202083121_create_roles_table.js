export async function up(knex) {
  await knex.raw(`
      CREATE TABLE IF NOT EXISTS Roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255)
      );
    `);
}

export async function down(knex) {
  await knex.raw(`DROP TABLE IF EXISTS Roles;`);
}
