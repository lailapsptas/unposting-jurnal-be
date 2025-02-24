export async function up(knex) {
  await knex.raw(`
        CREATE TABLE IF NOT EXISTS "JobPositions" (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          purpose VARCHAR(255),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON "JobPositions"
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `);
}

export async function down(knex) {
  await knex.raw(`
        DROP TRIGGER IF EXISTS set_timestamp ON "JobPositions";
        DROP TABLE IF EXISTS "JobPositions";
    `);
}
