'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface Deal {
  id: string;
  dealId: string;
  title: string;
  value: number;
  currency: string;
  stageName: string;
  stageId: string;
  probability: number;
  status: string;
  expectedCloseDate: string;
  leadId: string;
}

interface Stage {
  id: string;
  name: string;
  probability: number;
  displayOrder: number;
}

interface Forecast {
  totalPipeline: number;
  weightedForecast: number;
  bestCase: number;
  worstCase: number;
  dealsByStage: any[];
  dealCount: number;
}

interface Analytics {
  winLoss: { won: number; lost: number; wonCount: number; lostCount: number; winRate: number };
  dealMetrics: any;
  stageMetrics: any[];
  sourceMetrics: any[];
  ownerMetrics: any[];
}

export default function SalesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'kanban' | 'forecast' | 'analytics'>('kanban');
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    leadId: '',
    title: '',
    value: '',
    stageId: '',
    expectedCloseDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsRes, stagesRes, forecastRes, analyticsRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/pipeline-stages'),
        fetch('/api/sales/forecast'),
        fetch('/api/sales/analytics'),
      ]);

      const dealsData = await dealsRes.json();
      const stagesData = await stagesRes.json();
      const forecastData = await forecastRes.json();
      const analyticsData = await analyticsRes.json();

      setDeals(dealsData.deals || []);
      setStages(stagesData.stages || []);
      setForecast(forecastData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!newDeal.leadId || !newDeal.title || !newDeal.value || !newDeal.stageId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: newDeal.leadId,
          title: newDeal.title,
          value: parseFloat(newDeal.value),
          stageId: newDeal.stageId,
          expectedCloseDate: newDeal.expectedCloseDate || null,
        }),
      });

      if (res.ok) {
        setNewDeal({ leadId: '', title: '', value: '', stageId: '', expectedCloseDate: '' });
        setShowNewDeal(false);
        loadData();
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const getTotalPipeline = () => {
    return deals.reduce((sum, deal) => sum + (deal.value || 0), 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const getStageTotal = (stageId: string) => {
    return deals
      .filter((d) => d.stageId === stageId)
      .reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  if (loading) {
    return <div style={{ padding: spacing['3xl'], textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: spacing['3xl'] }}>
          <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', marginBottom: spacing.lg }}>
            🎯 Sales Hub
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: spacing['2xl'] }}>
            Track your deals and pipeline at a glance
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: spacing.lg,
              marginBottom: spacing['2xl'],
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: spacing.lg,
                borderRadius: borderRadius.md,
                border: '1px solid var(--border-light)',
              }}
            >
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>
                Total Pipeline
              </p>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)' }}>{getTotalPipeline()}</p>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                padding: spacing.lg,
                borderRadius: borderRadius.md,
                border: '1px solid var(--border-light)',
              }}
            >
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>Total Deals</p>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)' }}>{deals.length}</p>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                padding: spacing.lg,
                borderRadius: borderRadius.md,
                border: '1px solid var(--border-light)',
              }}
            >
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>
                Active Pipeline
              </p>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)' }}>
                {deals.filter((d) => d.status === 'open').length}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: spacing.lg, marginBottom: spacing['2xl'] }}>
            <button
              onClick={() => setShowNewDeal(!showNewDeal)}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ➕ New Deal
            </button>

            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
              <button
                onClick={() => setView('kanban')}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: view === 'kanban' ? 'var(--primary)' : 'white',
                  color: view === 'kanban' ? 'white' : 'var(--primary)',
                  border: `2px solid var(--primary)`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                📋 Kanban
              </button>
              <button
                onClick={() => setView('table')}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: view === 'table' ? 'var(--primary)' : 'white',
                  color: view === 'table' ? 'white' : 'var(--primary)',
                  border: `2px solid var(--primary)`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                📊 Table
              </button>
              <button
                onClick={() => setView('forecast')}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: view === 'forecast' ? 'var(--primary)' : 'white',
                  color: view === 'forecast' ? 'white' : 'var(--primary)',
                  border: `2px solid var(--primary)`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                📈 Forecast
              </button>
              <button
                onClick={() => setView('analytics')}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: view === 'analytics' ? 'var(--primary)' : 'white',
                  color: view === 'analytics' ? 'white' : 'var(--primary)',
                  border: `2px solid var(--primary)`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                📉 Analytics
              </button>
            </div>
          </div>
        </div>

        {/* New Deal Form */}
        {showNewDeal && (
          <div
            style={{
              backgroundColor: 'white',
              padding: spacing['2xl'],
              borderRadius: borderRadius.md,
              marginBottom: spacing['2xl'],
              border: `1px solid var(--border-light)`,
            }}
          >
            <h3 style={{ marginBottom: spacing.lg }}>Create New Deal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.lg }}>
              <input
                type="text"
                placeholder="Lead ID"
                value={newDeal.leadId}
                onChange={(e) => setNewDeal({ ...newDeal, leadId: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="text"
                placeholder="Deal Title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="number"
                placeholder="Deal Value"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={newDeal.stageId}
                onChange={(e) => setNewDeal({ ...newDeal, stageId: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Select Stage</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newDeal.expectedCloseDate}
                onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing.lg }}>
              <button
                onClick={handleCreateDeal}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Create Deal
              </button>
              <button
                onClick={() => setShowNewDeal(false)}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
              gap: spacing.lg,
            }}
          >
            {stages.map((stage) => (
              <div
                key={stage.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.md,
                  border: `1px solid var(--border-light)`,
                  overflow: 'hidden',
                }}
              >
                {/* Stage Header */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: spacing.lg,
                    borderBottom: `1px solid var(--border-light)`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>{stage.name}</h4>
                    <span
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: `2px 8px`,
                        borderRadius: borderRadius.sm,
                        fontSize: '0.85em',
                        fontWeight: '600',
                      }}
                    >
                      {deals.filter((d) => d.stageId === stage.id).length}
                    </span>
                  </div>
                  <p
                    style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.9em',
                      margin: `${spacing.sm} 0 0 0`,
                    }}
                  >
                    {getStageTotal(stage.id).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </p>
                </div>

                {/* Deal Cards */}
                <div style={{ padding: spacing.lg, minHeight: '400px' }}>
                  {deals
                    .filter((d) => d.stageId === stage.id)
                    .map((deal) => (
                      <Link href={`/sales/${deal.id}`} key={deal.id}>
                        <div
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: spacing.lg,
                            marginBottom: spacing.md,
                            borderRadius: borderRadius.md,
                            border: `1px solid var(--border-light)`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          className="hover:shadow-md"
                        >
                          <p
                            style={{
                              fontWeight: '600',
                              color: 'var(--primary)',
                              marginBottom: spacing.sm,
                            }}
                          >
                            {deal.title}
                          </p>
                          <p
                            style={{
                              fontSize: '1.2em',
                              fontWeight: 'bold',
                              color: 'var(--primary)',
                              marginBottom: spacing.sm,
                            }}
                          >
                            ${deal.value.toLocaleString()}
                          </p>
                          <p style={{ fontSize: '0.85em', color: 'var(--text-tertiary)' }}>
                            {deal.dealId}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: borderRadius.md,
              border: `1px solid var(--border-light)`,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Deal ID
                  </th>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Title
                  </th>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Value
                  </th>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Stage
                  </th>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Probability
                  </th>
                  <th style={{ padding: spacing.lg, textAlign: 'left', borderBottom: `1px solid var(--border-light)` }}>
                    Close Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: `1px solid var(--border-light)` }}>
                    <td
                      style={{
                        padding: spacing.lg,
                        color: 'var(--primary)',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      <Link href={`/sales/${deal.id}`}>{deal.dealId}</Link>
                    </td>
                    <td style={{ padding: spacing.lg }}>{deal.title}</td>
                    <td style={{ padding: spacing.lg, fontWeight: '600' }}>
                      ${deal.value.toLocaleString()}
                    </td>
                    <td style={{ padding: spacing.lg }}>{deal.stageName}</td>
                    <td style={{ padding: spacing.lg }}>{deal.probability}%</td>
                    <td style={{ padding: spacing.lg, color: 'var(--text-tertiary)' }}>
                      {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Forecast View */}
        {view === 'forecast' && forecast && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
                marginBottom: spacing['2xl'],
              }}
            >
              <ForecastCard label="Total Pipeline" value={`$${forecast.totalPipeline.toLocaleString()}`} />
              <ForecastCard label="Weighted Forecast" value={`$${forecast.weightedForecast.toLocaleString()}`} highlight />
              <ForecastCard label="Best Case" value={`$${forecast.bestCase.toLocaleString()}`} />
              <ForecastCard label="Worst Case" value={`$${forecast.worstCase.toLocaleString()}`} />
            </div>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.md,
                border: `1px solid var(--border-light)`,
                padding: spacing['2xl'],
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: spacing.lg }}>Pipeline by Stage</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.lg }}>
                {forecast.dealsByStage.map((stage: any) => (
                  <div key={stage.stageId} style={{ padding: spacing.lg, backgroundColor: 'var(--bg-secondary)', borderRadius: borderRadius.md }}>
                    <p style={{ margin: 0, fontWeight: '600', marginBottom: spacing.sm }}>{stage.stageName}</p>
                    <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary)', marginBottom: spacing.sm }}>
                      ${stage.totalValue.toLocaleString()}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-tertiary)' }}>
                      {stage.dealCount} deal{stage.dealCount !== 1 ? 's' : ''} • {stage.probability}% prob
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9em', fontWeight: '600', color: 'var(--accent)', marginTop: spacing.sm }}>
                      Weighted: ${stage.weightedValue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === 'analytics' && analytics && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
                marginBottom: spacing['2xl'],
              }}
            >
              <AnalyticsCard
                label="Win Rate"
                value={`${analytics.winLoss.winRate}%`}
                subtitle={`${analytics.winLoss.wonCount} won, ${analytics.winLoss.lostCount} lost`}
              />
              <AnalyticsCard
                label="Revenue Won"
                value={`$${(analytics.winLoss.won || 0).toLocaleString()}`}
              />
              <AnalyticsCard
                label="Avg Deal Size"
                value={`$${analytics.dealMetrics.averageSize.toLocaleString()}`}
              />
              <AnalyticsCard
                label="Avg Deal Age"
                value={`${analytics.dealMetrics.averageAge} days`}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: spacing.lg,
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.md,
                  border: `1px solid var(--border-light)`,
                  padding: spacing['2xl'],
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: spacing.lg }}>Stage Conversion</h3>
                {analytics.stageMetrics.map((stage: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: spacing.lg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                      <span>{stage.name || 'Unknown'}</span>
                      <span style={{ fontWeight: '600' }}>{stage.dealCount} deals</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min((stage.avgProbability || 0), 100)}%`,
                          backgroundColor: 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.md,
                  border: `1px solid var(--border-light)`,
                  padding: spacing['2xl'],
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: spacing.lg }}>Top Sources</h3>
                {analytics.sourceMetrics.slice(0, 5).map((source: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                    <span>{source.source || 'Unknown'}</span>
                    <span style={{ fontWeight: '600' }}>${(source.totalValue || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ForecastCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: highlight ? 'var(--primary)' : 'white',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        border: highlight ? 'none' : `1px solid var(--border-light)`,
      }}
    >
      <p style={{ color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>
        {label}
      </p>
      <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: highlight ? 'white' : 'var(--primary)', margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function AnalyticsCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        border: `1px solid var(--border-light)`,
      }}
    >
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>
        {label}
      </p>
      <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)', margin: 0, marginBottom: subtitle ? spacing.sm : 0 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85em', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
