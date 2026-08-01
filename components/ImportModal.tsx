'use client';

import { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], source: string) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importMethod, setImportMethod] = useState<'upload' | 'google-forms' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();

      // Parse CSV
      if (file.name.endsWith('.csv')) {
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
          }, {} as any);
        });
        onImport(data, 'csv');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        alert('Excel parsing - using CSV format for now. Please convert to CSV.');
      }
    } catch (error) {
      alert('Error reading file: ' + String(error));
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleGoogleForms = () => {
    const googleFormsUrl = 'https://forms.google.com/u/0/create';
    window.open(googleFormsUrl, '_blank');
    alert('Create your form, then export responses as CSV and upload here.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl">
        {!importMethod ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>📥 Import Leads</h2>
              <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Choose how you want to import your leads
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* File Upload Option */}
              <button
                onClick={() => setImportMethod('upload')}
                className="p-6 border-2 rounded-lg hover:shadow-lg transition-all text-center group"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-bold text-lg mb-1">Upload File</h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  CSV, Excel, JSON
                </p>
              </button>

              {/* Google Forms Option */}
              <button
                onClick={() => setImportMethod('google-forms')}
                className="p-6 border-2 rounded-lg hover:shadow-lg transition-all text-center group"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-bold text-lg mb-1">Google Forms</h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Create & export responses
                </p>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => setImportMethod(null)}
                className="text-sm" style={{ color: 'var(--primary)' }}
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold mt-3">
                {importMethod === 'upload' ? '📤 Upload File' : '📋 Google Forms'}
              </h2>
            </div>

            {importMethod === 'upload' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--primary)' }}>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                    Drag & drop your file or click to select
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="block">
                    <button
                      className="btn btn-primary"
                      disabled={isLoading}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      {isLoading ? 'Uploading...' : 'Choose File'}
                    </button>
                  </label>
                  <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
                    Supported: CSV, Excel, JSON (Max 10MB)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--primary)' }}>📝 CSV Format Example:</p>
                  <code className="text-xs block font-mono bg-white p-2 rounded border" style={{ borderColor: 'var(--border-light)' }}>
                    name,email,company,phone
                    <br />
                    John Doe,john@example.com,Acme Corp,+1-555-0123
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <p className="text-sm mb-4">
                    Click below to create a Google Form, then export responses as CSV and upload here.
                  </p>
                  <button
                    onClick={handleGoogleForms}
                    className="btn btn-primary"
                  >
                    Open Google Forms
                  </button>
                </div>

                <div className="text-xs space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <p><strong>Steps:</strong></p>
                  <p>1. Create a form with fields: Name, Email, Company, Phone</p>
                  <p>2. Share the form link with your team</p>
                  <p>3. Once responses are collected, export as CSV</p>
                  <p>4. Upload the CSV file here</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
