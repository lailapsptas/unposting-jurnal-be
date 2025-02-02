export async function up(knex) {
  await knex.raw(`
      CREATE TABLE IF NOT EXISTS JobPositions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        purpose VARCHAR(255)
      );
    `);
}

export async function down(knex) {
  await knex.raw(`DROP TABLE IF EXISTS JobPositions;`);
}
