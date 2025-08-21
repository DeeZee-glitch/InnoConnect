// utils/exportToCSV.js
export const exportToCSV = (rows, columns, filename = "monitorCondition.csv") => {
  if (!rows.length) {
    alert("No data to export.");
    return;
  }

  const headers = columns.map((col) => col.Header).join(",");
  const csvRows = rows.map((row) => columns.map((col) => `"${row[col.accessor] || ""}"`).join(","));

  const csvContent = [headers, ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
