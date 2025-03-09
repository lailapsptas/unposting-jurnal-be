export async function up(knex) {
  await knex.raw(`
      ALTER TABLE "GeneralJournals"
      ADD COLUMN pettycash_id INTEGER REFERENCES "PettyCashes"(id) ON DELETE SET NULL;
    `);
}

export async function down(knex) {
  await knex.raw(`
      ALTER TABLE "GeneralJournals"
      DROP COLUMN IF EXISTS pettycash_id;
    `);
}
