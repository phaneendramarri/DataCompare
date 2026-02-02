// Main entry point for the app
import React, { useState } from 'react';
import useFileParser from './hooks/useFileParser';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import CompareResult from './components/CompareResult';
import SubtractResult from './components/SubtractResult';
import ProgressBar from './components/ProgressBar';
import './App.css';

function App() {
  // Step: 0 = Upload, 1 = Mapping, 2 = Compare, 3 = Download
  const [step, setStep] = useState(0);
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
  const [subtractRows, setSubtractRows] = useState([]);
  const [subtractKey, setSubtractKey] = useState('');
  const [subtractCol, setSubtractCol] = useState('');



  // File parsing hook
  const parser = useFileParser();

  // Handle file selection and validation
  const handleFilesSelected = async (files) => {
    setError('');
    if (files.length !== 2) {
      setError('Please select exactly two files.');
      return;
    }
    const [a, b] = files;
    if (!/\.(csv|xlsx)$/i.test(a.name) || !/\.(csv|xlsx)$/i.test(b.name)) {
      setError('Only CSV and Excel files are supported.');
      return;
    }
    if (a.size > 10 * 1024 * 1024 || b.size > 10 * 1024 * 1024) {
      setError('Each file must be ≤ 10 MB.');
      return;
    }
    setFileA(a);
    setFileB(b);
    // Parse both files
    const parsedA = await parser.parseFile(a);
    const parsedB = await parser.parseFile(b);
    if (!parsedA || !parsedB) {
      setError('Failed to parse one or both files.');
      return;
    }
    setHeadersA(parsedA.headers);
    setHeadersB(parsedB.headers);
    setDataA(parsedA.data);
    setDataB(parsedB.data);
    // Do NOT reset columnMap here; keep the one from localStorage
    setStep(1);
  };

  // Handle mapping next
  const handleMappingNext = () => {
    setStep(2);
    setProgress(0);
    setTimeout(() => runComparison(), 100); // Defer to allow UI update
  };

  // Run comparison and subtraction
  const runComparison = () => {
    setProgress(0);
    const compareUtils = require('./utils/compare');
    const diffs = compareUtils.compareData(
      dataA,
      dataB,
      primaryKeyA,
      primaryKeyB,
      columnMap,
      (p) => setProgress(p)
    );
    setDiffRows(diffs);

    // For subtraction: use first mapped column if available
    if (columnMap.length > 0) {
      const { a: colA, b: colB } = columnMap[0];
      setSubtractKey(primaryKeyA);
      setSubtractCol(`${colA} - ${colB}`);
      // Get subtraction result rows (do not export here)
      const mapB = new Map();
      dataB.forEach(row => { mapB.set(row[primaryKeyB], row); });
      const result = [];
      dataA.forEach(rowA => {
        const key = rowA[primaryKeyA];
        const rowB = mapB.get(key);
        let valueA = parseFloat(rowA[colA]) || 0;
        let valueB = rowB ? (parseFloat(rowB[colB]) || 0) : 0;
        result.push({
          [primaryKeyA]: key,
          [`${colA} - ${colB}`]: valueA - valueB
        });
      });
      setSubtractRows(result);
    } else {
      setSubtractRows([]);
      setSubtractKey('');
      setSubtractCol('');
    }
    setStep(3);
  };

  // Stepper UI
  const renderStep = () => {
    if (step === 0) {
      return (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          error={error || parser.error}
          loading={parser.loading}
        />
      );
    }
    if (step === 1) {
      return (
        <ColumnMapper
          headersA={headersA}
          headersB={headersB}
          primaryKeyA={primaryKeyA}
          primaryKeyB={primaryKeyB}
          setPrimaryKeyA={setPrimaryKeyA}
          setPrimaryKeyB={setPrimaryKeyB}
          columnMap={columnMap}
          setColumnMap={setColumnMap}
          onNext={handleMappingNext}
        />
      );
    }
    if (step === 2) {
      return (
        <div>
          <h2>Comparing...</h2>
          <ProgressBar progress={progress} />
        </div>
      );
    }
    if (step === 3) {
      // Show only subtraction result
      return (
        <SubtractResult
          resultRows={subtractRows}
          keyName={subtractKey}
          diffColName={subtractCol}
          onBack={() => setStep(1)}
        />
      );
    }
    return null;
  };

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
