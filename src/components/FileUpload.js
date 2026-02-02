// FileUpload.js
// Handles file selection, drag & drop, validation, and error display
import React, { useRef } from 'react';

function FileUpload({ onFilesSelected, error, loading, fileA, fileB }) {
  const fileARef = useRef();
  const fileBRef = useRef();

  // Handle file input change for File A
  const handleFileAChange = (e) => {
    const file = e.target.files[0];
    onFilesSelected(file, 'A');
  };
  // Handle file input change for File B
  const handleFileBChange = (e) => {
    const file = e.target.files[0];
    onFilesSelected(file, 'B');
  };

  return (
    <div className="file-upload flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-8 bg-white shadow-md min-h-[220px] mb-6">
      <div className="w-full flex flex-col md:flex-row gap-8 justify-center">
        <div className="flex-1 flex flex-col items-center">
          <label className="font-semibold mb-2">Select File A</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: 'none' }}
            ref={fileARef}
            onChange={handleFileAChange}
            disabled={loading}
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => fileARef.current.click()}
            disabled={loading}
          >
            {fileA ? `Selected: ${fileA.name}` : 'Choose File A'}
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <label className="font-semibold mb-2">Select File B</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: 'none' }}
            ref={fileBRef}
            onChange={handleFileBChange}
            disabled={loading}
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => fileBRef.current.click()}
            disabled={loading}
          >
            {fileB ? `Selected: ${fileB.name}` : 'Choose File B'}
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 font-medium mt-4">{error}</div>}
    </div>
  );
}

export default FileUpload;
