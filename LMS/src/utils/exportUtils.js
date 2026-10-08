/**
 * Utility to convert data arrays into CSV and trigger browser download.
 * Returns false when there is nothing to export.
 */
export const exportToCSV = (data, filename = "lab_export.csv", customHeaders = null) => {
  if (!data || !data.length) return false;

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

  // Blob download: a data: URI would be cut off at the first "#" in the data
  const blob = new Blob([[headerRow, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
