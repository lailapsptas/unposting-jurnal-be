export async function up(knex) {
  await knex.raw(`
      ALTER TABLE "PettyCashes"
      ADD COLUMN isApproved BOOLEAN DEFAULT FALSE,
      ADD COLUMN approved_date TIMESTAMP DEFAULT NULL;
    `);
}

export async function down(knex) {
  await knex.raw(`
      ALTER TABLE "PettyCashes"
      DROP COLUMN IF EXISTS isApproved,
      DROP COLUMN IF EXISTS approved_date;
    `);
}
