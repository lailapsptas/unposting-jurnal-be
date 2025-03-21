import db from "../../db/knex.js";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { GeneralLedgersService } from "./general-ledgers.services.js";

export class ReportsService {
  constructor() {
    this.generalLedgersService = new GeneralLedgersService();
  }

  async create(data) {
    try {
      const {
        printed_by,
        file_type,
        report_type,
        account_type,
        isAllAccount,
        filter_by,
        filter_date,
        filter_month,
      } = data;

      if (!printed_by || !file_type || !report_type) {
        throw new Error(
          "Missing required fields: printed_by, file_type, report_type"
        );
      }

      if (!["pdf", "excel"].includes(file_type)) {
        throw new Error("Invalid file_type. Must be 'pdf' or 'excel'");
      }

      if (!["account", "general_ledger"].includes(report_type)) {
        throw new Error(
          "Invalid report_type. Must be 'account' or 'general_ledger'"
        );
      }

      let fileData;
      if (report_type === "account") {
        fileData = await this.generateAccountReport({
          file_type,
          isAllAccount,
          account_type,
        });
      } else {
        fileData = await this.generateGeneralLedgerReport({
          file_type,
          filter_by,
          filter_date,
          filter_month,
        });
      }

      const query = `
        INSERT INTO "Reports" (
          printed_by, print_date, file_type, report_type, 
          account_type, "isAllAccount", filter_by, filter_date, filter_month, file_data
        )
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `;

      const result = await db.raw(query, [
        printed_by,
        file_type,
        report_type,
        account_type || null,
        isAllAccount || false,
        filter_by || null,
        filter_date || null,
        filter_month || null,
        JSON.stringify(fileData),
      ]);

      const report = result.rows[0];

      return {
        status: "success",
        message: "Report created successfully",
        data: report,
      };
    } catch (error) {
      throw new Error(`Error creating report: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const query = `
        SELECT "Reports".*, "Users".full_name as printed_by_user 
        FROM "Reports"  
        JOIN "Users" ON "Reports".printed_by = "Users".id 
        ORDER BY "Reports".print_date DESC
      `;

      const result = await db.raw(query);
      const reports = result.rows;

      const formattedReports = reports.map((report) => {
        const reportCopy = { ...report };

        if (reportCopy.file_data && typeof reportCopy.file_data === "string") {
          try {
            reportCopy.fileData = JSON.parse(reportCopy.file_data);

            delete reportCopy.file_data;
          } catch (error) {
            console.error(
              `Invalid file_data format for report ${reportCopy.id}: ${error.message}`
            );
            reportCopy.fileData = null;
          }
        } else if (
          reportCopy.file_data &&
          typeof reportCopy.file_data === "object"
        ) {
          reportCopy.fileData = reportCopy.file_data;
          delete reportCopy.file_data;
        }

        return reportCopy;
      });

      return {
        status: "success",
        message: "Reports fetched successfully",
        data: formattedReports,
      };
    } catch (error) {
      throw new Error(`Error fetching reports: ${error.message}`);
    }
  }

  async generateAccountReport(report) {
    try {
      let query = `SELECT * FROM "Accounts" WHERE active = true`;
      if (!report.isAllAccount && report.account_type) {
        query += ` AND account_type = '${report.account_type}'`;
      }
      query += ` ORDER BY code ASC`;

      const result = await db.raw(query);
      const accounts = result.rows;

      if (report.file_type === "excel") {
        return await this.generateExcel(accounts, "Account Report");
      } else {
        return await this.generatePDF(accounts, "Account Report");
      }
    } catch (error) {
      throw new Error(`Error generating account report: ${error.message}`);
    }
  }

  async generateExcel(data, title) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    worksheet.columns = [
      { header: "Code", key: "code", width: 15 },
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Account Type", key: "account_type", width: 15 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Status", key: "active", width: 10 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        code: item.code,
        name: item.name,
        description: item.description,
        account_type: item.account_type,
        currency: item.currency,
        active: item.active ? "Active" : "Inactive",
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer).toString("base64"),
      fileName: `${title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  async generatePDF(data, title) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    const tableHeaders = [
      ["Code", "Name", "Description", "Account Type", "Currency", "Status"],
    ];
    const tableData = data.map((item) => [
      item.code,
      item.name,
      item.description,
      item.account_type,
      item.currency,
      item.active ? "Active" : "Inactive",
    ]);

    doc.autoTable({
      startY: 30,
      head: tableHeaders,
      body: tableData,
      headStyles: { fillColor: [66, 66, 66] },
      styles: { overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
    });

    const buffer = doc.output("arraybuffer");
    return {
      buffer: Buffer.from(buffer).toString("base64"),
      fileName: `${title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`,
      contentType: "application/pdf",
    };
  }

  async generateGeneralLedgerReport(report) {
    try {
      let data;

      if (!["day", "month"].includes(report.filter_by)) {
        throw new Error("Invalid filter_by. Must be 'day' or 'month'");
      }

      if (report.filter_by === "day") {
        if (!report.filter_date) {
          throw new Error("filter_date is required for daily report");
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(report.filter_date)) {
          throw new Error("Invalid filter_date format. Must be 'YYYY-MM-DD'");
        }

        const ledgerId = await this.getLedgerIdByDate(report.filter_date);
        if (!ledgerId) {
          throw new Error("No ledger found for the specified date");
        }

        const dailyReport = await this.generalLedgersService.findById(ledgerId);
        data = dailyReport.data;
      } else if (report.filter_by === "month") {
        if (!report.filter_month) {
          throw new Error("filter_month is required for monthly report");
        }

        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(report.filter_month)) {
          throw new Error("Invalid filter_month format. Must be 'YYYY-MM'");
        }

        const [year, month] = report.filter_month.split("-");
        const monthlyReport = await this.generalLedgersService.getMonthlyRecap(
          year,
          month
        );
        data = monthlyReport.data;
      } else {
        throw new Error("Invalid filter parameters");
      }

      if (report.file_type === "excel") {
        return await this.generateExcelLedger(data, "General Ledger Report");
      } else {
        return await this.generatePDFLedger(data, "General Ledger Report");
      }
    } catch (error) {
      throw new Error(
        `Error generating general ledger report: ${error.message}`
      );
    }
  }

  async getLedgerIdByDate(date) {
    console.log("Filter date received:", date);
    const query = `SELECT id FROM "GeneralLedgers" WHERE DATE(transaction_date) = ? LIMIT 1`;
    const result = await db.raw(query, [date]);
    console.log("Query result:", result.rows);
    return result.rows[0]?.id;
  }

  async generateExcelLedger(data, title) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    if (data.dailyEntries) {
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Transaction Code", key: "transaction_code", width: 20 },
        { header: "Description", key: "description", width: 40 },
        { header: "Debit", key: "debit", width: 15 },
        { header: "Credit", key: "credit", width: 15 },
      ];

      data.dailyEntries.forEach((entry) => {
        worksheet.addRow({
          date: entry.date,
          transaction_code: entry.transaction_code,
          description: entry.description,
          debit: entry.debit,
          credit: entry.credit,
        });
      });

      worksheet.addRow([]);
      worksheet.addRow({
        date: "Total",
        debit: data.summary.totalDebit,
        credit: data.summary.totalCredit,
      });
    } else {
      worksheet.columns = [
        { header: "Account Code", key: "account_code", width: 15 },
        { header: "Account Name", key: "account_name", width: 30 },
        { header: "Description", key: "description", width: 40 },
        { header: "Debit", key: "debit", width: 15 },
        { header: "Credit", key: "credit", width: 15 },
      ];

      data.journals.forEach((journal) => {
        worksheet.addRow({
          account_code: journal.account_info.code,
          account_name: journal.account_info.name,
          description: journal.description,
          debit: journal.debit,
          credit: journal.credit,
        });
      });
    }

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer).toString("base64"),
      fileName: `${title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  async generatePDFLedger(data, title) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    if (data.dailyEntries) {
      const tableHeaders = [
        ["Date", "Transaction Code", "Description", "Debit", "Credit"],
      ];
      const tableData = data.dailyEntries.map((entry) => [
        entry.date,
        entry.transaction_code,
        entry.description,
        entry.debit,
        entry.credit,
      ]);

      doc.autoTable({
        startY: 30,
        head: tableHeaders,
        body: tableData,
        headStyles: { fillColor: [66, 66, 66] },
        styles: { overflow: "linebreak" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
        },
      });

      doc.text(
        `Total Debit: ${data.summary.totalDebit}`,
        14,
        doc.autoTable.previous.finalY + 10
      );
      doc.text(
        `Total Credit: ${data.summary.totalCredit}`,
        14,
        doc.autoTable.previous.finalY + 20
      );
    } else {
      const tableHeaders = [
        ["Account Code", "Account Name", "Description", "Debit", "Credit"],
      ];
      const tableData = data.journals.map((journal) => [
        journal.account_info.code,
        journal.account_info.name,
        journal.description,
        journal.debit,
        journal.credit,
      ]);

      doc.autoTable({
        startY: 30,
        head: tableHeaders,
        body: tableData,
        headStyles: { fillColor: [66, 66, 66] },
        styles: { overflow: "linebreak" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
        },
      });
    }

    const buffer = doc.output("arraybuffer");
    return {
      buffer: Buffer.from(buffer).toString("base64"),
      fileName: `${title.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`,
      contentType: "application/pdf",
    };
  }

  async findById(id) {
    try {
      const query = `SELECT "Reports".*, "Users".full_name as printed_by_user 
                     FROM "Reports"  
                     JOIN "Users" ON "Reports".printed_by = "Users".id 
                     WHERE "Reports".id = ?`;
      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Report not found",
          data: null,
        };
      }

      const report = result.rows[0];

      if (report.file_data && typeof report.file_data === "string") {
        try {
          report.fileData = JSON.parse(report.file_data);
        } catch (error) {
          throw new Error(`Invalid file_data format: ${error.message}`);
        }
      } else if (report.file_data && typeof report.file_data === "object") {
        report.fileData = report.file_data;
      }

      return {
        status: "success",
        message: "Report fetched successfully",
        data: report,
      };
    } catch (error) {
      throw new Error(`Error fetching report: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM "Reports" WHERE id = ? RETURNING *`;
      const result = await db.raw(query, [id]);

      if (!result.rows[0]) {
        return {
          status: "error",
          message: "Report not found",
          data: null,
        };
      }

      const deletedReport = result.rows[0];

      return {
        status: "success",
        message: "Report deleted successfully",
        data: deletedReport,
      };
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }
}
