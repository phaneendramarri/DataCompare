// ColumnMapper.js
// UI for selecting primary keys and mapping columns between File A and File B
import React, { useEffect, useState } from 'react';

function ColumnMapper({
  headersA,
  headersB,
  primaryKeyA,
  primaryKeyB,
  setPrimaryKeyA,
  setPrimaryKeyB,
  columnMap,
  setColumnMap,
  onNext
}) {
  // State for search terms for each mapping row
  const [searchTerms, setSearchTerms] = useState(() => {
    const saved = localStorage.getItem('columnSearchTerms');
    return saved ? JSON.parse(saved) : [];
  });

  // Save search terms to localStorage
  useEffect(() => {
    localStorage.setItem('columnSearchTerms', JSON.stringify(searchTerms));
  }, [searchTerms]);
  // Load mapping and keys from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('columnMapping');
    if (saved) {
      const { pkA, pkB, map } = JSON.parse(saved);
      if (pkA && pkB && map) {
        setPrimaryKeyA(pkA);
        setPrimaryKeyB(pkB);
        setColumnMap(map);
      }
    }
  }, [setPrimaryKeyA, setPrimaryKeyB, setColumnMap]);

  // Save mapping and keys to localStorage on change
  useEffect(() => {
    localStorage.setItem('columnMapping', JSON.stringify({ pkA: primaryKeyA, pkB: primaryKeyB, map: columnMap }));
  }, [primaryKeyA, primaryKeyB, columnMap]);
  // Add a new mapping row
  const addMapping = () => {
    setColumnMap([...columnMap, { a: '', b: '' }]);
    setSearchTerms([...searchTerms, { a: '', b: '' }]);
  };

  // Update a mapping row
  const updateMapping = (idx, field, value) => {
    const updated = columnMap.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setColumnMap(updated);
  };

  // Remove a mapping row
  const removeMapping = (idx) => {
    setColumnMap(columnMap.filter((_, i) => i !== idx));
    setSearchTerms(searchTerms.filter((_, i) => i !== idx));
  };

  // Only allow mapping columns that are not primary keys
  const availableA = headersA.filter(h => h !== primaryKeyA);
  const availableB = headersB.filter(h => h !== primaryKeyB);

  return (
    <div className="column-mapper">
      <h2 className="text-xl font-bold mb-4">Column Mapping</h2>
      <div className="flex gap-8 mb-4">
        <div>
          <label className="block mb-1 font-medium">Primary Key (File A):</label>
          <select
            className="block w-48 p-2 border rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={primaryKeyA}
            onChange={e => setPrimaryKeyA(e.target.value)}
          >
            <option value="">Select...</option>
            {headersA.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Primary Key (File B):</label>
          <select
            className="block w-48 p-2 border rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={primaryKeyB}
            onChange={e => setPrimaryKeyB(e.target.value)}
          >
            <option value="">Select...</option>
            {headersB.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
      <table className="w-full border-collapse mb-3">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">File A Column</th>
            <th className="p-2 border">File B Column</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {columnMap.map((m, idx) => {
            // Filtered options for search
            const filteredA = availableA.filter(h => h.toLowerCase().includes((searchTerms[idx]?.a || '').toLowerCase()));
            const filteredB = availableB.filter(h => h.toLowerCase().includes((searchTerms[idx]?.b || '').toLowerCase()));
            return (
              <tr key={idx}>
                <td className="border p-1">
                  <div className="mb-1 flex gap-1">
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Search..."
                      value={searchTerms[idx]?.a || ''}
                      onChange={e => {
                        const newTerms = [...searchTerms];
                        newTerms[idx] = { ...newTerms[idx], a: e.target.value };
                        setSearchTerms(newTerms);
                      }}
                    />
                  </div>
                  <select
                    className="w-full p-2 border rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={m.a}
                    onChange={e => updateMapping(idx, 'a', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {filteredA.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td className="border p-1">
                  <div className="mb-1 flex gap-1">
                    <input
                      type="text"
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Search..."
                      value={searchTerms[idx]?.b || ''}
                      onChange={e => {
                        const newTerms = [...searchTerms];
                        newTerms[idx] = { ...newTerms[idx], b: e.target.value };
                        setSearchTerms(newTerms);
                      }}
                    />
                  </div>
                  <select
                    className="w-full p-2 border rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={m.b}
                    onChange={e => updateMapping(idx, 'b', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {filteredB.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td className="border p-1 text-center">
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => removeMapping(idx)}
                  >Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-4">
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={addMapping}
        >Add Mapping</button>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={onNext}
          disabled={
            !primaryKeyA || !primaryKeyB ||
            columnMap.length === 0 ||
            columnMap.some(m => !m.a || !m.b)
          }
        >Next</button>
      </div>
    </div>
  );
}

export default ColumnMapper;
