export async function up(knex) {
  const result = await knex.raw(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES Roles(id) ON DELETE CASCADE,
        jobPosition_id INTEGER REFERENCES JobPositions(id) ON DELETE CASCADE
      );
    `);
  console.log(result);
}

export async function down(knex) {
  await knex.raw(`DROP TABLE IF EXISTS Users;`);
}
