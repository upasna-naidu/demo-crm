'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  summary: {
    totalLeads: number;
    unassignedLeads: number;
    unstagedLeads: number;
    qualityScore: number;
    duplicatesFound: number;
    needsAttention: number;
  };
  distribution: {
    byStatus: Array<{ name: string; count: number }>;
    byStage: Array<{ name: string; count: number }>;
    byOwner: Array<{ name: string; count: number }>;
    bySource: Array<{ name: string; count: number }>;
  };
  quality: {
    averageScore: number;
    recordsChecked: number;
    duplicatesDetected: number;
    leadsNeedingAttention: number;
  };
  automation: {
    totalExecutions: number;
    successfulExecutions: number;
    successRate: number;
  };
}

export default function OperationsHub() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/operations/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const dashData = await res.json();
      setData(dashData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Operations Hub...</div>;
  if (error) return <div style={{ padding: '20px', color: 'var(--error)' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data available</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: 700 }}>Operations Hub</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Automation, workflows, and lead management
        </p>
      </div>

      {/* Alert Section */}
      {(data.summary.unassignedLeads > 0 || data.summary.unstagedLeads > 0) && (
        <div
          style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
            ⚠️ Attention needed:
            {data.summary.unassignedLeads > 0 && ` ${data.summary.unassignedLeads} unassigned leads`}
            {data.summary.unassignedLeads > 0 && data.summary.unstagedLeads > 0 && ', '}
            {data.summary.unstagedLeads > 0 && ` ${data.summary.unstagedLeads} leads without stage`}
          </p>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <MetricCard label="Total Leads" value={data.summary.totalLeads} />
        <MetricCard label="Quality Score" value={`${data.summary.qualityScore}%`} />
        <MetricCard label="Duplicates Found" value={data.summary.duplicatesFound} />
        <MetricCard label="Needs Attention" value={data.summary.needsAttention} />
        <MetricCard label="Automation Success" value={`${data.automation.successRate}%`} />
        <MetricCard label="Workflows Executed" value={data.automation.totalExecutions} />
      </div>

      {/* Distributions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}
      >
        <DistributionCard title="Leads by Status" items={data.distribution.byStatus} />
        <DistributionCard title="Leads by Stage" items={data.distribution.byStage} />
        <DistributionCard title="Leads by Owner" items={data.distribution.byOwner} />
        <DistributionCard title="Leads by Source" items={data.distribution.bySource} />
      </div>

      {/* Data Quality Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Data Quality Dashboard
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}
        >
          <QualityItem label="Average Score" value={`${data.quality.averageScore}%`} />
          <QualityItem label="Records Checked" value={data.quality.recordsChecked} />
          <QualityItem label="Duplicates Detected" value={data.quality.duplicatesDetected} />
          <QualityItem label="Needs Attention" value={data.quality.leadsNeedingAttention} />
        </div>
      </div>

      {/* Automation Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Workflow Automation
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}
        >
          <QualityItem label="Total Executions" value={data.automation.totalExecutions} />
          <QualityItem label="Successful" value={data.automation.successfulExecutions} />
          <QualityItem label="Success Rate" value={`${data.automation.successRate}%`} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link
          href="/leads"
          style={{
            padding: '10px 16px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          View All Leads
        </Link>
        <Link
          href="/sales"
          style={{
            padding: '10px 16px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Sales Pipeline
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
    </div>
  );
}

function DistributionCard({
  title,
  items
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '16px'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
        {title}
      </h3>
      <div>
        {items.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>No data</p>
        ) : (
          items.map((item) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '13px'
              }}
            >
              <span>{item.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QualityItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
    </div>
  );
}
