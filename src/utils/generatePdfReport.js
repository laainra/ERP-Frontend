import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

jsPDF.API.autoTable = autoTable;

/**
 * Generate PDF report dengan tampilan tabel rapi & fleksibel.
 * FIX: Memastikan semua kolom terlihat dengan mendistribusikan lebar kolom secara otomatis 
 * berdasarkan head, dan tetap memungkinkan linebreak pada body.
 */
export const generatePDFReport = ({
  title,
  columns,
  rows,
  dateRange,
  additionalInfo,
  fileName,
}) => {
  // Menggunakan 'l' (landscape) untuk ruang horizontal MAKSIMAL
  const doc = new jsPDF("l", "mm", "a4");

  // === HEADER ===
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  if (dateRange) {
    doc.setFontSize(12);
    doc.text(dateRange, doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });
  }

  // === TABEL ===
  autoTable(doc, {
    head: columns,
    body: rows,
    startY: 30,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      // Kunci: Teks panjang di dalam sel akan memecah baris ke bawah
      overflow: "linebreak", 
      valign: "middle",
      halign: "left",
      // Hapus cellWidth: "wrap". Ini akan digantikan oleh tableWidth: "auto"
      // yang akan membagi lebar kolom secara merata.
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center",
      valign: "middle",
      // Kunci: Gunakan 'wrap' di headStyles. Ini akan memaksa lebar kolom
      // untuk menyesuaikan header, tetapi tidak memaksa lebar yang terlalu besar.
      cellWidth: 'wrap' 
    },
    bodyStyles: {
      lineColor: [200, 200, 200],
      textColor: 20,
    },
    
    // Pastikan columnStyles dikosongkan untuk menghindari konflik lebar
    columnStyles: {},
    
    // Kunci: 'auto' memastikan tabel menggunakan seluruh lebar halaman yang tersedia
    // dan mendistribusikan kolom secara merata (kecuali dipengaruhi oleh headStyles.cellWidth='wrap').
    tableWidth: "auto", 
    
    pageBreak: "auto",
    // Kunci: Memastikan satu baris data tidak terpotong ke halaman lain
    rowPageBreak: "avoid", 
    didDrawPage: function () {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(
        `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // === INFO TAMBAHAN ===
  if (additionalInfo) {
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text("Info Tambahan:", 10, finalY + 10);
    doc.setFontSize(11);
    doc.text(additionalInfo, 10, finalY + 16, { maxWidth: 270 });
  }

  // === SIMPAN FILE ===
  doc.save(fileName || `Laporan_${Date.now()}.pdf`);
};