'use client';

import { useEffect, useState } from 'react';

interface FunnelData {
  funnelData: any[];
  conversionRates: any;
  sourceConversion: any[];
  velocity: any;
  statistics: any;
}

export default function FunnelAnalytics() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnelData();
  }, []);

  const loadFunnelData = async () => {
    try {
      const res = await fetch('/api/analytics/funnel');
      const funnelData = await res.json();
      setData(funnelData);
    } catch (error) {
      console.error('Failed to load funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Funnel Analytics...</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data available</div>;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 700 }}>
            📊 Customer Lifecycle & Funnel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Track lead conversion and customer acquisition metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <MetricCard
            label="Lead-to-Opportunity"
            value={`${data.conversionRates.leadsToOpportunity}%`}
            subtitle="Leads with deals"
          />
          <MetricCard
            label="Opportunity-to-Customer"
            value={`${data.conversionRates.opportunityToCustomer}%`}
            subtitle="Won deals"
          />
          <MetricCard
            label="Overall Conversion"
            value={`${data.conversionRates.totalConversion}%`}
            subtitle="Lead to customer"
            highlight
          />
          <MetricCard
            label="Sales Velocity"
            value={`${data.velocity.avgDaysToConversion} days`}
            subtitle="To conversion"
          />
        </div>

        {/* Funnel Visualization */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--border-light)',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 600 }}>
            Customer Journey Funnel
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.funnelData.map((stage: any, idx: number) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{stage.stage}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${stage.percentage}%`,
                      background: 'var(--primary)',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Source Conversion */}
        {data.sourceConversion.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-light)',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              Lead Source Performance
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>
                      Source
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Leads
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Opportunities
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Won
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Conversion %
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Avg Deal Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.sourceConversion.map((source: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>
                        {source.source}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>{source.leads}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>{source.deals}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {source.won}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {source.conversionToDeal}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        ${source.avgDealValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--border-light)',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
            Key Statistics
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <StatBox label="Total Leads" value={data.statistics.totalLeads} />
            <StatBox label="With Opportunities" value={data.statistics.leadsWithOpportunities} />
            <StatBox label="Won Customers" value={data.statistics.wonCustomers} />
            <StatBox label="Active Leads" value={data.statistics.activeLeads} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: any;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight ? 'var(--primary)' : 'white',
        padding: '16px',
        borderRadius: '8px',
        border: highlight ? 'none' : '1px solid var(--border-light)',
      }}
    >
      <p style={{ margin: 0, fontSize: '12px', color: highlight ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: highlight ? 'white' : 'var(--primary)', marginBottom: subtitle ? '4px' : 0 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ margin: 0, fontSize: '11px', color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
        {value}
      </p>
    </div>
  );
}
