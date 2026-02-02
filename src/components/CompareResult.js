// CompareResult.js
// Shows a preview of differences and allows CSV download
import React from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

function CompareResult({ diffRows, columnMap, onBack }) {
  // Prepare preview (first 20 rows)
  const preview = diffRows.slice(0, 20);

  // Download diff as CSV
  const handleDownload = () => {
    const csv = Papa.unparse(diffRows.map(row => ({
      key: row.key,
      column: row.column,
      valueA: row.valueA,
      valueB: row.valueB
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'diff.csv');
  };

  return (
    <div className="compare-result bg-white rounded-xl shadow-md p-8 mt-6">
      <h2 className="text-xl font-bold mb-4">Differences Preview</h2>
      {diffRows.length === 0 ? (
        <div className="text-green-600 font-semibold">No differences found!</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-2 border">Key</th>
                  <th className="p-2 border">Column</th>
                  <th className="p-2 border">File A Value</th>
                  <th className="p-2 border">File B Value</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border p-2">{row.key}</td>
                    <td className="border p-2">{row.column}</td>
                    <td className="border p-2">{row.valueA}</td>
                    <td className="border p-2">{row.valueB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
              onClick={handleDownload}
            >Download Diff CSV</button>
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

export default CompareResult;
