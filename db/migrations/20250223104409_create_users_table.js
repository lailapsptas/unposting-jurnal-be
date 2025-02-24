export async function up(knex) {
  await knex.raw(`
        CREATE TABLE IF NOT EXISTS "Users" (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role_id INTEGER REFERENCES "Roles"(id) ON DELETE CASCADE,
          "jobPosition_id" INTEGER REFERENCES "JobPositions"(id) ON DELETE CASCADE,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON "Users"
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `);
}

export async function down(knex) {
  await knex.raw(`
        DROP TRIGGER IF EXISTS set_timestamp ON "Users";
        DROP TABLE IF EXISTS "Users";
    `);
}
