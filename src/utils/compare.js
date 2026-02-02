import * as XLSX from 'xlsx';
/**
 * Subtracts values of a specified column in dataB from dataA and exports the result to a new Excel file.
 * @param {Array} dataA - Array of objects from File A
 * @param {Array} dataB - Array of objects from File B
 * @param {String} keyA - Primary key in File A
 * @param {String} keyB - Primary key in File B
 * @param {String} colA - Column in File A to subtract from
 * @param {String} colB - Column in File B to subtract
 * @param {String} outputFileName - Name of the output Excel file
 */
export function subtractAndExportToExcel(dataA, dataB, keyA, keyB, colA, colB, outputFileName = 'subtracted_result.xlsx') {
  const mapB = new Map();
  dataB.forEach(row => {
    mapB.set(row[keyB], row);
  });
  const result = [];
  dataA.forEach(rowA => {
    const key = rowA[keyA];
    const rowB = mapB.get(key);
    let valueA = parseFloat(rowA[colA]) || 0;
    let valueB = rowB ? (parseFloat(rowB[colB]) || 0) : 0;
    result.push({
      [keyA]: key,
      [`${colA} - ${colB}`]: valueA - valueB
    });
  });
  // Export to Excel
  const ws = XLSX.utils.json_to_sheet(result);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Result');
  XLSX.writeFile(wb, outputFileName);
}
// compare.js
// Utility to compare two arrays of objects by primary key and mapped columns
// Returns an array of diff rows: { key, column, valueA, valueB }

/**
 * Compare two datasets by primary key and mapped columns
 * @param {Array} dataA - Array of objects from File A
 * @param {Array} dataB - Array of objects from File B
 * @param {String} keyA - Primary key in File A
 * @param {String} keyB - Primary key in File B
 * @param {Array} columnMap - Array of { a: colA, b: colB }
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Array} Array of diff rows
 */
export function compareData(dataA, dataB, keyA, keyB, columnMap, onProgress) {
  const mapA = new Map();
  dataA.forEach(row => {
    mapA.set(row[keyA], row);
  });
  const diffs = [];
  const total = dataB.length;
  dataB.forEach((rowB, idx) => {
    const key = rowB[keyB];
    const rowA = mapA.get(key);
    if (!rowA) {
      // Row missing in A
      columnMap.forEach(({ a, b }) => {
        diffs.push({ key, column: b, valueA: '', valueB: rowB[b] });
      });
    } else {
      // Compare mapped columns
      columnMap.forEach(({ a, b }) => {
        if ((rowA[a] || '') !== (rowB[b] || '')) {
          diffs.push({ key, column: b, valueA: rowA[a] || '', valueB: rowB[b] || '' });
        }
      });
    }
    if (onProgress && idx % 100 === 0) {
      onProgress(Math.round((idx / total) * 100));
    }
  });
  // Find rows in A missing from B
  const keysB = new Set(dataB.map(r => r[keyB]));
  dataA.forEach(rowA => {
    if (!keysB.has(rowA[keyA])) {
      columnMap.forEach(({ a, b }) => {
        diffs.push({ key: rowA[keyA], column: a, valueA: rowA[a] || '', valueB: '' });
      });
    }
  });
  if (onProgress) onProgress(100);
  return diffs;
}
