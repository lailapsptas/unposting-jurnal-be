export async function up(knex) {
  await knex.raw(`
            ALTER TABLE "Reports"
            ADD COLUMN file_data JSONB DEFAULT NULL;
        `);
}

export async function down(knex) {
  await knex.raw(`
            ALTER TABLE "Reports"
            DROP COLUMN IF EXISTS file_data;
        `);
}
