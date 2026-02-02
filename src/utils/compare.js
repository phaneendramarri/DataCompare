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
  const allKeys = new Set([
    ...dataA.map(row => row[keyA]),
    ...dataB.map(row => row[keyB])
  ]);
  const resultRows = [];
  let idx = 0;
  allKeys.forEach(key => {
    const rowA = mapA.get(key);
    const rowB = dataB.find(row => row[keyB] === key);
    const result = { key };
    columnMap.forEach(({ a, b }) => {
      const valueA = rowA ? parseFloat(rowA[a]) || 0 : 0;
      const valueB = rowB ? parseFloat(rowB[b]) || 0 : 0;
      result[b + '_diff'] = valueA - valueB;
    });
    resultRows.push(result);
    if (onProgress && idx % 100 === 0) {
      onProgress(Math.round((idx / allKeys.size) * 100));
    }
    idx++;
  });
  if (onProgress) onProgress(100);
  return resultRows;
}
