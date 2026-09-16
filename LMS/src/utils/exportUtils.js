/**
 * Utility to convert data arrays into CSV and trigger browser download
 */
export const exportToCSV = (data, filename = "lab_export.csv", customHeaders = null) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // Extract keys or use custom headers mapping
  const keys = Object.keys(data[0]).filter(k => k !== "__v");
  
  const headers = customHeaders || keys;
  const headerRow = headers.join(",");

  const rows = data.map(item => {
    return keys.map(key => {
      let val = item[key] !== undefined && item[key] !== null ? item[key] : "";
      if (typeof val === "object") {
        val = JSON.stringify(val);
      }
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
