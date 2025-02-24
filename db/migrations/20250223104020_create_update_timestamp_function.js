export async function up(knex) {
  await knex.raw(`
      CREATE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
}

export async function down(knex) {
  await knex.raw(`DROP FUNCTION IF EXISTS update_timestamp();`);
}
