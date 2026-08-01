'use client';

import { useState } from 'react';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface ImportResult {
  imported: number;
  failed: number;
  total: number;
  errors?: string[];
}

export default function ImportPage() {
  const [leadsData, setLeadsData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'json' | 'csv'>('json');

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const lead: any = {};
      headers.forEach((header, idx) => {
        if (values[idx]) lead[header] = values[idx];
      });
      if (lead.name && lead.email) leads.push(lead);
    }
    return leads;
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsImporting(true);

    try {
      if (!leadsData.trim()) {
        setError('Please paste your data');
        setIsImporting(false);
        return;
      }

      let leads;
      try {
        if (mode === 'json') {
          leads = JSON.parse(leadsData);
          if (!Array.isArray(leads)) leads = [leads];
        } else {
          leads = parseCSV(leadsData);
        }
      } catch (parseError) {
        setError('Invalid data');
        setIsImporting(false);
        return;
      }

      const res = await fetch('/api/import-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setLeadsData('');
      }
    } catch (err) {
      setError('Error: ' + String(err));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', marginBottom: spacing['2xl'] }}>
          📥 Import Leads
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['3xl'] }}>
          <form onSubmit={handleImport} style={{ backgroundColor: 'white', padding: spacing['3xl'], borderRadius: borderRadius.lg }}>
            <textarea value={leadsData} onChange={(e) => setLeadsData(e.target.value)} rows={10} placeholder="Paste leads data..." style={{ width: '100%', padding: spacing.lg, border: '1px solid var(--border-light)', fontFamily: 'monospace' }} />
            {error && <div style={{ color: '#c33', marginTop: spacing.lg }}>{error}</div>}
            <button type="submit" disabled={isImporting} style={{ marginTop: spacing.lg, width: '100%', padding: spacing.lg, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: borderRadius.lg, cursor: 'pointer' }}>
              {isImporting ? 'Importing...' : 'Import Leads'}
            </button>
          </form>

          <div style={{ backgroundColor: 'white', padding: spacing['3xl'], borderRadius: borderRadius.lg, textAlign: 'center' }}>
            {result ? (
              <>
                <h3>✅ Complete</h3>
                <p>Imported: {result.imported}</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '48px', marginBottom: spacing.lg }}>📋</p>
                <p>Paste data to begin</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
