'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  overview: any;
  sales: any;
  leads: any;
  operations: any;
  service: any;
  teamPerformance: any[];
  activityTrend: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const dashData = await res.json();
      setData(dashData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Master Dashboard...</div>;
  if (!data) return <div style={{ padding: '20px' }}>No data available</div>;

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '32px', fontWeight: 700 }}>
            📊 Master Dashboard
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            Real-time visibility across all growth channels
          </p>
        </div>

        {/* Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <KPICard label="Companies" value={data.overview.companies} />
          <KPICard label="Leads" value={data.overview.leads} />
          <KPICard label="Active Deals" value={data.overview.deals} />
          <KPICard label="Support Tickets" value={data.overview.tickets} />
          <KPICard label="Email Templates" value={data.overview.emailTemplates} />
        </div>

        {/* Main Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Sales Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              💰 Sales Performance
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <MetricRow label="Total Pipeline" value={`$${data.sales.totalPipeline.toLocaleString()}`} />
              <MetricRow label="Open Deals" value={data.sales.openDeals} />
              <MetricRow label="Won Deals" value={data.sales.wonDeals} />
              <MetricRow label="Win Rate" value={`${data.sales.winRate}%`} highlight />
              <MetricRow label="Avg Deal Size" value={`$${data.sales.avgDealSize.toLocaleString()}`} />
            </div>
          </div>

          {/* Leads Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              👥 Lead Management
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <MetricRow label="Total Leads" value={data.leads.total} />
              <MetricRow label="New Leads" value={data.leads.new} />
              <MetricRow label="Unassigned" value={data.leads.unassigned} />
              <MetricRow label="Quality Score" value={`${data.leads.qualityScore}%`} highlight />
            </div>
          </div>

          {/* Operations Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              ⚙️ Operations
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <MetricRow label="Workflows Executed" value={data.operations.workflowsExecuted} />
              <MetricRow label="Data Quality" value={`${data.operations.dataQuality}%`} highlight />
            </div>
          </div>

          {/* Service Section */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              🎧 Customer Service
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <MetricRow label="Total Tickets" value={data.service.totalTickets} />
              <MetricRow label="Open Tickets" value={data.service.openTickets} />
              <MetricRow label="Resolved" value={data.service.resolvedTickets} />
              <MetricRow label="Avg Resolution" value={`${data.service.avgResolutionHours}h`} />
            </div>
          </div>
        </div>

        {/* Team Performance */}
        {data.teamPerformance.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              👔 Team Performance
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {data.teamPerformance.map((user: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, marginBottom: '8px' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Deals: {user.deals} • Value: ${(user.dealValue || 0).toLocaleString()}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Leads Assigned: {user.leads}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Trends */}
        {data.activityTrend.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              📈 7-Day Activity Trend
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Deals Created
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Deal Value
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                      Leads Added
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.activityTrend.map((day: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px', fontSize: '13px' }}>{day.date}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {day.dealCount}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        ${(day.dealValue || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {day.leadCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '12px', color: '#999', marginBottom: '8px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1976d2' }}>{value}</p>
    </div>
  );
}

function MetricRow({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
      <span
        style={{
          fontSize: '14px',
          fontWeight: highlight ? 700 : 600,
          color: highlight ? '#1976d2' : '#333',
        }}
      >
        {value}
      </span>
    </div>
  );
}
