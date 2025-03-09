export async function up(knex) {
  await knex.raw(`
          CREATE TABLE IF NOT EXISTS "Reports" (
            id SERIAL PRIMARY KEY,
            printed_by INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
            print_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_type VARCHAR(10) NOT NULL,
            report_type VARCHAR(20) NOT NULL, 
            account_type VARCHAR(50) DEFAULT NULL, 
            "isAllAccount" BOOLEAN DEFAULT FALSE,
            filter_by VARCHAR(10) DEFAULT NULL, 
            filter_date DATE DEFAULT NULL, 
            filter_month VARCHAR(7) DEFAULT NULL, 
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE TRIGGER set_timestamp_reports
          BEFORE UPDATE ON "Reports"
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);
}

export async function down(knex) {
  await knex.raw(`
          DROP TRIGGER IF EXISTS set_timestamp_reports ON "Reports";
          DROP TABLE IF EXISTS "Reports";
      `);
}
