// SubtractResult.js
// Shows only the subtraction result and allows Excel export
import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

function SubtractResult({ resultRows, keyName, diffColName, onBack }) {
  // Download as Excel
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(resultRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Result');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'subtracted_result.xlsx');
  };

  return (
    <div className="subtract-result bg-white rounded-xl shadow-md p-8 mt-6">
      <h2 className="text-xl font-bold mb-4">Subtraction Result</h2>
      {resultRows.length === 0 ? (
        <div className="text-green-600 font-semibold">No data to show!</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-2 border">{keyName}</th>
                  <th className="p-2 border">{diffColName}</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border p-2">{row[keyName]}</td>
                    <td className="border p-2">{row[diffColName]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
              onClick={handleDownloadExcel}
            >Download Excel</button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onBack}
            >Back</button>
          </div>
        </>
      )}
    </div>
  );
}

export default SubtractResult;
