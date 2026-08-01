'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function ImportPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMethods = [
    {
      id: 'csv',
      icon: '📄',
      title: 'CSV File',
      description: 'Import leads from a CSV spreadsheet',
      badge: 'MOST POPULAR',
    },
    {
      id: 'excel',
      icon: '📊',
      title: 'Excel',
      description: 'Upload .xlsx or .xls files directly',
      badge: 'RECOMMENDED',
    },
    {
      id: 'google-sheets',
      icon: '📈',
      title: 'Google Sheets',
      description: 'Connect and sync from Google Sheets',
      badge: 'AUTO SYNC',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, format: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {} as any);
      });

      setProgress(50);

      const leads = data.map((row, idx) => ({
        leadId: row.leadid || `IMP-${Date.now()}-${idx}`,
        name: row.name || 'Unnamed Lead',
        email: row.email || '',
        phone: row.phone || '',
        company: row.company || '',
        source: 'import',
        stageId: 'stage-1',
        ownerId: 'user-1',
        dealValue: parseInt(row.dealvalue) || 0,
      }));

      const response = await fetch('/api/import-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, source: format }),
      });

      setProgress(90);

      if (!response.ok) throw new Error('Import failed');

      setProgress(100);

      setTimeout(() => {
        alert(`Success! Imported ${leads.length} leads.`);
        window.location.href = '/contacts';
      }, 500);
    } catch (error) {
      alert('Error: ' + String(error));
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
          color: 'white',
          padding: '80px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📥</div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Import Leads
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '48px' }}>
            Get your contacts into the CRM in minutes. Choose your preferred method below.
          </p>
          <Link
            href="/contacts"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              (e.target as any).style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              (e.target as any).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            ← Back to Contacts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        {!selectedMethod ? (
          <>
            {/* Methods Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
                marginBottom: '80px',
              }}
            >
              {importMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    position: 'relative',
                    padding: '48px 40px',
                    backgroundColor: 'white',
                    border: `2px solid var(--border-light)`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as any).style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                    (e.currentTarget as any).style.borderColor = 'var(--primary)';
                    (e.currentTarget as any).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as any).style.boxShadow = 'none';
                    (e.currentTarget as any).style.borderColor = 'var(--border-light)';
                    (e.currentTarget as any).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '4px 12px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {method.badge}
                  </div>

                  {/* Icon */}
                  <div style={{ fontSize: '80px', marginBottom: '24px', lineHeight: '1' }}>
                    {method.icon}
                  </div>

                  {/* Text */}
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      color: '#000',
                    }}
                  >
                    {method.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-tertiary)',
                      marginBottom: 'auto',
                      lineHeight: '1.6',
                    }}
                  >
                    {method.description}
                  </p>

                  {/* CTA */}
                  <div
                    style={{
                      marginTop: '24px',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                    }}
                  >
                    Get Started →
                  </div>
                </button>
              ))}
            </div>

            {/* Info Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                backgroundColor: 'white',
                padding: '48px 40px',
                borderRadius: '16px',
                border: `1px solid var(--border-light)`,
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                  ✅ Required Fields
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    <strong style={{ color: '#000' }}>Name</strong> (required)
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    <strong style={{ color: '#000' }}>Email</strong> (recommended)
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    <strong style={{ color: '#000' }}>Phone</strong> (optional)
                  </li>
                  <li style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    <strong style={{ color: '#000' }}>Company</strong> (optional)
                  </li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                  📋 File Formats
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    CSV - Comma Separated Values
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    XLSX - Excel 2007+
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    Max 10,000 rows per file
                  </li>
                  <li style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>Max 10MB file size</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                  ✨ Best Practices
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    Use headers in first row
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    Ensure valid email addresses
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    Remove duplicate entries
                  </li>
                  <li style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>
                    Leave empty cells for missing data
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedMethod(null);
                setProgress(0);
              }}
              style={{
                marginBottom: '40px',
                fontSize: '15px',
                fontWeight: '600',
                color: 'var(--primary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← Choose Different Method
            </button>

            {/* Upload Content */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '60px 40px',
                border: `1px solid var(--border-light)`,
              }}
            >
              <h2
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {selectedMethod === 'csv' ? '📄 Upload CSV File' : selectedMethod === 'excel' ? '📊 Upload Excel File' : '📈 Google Sheets'}
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '40px',
                }}
              >
                {selectedMethod === 'csv'
                  ? 'Paste your CSV file and we will import all leads instantly.'
                  : selectedMethod === 'excel'
                  ? 'Upload your Excel spreadsheet and we will handle the rest.'
                  : 'Export your Google Sheet as CSV and upload it below.'}
              </p>

              {/* Upload Area */}
              <div
                style={{
                  border: `3px dashed var(--primary)`,
                  borderRadius: '16px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  marginBottom: '40px',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedMethod === 'csv' ? '.csv' : selectedMethod === 'excel' ? '.xlsx,.xls' : '.csv'}
                  onChange={(e) => handleFileUpload(e, selectedMethod || 'csv')}
                  disabled={isLoading}
                  style={{ display: 'none' }}
                  id="file-input"
                />

                {isLoading ? (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>
                      Importing your leads...
                    </p>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--border-light)',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, var(--primary), var(--accent))`,
                          width: `${progress}%`,
                          transition: 'width 0.3s',
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{progress}% complete</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>📁</div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Drag & drop your file here
                    </p>
                    <p style={{ fontSize: '15px', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
                      or click to select from your computer
                    </p>
                    <label htmlFor="file-input">
                      <button
                        style={{
                          padding: '14px 40px',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={(e) => {
                          (e.target as any).style.opacity = '0.9';
                          (e.target as any).style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as any).style.opacity = '1';
                          (e.target as any).style.transform = 'scale(1)';
                        }}
                      >
                        Choose File
                      </button>
                    </label>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '20px' }}>
                      {selectedMethod === 'csv' ? '.csv only' : selectedMethod === 'excel' ? '.xlsx or .xls' : '.csv'} • Max 10MB
                    </p>
                  </>
                )}
              </div>

              {/* Example */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '32px',
                  border: `1px solid var(--border-light)`,
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                  📋 CSV Format Example:
                </p>
                <code
                  style={{
                    display: 'block',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#1e293b',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  {`name,email,phone,company\nJohn Doe,john@acme.com,+1-555-0100,Acme Corp\nJane Smith,jane@tech.com,+1-555-0200,Tech Inc`}
                </code>
              </div>

              {/* Tips */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '32px',
                  border: `1px solid var(--border-light)`,
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
                  ✅ Pro Tips:
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '14px',
                    color: 'var(--text-tertiary)',
                    lineHeight: '1.8',
                  }}
                >
                  <li>• Ensure email addresses are valid and unique</li>
                  <li>• Remove duplicate entries before uploading</li>
                  <li>• Use column headers in the first row</li>
                  <li>• Leave empty cells for missing data</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
