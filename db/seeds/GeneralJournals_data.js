export async function seed(knex) {
  await knex.raw(`TRUNCATE TABLE "GeneralJournals" RESTART IDENTITY CASCADE;`);
  await knex.raw(`
    INSERT INTO "GeneralJournals" (ledger_id, account_code, description, transaction_date, debit, credit, balance) VALUES 
    (1, 1, 'Uang SPP', '2013-09-11', 225000.00, NULL, 225000.00),
    (1, 1, 'Uang Komite', '2013-09-11', 207500.00, NULL, 432500.00),
    (1, 1, 'Uang Tabungan', '2013-09-11', 117500.00, NULL, 550000.00),
    (1, 4, 'Transportasi Pengambilan Dokumen', '2013-09-11', NULL, 165500.00, 384500.00),
    (1, 4, 'Pembersihan AC Ruang Kepala Sekolah', '2013-09-11', NULL, 242200.00, 142300.00),
    (1, 4, 'Fotokopi Materi', '2013-09-11', NULL, 142300.00, 0.00),
    (2, 1, 'Uang SPP', '2013-09-12', 260000.00, NULL, 260000.00),
    (2, 1, 'Uang Komite', '2013-09-12', 250000.00, NULL, 510000.00),
    (2, 1, 'Uang Tabungan', '2013-09-12', 0.00, NULL, 510000.00),
    (2, 4, 'Pembayaran biaya keamanan', '2013-09-12', NULL, 175000.00, 335000.00),
    (2, 4, 'Pembelian Galon dan Air Minum', '2013-09-12', NULL, 82000.00, 253000.00),
    (2, 4, 'Pemb. Cash Bon Keramik', '2013-09-12', NULL, 134600.00, 118400.00),
    (2, 4, 'Pembelian Material Konstruksi', '2013-09-12', NULL, 111400.00, 7000.00);
  `);
}
