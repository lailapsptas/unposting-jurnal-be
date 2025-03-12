export async function up(knex) {
  await knex.raw(`
      ALTER TABLE "PettyCashes"
      ADD COLUMN isApproved BOOLEAN DEFAULT FALSE,
      ADD COLUMN approved_date TIMESTAMP DEFAULT NULL,
      ADD COLUMN user_id INTEGER REFERENCES "Users"(id) ON DELETE CASCADE;
    `);
}

export async function down(knex) {
  await knex.raw(`
      ALTER TABLE "PettyCashes"
      DROP COLUMN IF EXISTS isApproved,
      DROP COLUMN IF EXISTS approved_date,
      DROP COLUMN IF EXISTS user_id;
    `);
}
