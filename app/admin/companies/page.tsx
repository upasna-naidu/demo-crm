'use client';

import { useState, useEffect } from 'react';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  createdAt: string;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface CompanyDetail {
  company: Company;
  profile: any;
  users: Member[];
}

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({ name: '', website: '', industry: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyDetail = async (companyId: string) => {
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCompany(data);
      }
    } catch (error) {
      console.error('Failed to fetch company detail:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      console.log('🗑️ Deleting company:', companyId);
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('Delete response:', data, 'Status:', res.status);

      if (data.success || res.ok) {
        console.log('✅ Delete successful, updating UI...');
        setDeleteConfirm(null);
        alert('✅ Company deleted successfully');

        // Immediately remove from UI
        const updated = companies.filter(c => c.id !== companyId);
        console.log('Updated companies count:', updated.length);
        setCompanies(updated);

        // Force refetch after state update
        setTimeout(() => {
          console.log('Refetching companies list...');
          fetchCompanies();
        }, 300);
      } else {
        alert('❌ Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Error: ' + String(error));
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!newCompanyForm.name.trim()) {
      setFormError('Company name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompanyForm),
      });

      const data = await res.json();

      if (data.success) {
        setNewCompanyForm({ name: '', website: '', industry: '', description: '' });
        setShowNewForm(false);
        setFormError('');
        await fetchCompanies();
      } else {
        setFormError(data.error || 'Failed to create company');
      }
    } catch (error) {
      setFormError(`Error: ${String(error)}`);
      console.error('Failed to create company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing['3xl'] }}>
          <div>
            <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', marginBottom: spacing.lg }}>
              🏢 Companies Admin
            </h1>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.button.fontSize,
                fontWeight: typography.button.fontWeight,
                cursor: 'pointer',
              }}
            >
              + Add Company
            </button>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: `${spacing.lg} ${spacing['2xl']}`,
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}>
            <p style={{ ...typography.caption, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Companies</p>
            <p style={{ ...typography.pageTitle, color: 'var(--primary)', marginTop: spacing.sm }}>{companies.length}</p>
          </div>
        </div>

        {/* New Company Form */}
        {showNewForm && (
          <div style={{
            backgroundColor: 'white',
            padding: spacing['2xl'],
            borderRadius: borderRadius.lg,
            marginBottom: spacing['2xl'],
            border: `1px solid var(--border-light)`,
          }}>
            <h2 style={{ ...typography.sectionTitle, marginBottom: spacing.xl }}>New Company</h2>
            <form onSubmit={handleCreateCompany} style={{ display: 'grid', gap: spacing.lg }}>
              <input
                type="text"
                placeholder="Company Name *"
                value={newCompanyForm.name}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                required
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.fontSize,
                }}
              />
              <input
                type="url"
                placeholder="Website"
                value={newCompanyForm.website}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, website: e.target.value })}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.fontSize,
                }}
              />
              <input
                type="text"
                placeholder="Industry"
                value={newCompanyForm.industry}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, industry: e.target.value })}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.fontSize,
                }}
              />
              <textarea
                placeholder="Description"
                value={newCompanyForm.description}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, description: e.target.value })}
                rows={3}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.fontSize,
                  fontFamily: 'inherit',
                  resize: 'none',
                }}
              />
              {formError && (
            <div style={{
              padding: spacing.lg,
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: borderRadius.lg,
              fontSize: typography.small.fontSize,
            }}>
              ❌ {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: spacing.lg }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-tertiary)',
                    border: `1px solid var(--border-light)`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Companies Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: spacing['2xl'], marginBottom: spacing['3xl'] }}>
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => fetchCompanyDetail(company.id)}
              style={{
                backgroundColor: 'white',
                padding: spacing['2xl'],
                borderRadius: borderRadius.lg,
                border: `1px solid var(--border-light)`,
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <h3 style={{ ...typography.cardTitle, color: 'var(--primary)', marginBottom: spacing.md }}>
                {company.name}
              </h3>
              {company.website && (
                <p style={{ ...typography.small, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                  🌐 {company.website}
                </p>
              )}
              {company.industry && (
                <p style={{ ...typography.small, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                  📊 {company.industry}
                </p>
              )}
              {company.description && (
                <p style={{ ...typography.small, color: 'var(--text-tertiary)', marginBottom: spacing.md, maxHeight: '60px', overflow: 'hidden' }}>
                  {company.description}
                </p>
              )}
              <p style={{ ...typography.caption, color: 'var(--text-tertiary)', marginBottom: spacing.lg }}>
                Created: {new Date(company.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => setDeleteConfirm(company.id)}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: '#fee',
                  color: '#c33',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.small.fontSize,
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: spacing['3xl'],
              borderRadius: borderRadius.lg,
              maxWidth: '400px',
              textAlign: 'center',
            }}>
              <h3 style={{ ...typography.sectionTitle, marginBottom: spacing.lg }}>Delete Company?</h3>
              <p style={{ ...typography.body, color: 'var(--text-tertiary)', marginBottom: spacing['2xl'] }}>
                This action cannot be undone. All associated data will be deleted.
              </p>
              <div style={{ display: 'flex', gap: spacing.lg }}>
                <button
                  onClick={() => handleDeleteCompany(deleteConfirm)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: '#c33',
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Company Detail */}
        {selectedCompany && (
          <div style={{
            backgroundColor: 'white',
            padding: spacing['3xl'],
            borderRadius: borderRadius.lg,
            border: `1px solid var(--border-light)`,
          }}>
            <h2 style={{ ...typography.sectionTitle, marginBottom: spacing['2xl'] }}>
              {selectedCompany.company.name} Details
            </h2>

            {/* Company Info */}
            <div style={{ marginBottom: spacing['3xl'] }}>
              <h3 style={{ ...typography.cardTitle, marginBottom: spacing.lg }}>Company Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
                <div>
                  <p style={{ ...typography.caption, color: 'var(--text-tertiary)' }}>Website</p>
                  <p style={{ ...typography.body }}>{selectedCompany.company.website || 'Not set'}</p>
                </div>
                <div>
                  <p style={{ ...typography.caption, color: 'var(--text-tertiary)' }}>Industry</p>
                  <p style={{ ...typography.body }}>{selectedCompany.company.industry || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Brand Brief */}
            <div style={{ marginBottom: spacing['3xl'] }}>
              <h3 style={{ ...typography.cardTitle, marginBottom: spacing.lg }}>Brand Brief</h3>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: spacing.xl, borderRadius: borderRadius.lg }}>
                <p style={{ ...typography.body, color: 'var(--text-tertiary)' }}>
                  {selectedCompany.profile ? 'Profile configured' : 'No profile yet'}
                </p>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 style={{ ...typography.cardTitle, marginBottom: spacing.lg }}>Team Members ({selectedCompany.users.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {selectedCompany.users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing.lg,
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: borderRadius.lg,
                    }}
                  >
                    <div>
                      <p style={{ ...typography.body, fontWeight: '600' }}>{user.name || 'Unknown'}</p>
                      <p style={{ ...typography.small, color: 'var(--text-tertiary)' }}>{user.email}</p>
                    </div>
                    <span
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: borderRadius.md,
                        fontSize: typography.caption.fontSize,
                        fontWeight: '600',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCompany(null)}
              style={{
                marginTop: spacing['2xl'],
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--primary)',
                border: `1px solid var(--border-light)`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
