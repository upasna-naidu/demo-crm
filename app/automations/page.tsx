'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  executionCount: number;
  lastRun?: string;
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/automations');
      const data = await response.json();
      setAutomations(data.automations || []);
    } catch (error) {
      console.error('Failed to fetch automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      fetchAutomations();
    } catch (error) {
      console.error('Failed to update automation:', error);
    }
  };

  const deleteAutomation = async (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      try {
        await fetch(`/api/automations/${id}`, { method: 'DELETE' });
        fetchAutomations();
      } catch (error) {
        console.error('Failed to delete automation:', error);
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Automations</h1>
          <p style={{ color: '#6b7280' }}>Create and manage automated workflows for your business</p>
        </div>
        <Link
          href="/automations/builder"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Create Automation
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Total Automations</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{automations.length}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Enabled</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{automations.filter((a) => a.enabled).length}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Total Executions</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7' }}>{automations.reduce((sum, a) => sum + (a.executionCount || 0), 0)}</p>
        </div>
      </div>

      {/* Automations List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading automations...</div>
      ) : automations.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666', marginBottom: '16px' }}>No automations yet. Create your first one!</p>
          <Link
            href="/automations/builder"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block',
            }}
          >
            Create First Automation
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Name
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Description
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Executions
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {automations.map((automation) => (
                <tr key={automation.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#1f2937' }}>
                    <Link href={`/automations/${automation.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {automation.name}
                    </Link>
                  </td>
                  <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>{automation.description || '-'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleAutomation(automation.id, automation.enabled)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: automation.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: automation.enabled ? '#22c55e' : '#6b7280',
                      }}
                    >
                      {automation.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>{automation.executionCount || 0}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/automations/${automation.id}`}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteAutomation(automation.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
