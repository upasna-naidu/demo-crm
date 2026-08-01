'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface Deal {
  id: string;
  dealId: string;
  title: string;
  description: string;
  value: number;
  currency: string;
  stageName: string;
  stageId: string;
  probability: number;
  status: string;
  expectedCloseDate: string;
  leadId: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Stage {
  id: string;
  name: string;
  probability: number;
}

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Deal>>({});
  const [newActivity, setNewActivity] = useState({ type: 'call', title: '', description: '' });

  useEffect(() => {
    loadData();
  }, [dealId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealRes, stagesRes] = await Promise.all([
        fetch(`/api/deals/${dealId}`),
        fetch('/api/pipeline-stages'),
      ]);

      const dealData = await dealRes.json();
      const stagesData = await stagesRes.json();

      if (dealData.success) {
        setDeal(dealData.deal);
        setActivities(dealData.activities || []);
        setEditData(dealData.deal);
      }

      setStages(stagesData.stages || []);
    } catch (error) {
      console.error('Failed to load deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setIsEditing(false);
        loadData();
      }
    } catch (error) {
      console.error('Failed to save deal:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title) return;

    try {
      const res = await fetch(`/api/deals/${dealId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity),
      });

      if (res.ok) {
        setNewActivity({ type: 'call', title: '', description: '' });
        loadData();
      }
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  if (loading || !deal) {
    return (
      <div style={{ padding: spacing['3xl'], textAlign: 'center' }}>
        {loading ? 'Loading...' : 'Deal not found'}
      </div>
    );
  }

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <Link href="/sales" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: spacing.lg, display: 'inline-block' }}>
            ← Back to Sales
          </Link>

          <div
            style={{
              backgroundColor: 'white',
              padding: spacing['2xl'],
              borderRadius: borderRadius.md,
              border: `1px solid var(--border-light)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.lg }}>
              <div>
                <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', margin: 0, marginBottom: spacing.sm }}>
                  {deal.title}
                </h1>
                <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>{deal.dealId}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
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
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* Key Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
                marginBottom: spacing['2xl'],
              }}
            >
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>Deal Value</p>
                <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${deal.value.toLocaleString()}
                </p>
              </div>

              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>Stage</p>
                <p style={{ fontSize: '1.2em', fontWeight: '600', color: 'var(--accent)' }}>{deal.stageName}</p>
              </div>

              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>Probability</p>
                <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'var(--primary)' }}>{deal.probability}%</p>
              </div>

              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: spacing.sm }}>Expected Close</p>
                <p style={{ fontSize: '1.2em', fontWeight: '600' }}>
                  {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            {/* Edit Mode */}
            {isEditing && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: spacing.lg,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.lg,
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: spacing.lg }}>Edit Deal</h4>

                <div style={{ display: 'grid', gap: spacing.lg, marginBottom: spacing.lg }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '600' }}>Title</label>
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid var(--border-light)`,
                        borderRadius: borderRadius.sm,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '600' }}>Value</label>
                      <input
                        type="number"
                        value={editData.value || ''}
                        onChange={(e) => setEditData({ ...editData, value: parseFloat(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: spacing.md,
                          border: `1px solid var(--border-light)`,
                          borderRadius: borderRadius.sm,
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '600' }}>Stage</label>
                      <select
                        value={editData.stageId || ''}
                        onChange={(e) => setEditData({ ...editData, stageId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.md,
                          border: `1px solid var(--border-light)`,
                          borderRadius: borderRadius.sm,
                          fontFamily: 'inherit',
                        }}
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '600' }}>
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={editData.expectedCloseDate ? editData.expectedCloseDate.split('T')[0] : ''}
                      onChange={(e) => setEditData({ ...editData, expectedCloseDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid var(--border-light)`,
                        borderRadius: borderRadius.sm,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '600' }}>Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid var(--border-light)`,
                        borderRadius: borderRadius.sm,
                        fontFamily: 'inherit',
                        minHeight: '100px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: spacing.lg }}>
                  <button
                    onClick={handleSave}
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
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: 'transparent',
                      color: 'var(--primary)',
                      border: `1px solid var(--primary)`,
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
          </div>
        </div>

        {/* Activities Section */}
        <div
          style={{
            backgroundColor: 'white',
            padding: spacing['2xl'],
            borderRadius: borderRadius.md,
            border: `1px solid var(--border-light)`,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: spacing.lg }}>Deal Timeline</h3>

          {/* Add Activity */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: spacing.lg,
              borderRadius: borderRadius.md,
              marginBottom: spacing.lg,
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: spacing.lg }}>Log Activity</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg, marginBottom: spacing.lg }}>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              >
                <option value="call">☎️ Call</option>
                <option value="email">📧 Email</option>
                <option value="meeting">📅 Meeting</option>
                <option value="note">📝 Note</option>
                <option value="other">📌 Other</option>
              </select>

              <input
                type="text"
                placeholder="Activity title"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                style={{
                  padding: spacing.md,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.sm,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <textarea
              placeholder="Activity notes..."
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              style={{
                width: '100%',
                padding: spacing.md,
                border: `1px solid var(--border-light)`,
                borderRadius: borderRadius.sm,
                fontFamily: 'inherit',
                marginBottom: spacing.lg,
                minHeight: '80px',
              }}
            />

            <button
              onClick={handleAddActivity}
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
              Log Activity
            </button>
          </div>

          {/* Activities List */}
          <div>
            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: spacing.lg }}>
                No activities yet. Log your first activity above!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: spacing.lg }}>
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: spacing.lg,
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: borderRadius.md,
                      borderLeft: `4px solid var(--primary)`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.sm }}>
                      <p style={{ fontWeight: '600', margin: 0 }}>
                        {activity.type === 'call' && '☎️ '}
                        {activity.type === 'email' && '📧 '}
                        {activity.type === 'meeting' && '📅 '}
                        {activity.type === 'note' && '📝 '}
                        {activity.type === 'other' && '📌 '}
                        {activity.title}
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85em', margin: 0 }}>
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {activity.description && (
                      <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
