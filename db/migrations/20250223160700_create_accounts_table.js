export async function up(knex) {
  await knex.raw(`
            CREATE TABLE IF NOT EXISTS "Accounts" (
            id SERIAL PRIMARY KEY,
            code INTEGER NOT NULL,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(255) NOT NULL,
            account_type VARCHAR(50) NOT NULL,
            currency VARCHAR(10) NOT NULL,
            active BOOLEAN DEFAULT TRUE,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
            
             CREATE TRIGGER set_timestamp
             BEFORE UPDATE ON "Accounts"
             FOR EACH ROW
             EXECUTE FUNCTION update_timestamp();
          `);
}

export async function down(knex) {
  await knex.raw(`
        DROP TRIGGER IF EXISTS set_timestamp ON "Accounts";
        DROP TABLE IF EXISTS "Accounts";
      `);
}
