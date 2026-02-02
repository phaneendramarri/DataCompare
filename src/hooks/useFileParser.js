// useFileParser.js
// Custom hook to parse CSV and Excel files using papaparse and xlsx
import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function useFileParser() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Parse a file and return headers + data
  const parseFile = async (file) => {
    setError(null);
    setLoading(true);
    try {
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        return await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              setLoading(false);
              resolve({ headers: results.meta.fields, data: results.data });
            },
            error: (err) => {
              setLoading(false);
              setError('CSV parse error');
              reject(err);
            },
          });
        });
      } else if (file.name.endsWith('.xlsx')) {
        // Parse Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = json[0];
        const rows = json.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        });
        setLoading(false);
        return { headers, data: rows };
      } else {
        setLoading(false);
        setError('Unsupported file type');
        return null;
      }
    } catch (err) {
      setLoading(false);
      setError('File parse error');
      return null;
    }
  };

  return { parseFile, error, loading };
}

export default useFileParser;
