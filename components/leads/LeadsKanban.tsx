'use client';

import Link from 'next/link';

interface Lead {
  id: string;
  leadId: string;
  name: string;
  email?: string;
  company?: string;
  stageId: string;
  stage: { name: string };
  owner: { name: string };
  dealValue?: number;
}

interface Stage {
  id: string;
  name: string;
  color: string;
}

export default function LeadsKanban({ leads, stages }: { leads: Lead[]; stages: Stage[] }) {
  const leadsByStage = stages.map((stage) => ({
    ...stage,
    leads: leads.filter((lead) => lead.stageId === stage.id),
  }));

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {leadsByStage.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-96">
          {/* Column Header */}
          <div
            className="p-4 rounded-t-lg text-white font-bold mb-4 flex items-center justify-between"
            style={{ backgroundColor: stage.color || 'var(--bg-tertiary)' }}
          >
            <span className="text-white">{stage.name}</span>
            <span
              className="bg-white bg-opacity-30 px-3 py-1 rounded text-sm font-semibold"
            >
              {stage.leads.length}
            </span>
          </div>

          {/* Cards Container */}
          <div className="space-y-3 min-h-96">
            {stage.leads.length === 0 ? (
              <div
                className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed"
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'rgba(0,0,0,0.01)',
                }}
              >
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  No leads
                </p>
              </div>
            ) : (
              stage.leads.map((lead, idx) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  target="_blank"
                  className="card p-4 cursor-pointer hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-xs font-mono font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {lead.leadId}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {lead.name}
                  </h3>

                  {lead.company && (
                    <p
                      className="text-xs mb-3"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {lead.company}
                    </p>
                  )}

                  {lead.dealValue && (
                    <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Deal Value
                      </p>
                      <p className="font-bold" style={{ color: 'var(--primary)' }}>
                        ${(lead.dealValue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-2 pt-3 border-t"
                    style={{ borderTopColor: 'var(--border-light)' }}
                  >
                    <span className="text-lg">👤</span>
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {lead.owner.name}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
