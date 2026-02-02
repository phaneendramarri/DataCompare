// FileUpload.js
// Handles file selection, drag & drop, validation, and error display
import React, { useRef } from 'react';

function FileUpload({ onFilesSelected, error, loading }) {
  const fileInputRef = useRef();

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  return (
    <div
      className="file-upload flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-8 bg-white shadow-md transition hover:border-blue-600 hover:bg-blue-50 min-h-[220px] mb-6"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        multiple
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4l-4-4m0 0l4-4m-4 4h12" />
        </svg>
        <button
          type="button"
          className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          Select CSV or Excel Files
        </button>
        <span className="text-gray-500 mt-2">or drag & drop files here</span>
      </div>
      {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
    </div>
  );
}

export default FileUpload;
