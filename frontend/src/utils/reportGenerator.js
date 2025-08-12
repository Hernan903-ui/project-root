// src/utils/reportGenerator.js - CÓDIGO CORREGIDO
import { jsPDF } from "jspdf" // Cambiado de "import jsPDF" a "import { jsPDF }"
import autoTable from "jspdf-autotable" // Importación explícita del módulo autoTable

// Utilidad simple para generar reportes (placeholder)
export const generatePDF = (title, data, columns, fileName = "reporte.pdf") => {
  /*console.log('Generando reporte PDF:', { title, data, columns });
  
  // Por ahora, solo mostrar un alert
  alert(`Generando reporte: ${title} con ${data.length} registros`);
  
  // Aquí se podría integrar una librería como jsPDF o similar
  // Para este ejemplo, simplemente logueamos los datos
  console.table(data);*/
  const doc = new jsPDF()
  const currentDate = new Date().toLocaleString()

  // Título
  doc.setFontSize(18)
  doc.text(title, 14, 22)

  // Fecha
  doc.setFontSize(11)
  doc.text(`Fecha: ${currentDate}`, 14, 30)

  // Preparar datos para la tabla
  const tableColumn = columns.map((col) => col.header)
  const tableRows = data.map((item) => {
    return columns.map((col) => {
      const field = col.field
      const value = item[field] != null ? item[field].toString() : ""
      return value
    })
  })

  // Generar tabla - usando autoTable correctamente
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: 40 } },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
  })

  // Añadir paginación
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10)
  }

  // Guardar/descargar PDF
  doc.save(fileName)
}

export const exportToCSV = (data, columns, fileName = "reporte.csv") => {
  // Encabezados CSV
  const headers = columns.map((col) => col.header)
  let csvContent = headers.join(",") + "\n"

  // Filas de datos
  data.forEach((item) => {
    const row = columns.map((col) => {
      const value = item[col.field]
      // Manejar valores que pueden contener comas
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`
      }
      return value != null ? value : ""
    })
    csvContent += row.join(",") + "\n"
  })

  // Crear el archivo y descargarlo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (navigator.msSaveBlob) {
    // Para IE
    navigator.msSaveBlob(blob, fileName)
  } else {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const exportToExcel = (data, columns, fileName = "reporte.xlsx") => {
  // Esta es una implementación básica.
  // Para una implementación real, se recomienda usar bibliotecas como xlsx o exceljs

  // Como alternativa simple, generamos un CSV y le cambiamos la extensión
  exportToCSV(data, columns, fileName)

  // Mensaje informativo
  console.log(
    "Exportación a Excel simulada mediante CSV. Para una integración real, considere usar bibliotecas como xlsx o exceljs.",
  )
}

export const printReport = (title, data, columns) => {
  // Crear un elemento oculto para imprimir
  const printFrame = document.createElement("iframe")
  printFrame.style.position = "absolute"
  printFrame.style.top = "-9999px"
  printFrame.style.left = "-9999px"
  document.body.appendChild(printFrame)

  // Generar contenido HTML para imprimir
  const doc = printFrame.contentDocument || printFrame.contentWindow.document
  doc.open()
  doc.write("<html><head><title>" + title + "</title>")

  // Estilos para la impresión
  doc.write(`
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { font-size: 18px; margin-bottom: 10px; }
      p.date { font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #ddd; }
      td { padding: 8px; border: 1px solid #ddd; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      @media print {
        .no-print { display: none; }
        body { margin: 0; padding: 15px; }
      }
    </style>
  `)

  doc.write("</head><body>")
  doc.write("<h1>" + title + "</h1>")
  doc.write('<p class="date">Fecha: ' + new Date().toLocaleString() + "</p>")

  // Tabla
  doc.write("<table>")

  // Encabezados
  doc.write("<tr>")
  columns.forEach((col) => {
    doc.write("<th>" + col.header + "</th>")
  })
  doc.write("</tr>")

  // Filas de datos
  data.forEach((item) => {
    doc.write("<tr>")
    columns.forEach((col) => {
      const value = item[col.field] != null ? item[col.field] : ""
      doc.write("<td>" + value + "</td>")
    })
    doc.write("</tr>")
  })

  doc.write("</table>")

  // Botón para imprimir (solo visible en la vista previa)
  doc.write('<div class="no-print" style="margin-top: 20px; text-align: center;">')
  doc.write('<button onclick="window.print()">Imprimir</button>')
  doc.write("</div>")

  doc.write("</body></html>")
  doc.close()

  // Imprimir o mostrar vista previa
  setTimeout(() => {
    try {
      printFrame.contentWindow.focus()
      printFrame.contentWindow.print()
    } catch (error) {
      console.error("Error al imprimir:", error)
    }
    // No eliminamos el iframe para permitir que el usuario imprima el documento
  }, 500)
}

// Función para generar reportes con diferentes formatos
export const generateReport = (format, title, data, columns, fileName) => {
  switch (format.toLowerCase()) {
    case "pdf":
      return generatePDF(title, data, columns, fileName || "reporte.pdf")
    case "csv":
      return exportToCSV(title, data, columns, fileName || "reporte.csv")
    case "excel":
      return exportToExcel(title, data, columns, fileName || "reporte.xlsx")
    case "print":
      return printReport(title, data, columns)
    default:
      console.error("Formato de reporte no soportado:", format)
      return null
  }
}

export const generateExcel = (title, data, columns) => {
  console.log("Generando reporte Excel:", { title, data, columns })
  alert(`Generando reporte Excel: ${title} con ${data.length} registros`)
}
