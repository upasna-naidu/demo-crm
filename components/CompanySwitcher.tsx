'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface Company {
  id: string;
  name: string;
  industry?: string;
}

export default function CompanySwitcher() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    // Get selected company from localStorage
    const saved = localStorage.getItem('selectedCompanyId');
    setSelectedCompany(saved);
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies || []);

      // Set first company as default if none selected
      if (data.companies?.length > 0 && !localStorage.getItem('selectedCompanyId')) {
        const firstId = data.companies[0].id;
        setSelectedCompany(firstId);
        localStorage.setItem('selectedCompanyId', firstId);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    localStorage.setItem('selectedCompanyId', companyId);
    setIsOpen(false);
  };

  const currentCompany = companies.find(c => c.id === selectedCompany);

  if (isLoading || !currentCompany) {
    return (
      <div style={{ padding: `${spacing.md} ${spacing.lg}`, fontSize: typography.body.fontSize }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.lg}`,
          backgroundColor: 'var(--bg-secondary)',
          border: `1px solid var(--border-light)`,
          borderRadius: borderRadius.lg,
          cursor: 'pointer',
          fontSize: typography.body.fontSize,
          fontWeight: '600',
          color: 'var(--primary)',
        }}
      >
        🏢 {currentCompany.name}
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: spacing.sm,
            backgroundColor: 'white',
            border: `1px solid var(--border-light)`,
            borderRadius: borderRadius.lg,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '250px',
          }}
        >
          <div style={{ padding: spacing.md, borderBottom: `1px solid var(--border-light)` }}>
            <p style={{ ...typography.caption, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Switch Company
            </p>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {companies.map(company => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: 'none',
                  backgroundColor: selectedCompany === company.id ? 'var(--bg-secondary)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-in-out',
                  borderBottom: `1px solid var(--border-light)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  if (selectedCompany !== company.id) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                  }
                }}
              >
                <p style={{ ...typography.body, fontWeight: '600', color: 'var(--primary)' }}>
                  {company.name}
                </p>
                {company.industry && (
                  <p style={{ ...typography.small, color: 'var(--text-tertiary)' }}>
                    {company.industry}
                  </p>
                )}
              </button>
            ))}
          </div>

          <Link
            href="/admin/companies"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: `${spacing.md} ${spacing.lg}`,
              textAlign: 'center',
              borderTop: `1px solid var(--border-light)`,
              color: 'var(--primary)',
              fontSize: typography.body.fontSize,
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            ⚙️ Manage Companies
          </Link>
        </div>
      )}
    </div>
  );
}
