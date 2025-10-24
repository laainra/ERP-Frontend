import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

jsPDF.API.autoTable = autoTable;

/**
 * Generate PDF report
 * @param {Object} options
 * @param {String} options.title - Judul laporan
 * @param {Array<Array<String>>} options.columns - Array header tabel
 * @param {Array<Array>} options.rows - Data tabel
 * @param {String} [options.dateRange] - Range tanggal untuk ditampilkan di bawah judul
 * @param {String} [options.additionalInfo] - Teks tambahan
 * @param {String} [options.fileName] - Nama file PDF
 */
export const generatePDFReport = ({ title, columns, rows, dateRange, additionalInfo, fileName }) => {
  const doc = new jsPDF("l", "mm", "a4");


  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  if (dateRange) {
    doc.setFontSize(12);
    doc.text(dateRange, doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });
  }

  autoTable(doc, {
    head: columns,
    body: rows,
    startY: 30, 
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });


  if (additionalInfo) {
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text("Info Tambahan:", 10, finalY + 10);
    doc.text(additionalInfo, 10, finalY + 15);
  }

  doc.save(fileName || `Laporan_${Date.now()}.pdf`);
};
