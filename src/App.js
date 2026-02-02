// Main entry point for the app
import React, { useState, useEffect } from 'react';
import useFileParser from './hooks/useFileParser';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import CompareResult from './components/CompareResult';
import SubtractResult from './components/SubtractResult';
import ProgressBar from './components/ProgressBar';
import './App.css';

function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [headersA, setHeadersA] = useState([]);
  const [headersB, setHeadersB] = useState([]);
  const [dataA, setDataA] = useState([]);
  const [dataB, setDataB] = useState([]);
  const [primaryKeyA, setPrimaryKeyA] = useState('');
  const [primaryKeyB, setPrimaryKeyB] = useState('');
  const [columnMap, setColumnMap] = useState([]);
  const [diffRows, setDiffRows] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');



  // File parsing hook
  const parser = useFileParser();

  // Handle file selection and validation (separate for A and B)
  const handleFilesSelected = async (file, which) => {
    setError('');
    if (!file) return;
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      setError('Only CSV and Excel files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Each file must be ≤ 10 MB.');
      return;
    }
    if (which === 'A') {
      setFileA(file);
      const parsedA = await parser.parseFile(file);
      if (!parsedA) {
        setError('Failed to parse File A.');
        return;
      }
      setHeadersA(parsedA.headers);
      setDataA(parsedA.data);
    } else if (which === 'B') {
      setFileB(file);
      const parsedB = await parser.parseFile(file);
      if (!parsedB) {
        setError('Failed to parse File B.');
        return;
      }
      setHeadersB(parsedB.headers);
      setDataB(parsedB.data);
    }
  };

  // Recalculate diff whenever files, mapping, or keys change
  useEffect(() => {
    if (
      fileA && fileB &&
      headersA.length > 0 && headersB.length > 0 &&
      primaryKeyA && primaryKeyB &&
      columnMap.length > 0 &&
      dataA.length > 0 && dataB.length > 0
    ) {
      setProgress(0);
      const compareData = require('./utils/compare').compareData;
      const requiredA = [primaryKeyA, ...columnMap.map(m => m.a)];
      const requiredB = [primaryKeyB, ...columnMap.map(m => m.b)];
      const filteredA = dataA.map(row => {
        const obj = {};
        requiredA.forEach(col => { obj[col] = row[col]; });
        return obj;
      });
      const filteredB = dataB.map(row => {
        const obj = {};
        requiredB.forEach(col => { obj[col] = row[col]; });
        return obj;
      });
      const diffs = compareData(
        filteredA,
        filteredB,
        primaryKeyA,
        primaryKeyB,
        columnMap,
        (p) => setProgress(p)
      );
      setDiffRows(diffs);
    } else {
      setDiffRows([]);
    }
    // eslint-disable-next-line
  }, [fileA, fileB, headersA, headersB, dataA, dataB, primaryKeyA, primaryKeyB, columnMap]);

  // Run comparison (only load required columns)
  const runComparison = () => {
    setProgress(0);
    const compareData = require('./utils/compare').compareData;
    // Only keep required columns in dataA and dataB
    const requiredA = [primaryKeyA, ...columnMap.map(m => m.a)];
    const requiredB = [primaryKeyB, ...columnMap.map(m => m.b)];
    const filteredA = dataA.map(row => {
      const obj = {};
      requiredA.forEach(col => { obj[col] = row[col]; });
      return obj;
    });
    const filteredB = dataB.map(row => {
      const obj = {};
      requiredB.forEach(col => { obj[col] = row[col]; });
      return obj;
    });
    const diffs = compareData(
      filteredA,
      filteredB,
      primaryKeyA,
      primaryKeyB,
      columnMap,
      (p) => setProgress(p)
    );
    setDiffRows(diffs);
    setStep(3);
  };

  // Single page UI
  return (
    <div className="app-container min-h-screen bg-gray-50 py-8 px-2">
      <h1 className="text-2xl font-bold text-blue-700 mb-8 text-center">Local CSV/Excel Compare Tool</h1>
      <FileUpload
        onFilesSelected={handleFilesSelected}
        error={error || parser.error}
        loading={parser.loading}
        fileA={fileA}
        fileB={fileB}
      />
      <ColumnMapper
        headersA={headersA}
        headersB={headersB}
        primaryKeyA={primaryKeyA}
        primaryKeyB={primaryKeyB}
        setPrimaryKeyA={setPrimaryKeyA}
        setPrimaryKeyB={setPrimaryKeyB}
        columnMap={columnMap}
        setColumnMap={setColumnMap}
        onNext={() => {}}
      />
      <CompareResult
        diffRows={diffRows}
        columnMap={columnMap}
        onBack={() => {}}
      />
    </div>
  );

  // Stepper navigation (modern Tailwind)
  const stepLabels = ['Upload', 'Column Mapping', 'Compare', 'Results'];

  return (
    <div className="app-container min-h-screen bg-gray-50 py-8 px-2">
      <h1 className="text-2xl font-bold text-blue-700 mb-8 text-center">Local CSV/Excel Compare Tool</h1>
      <div className="flex justify-center mb-8">
        <ol className="flex space-x-4">
          {stepLabels.map((label, idx) => (
            <li key={label} className="flex items-center">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold mr-2 ${
                  step === idx
                    ? 'bg-blue-600 shadow-lg scale-110'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {idx + 1}
              </span>
              <span className={step === idx ? 'text-blue-700 font-semibold' : 'text-gray-600'}>{label}</span>
              {idx < stepLabels.length - 1 && (
                <svg className="w-5 h-5 mx-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
      {renderStep()}
    </div>
  );
}

export default App;
