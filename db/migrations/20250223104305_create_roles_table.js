export async function up(knex) {
  await knex.raw(`
        CREATE TABLE IF NOT EXISTS "Roles" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description VARCHAR(255),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON "Roles"
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `);
}

export async function down(knex) {
  await knex.raw(`
        DROP TRIGGER IF EXISTS set_timestamp ON "Roles";
        DROP TABLE IF EXISTS "Roles";
    `);
}
