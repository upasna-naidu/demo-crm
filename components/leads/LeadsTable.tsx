import Link from 'next/link';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface Lead {
  id: string;
  leadId: string;
  name: string;
  email?: string;
  company?: string;
  stage: { name: string };
  owner: { name: string };
  source?: string;
  dealValue?: number;
  [key: string]: any;
}

const stageColors: Record<string, string> = {
  'New': '#e5e7eb',
  'Contacted': '#bfdbfe',
  'Qualified': '#a7f3d0',
  'Proposal Sent': '#fed7aa',
  'Won': '#86efac',
  'Lost': '#fecaca',
  'Negotiation': '#c4b5fd',
};

const COLUMN_WIDTHS: Record<string, string> = {
  leadId: '10%',
  name: '16%',
  email: '14%',
  phone: '12%',
  company: '14%',
  stage: '11%',
  owner: '12%',
  source: '12%',
  dealValue: '12%',
  linkedinId: '12%',
  webinarRegDate: '14%',
  webinarAttendDate: '14%',
  webinarDuration: '10%',
  utmSource: '12%',
  utmCampaign: '12%',
  deviceUsed: '12%',
};

export default function LeadsTable({ leads, columns = [] }: { leads: Lead[]; columns?: ColumnConfig[] }) {
  const visibleColumns = columns.length > 0
    ? columns.filter((col) => col.visible)
    : [
        { id: 'leadId', label: 'Lead ID', visible: true },
        { id: 'name', label: 'Name', visible: true },
        { id: 'company', label: 'Company', visible: true },
        { id: 'stage', label: 'Stage', visible: true },
        { id: 'owner', label: 'Owner', visible: true },
        { id: 'source', label: 'Source', visible: true },
        { id: 'dealValue', label: 'Deal Value', visible: true },
      ];

  const renderCell = (lead: Lead, columnId: string) => {
    switch (columnId) {
      case 'leadId':
        return (
          <Link
            href={`/leads/${lead.id}`}
            className="font-mono text-sm font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {lead.leadId}
          </Link>
        );
      case 'name':
        return (
          <>
            <Link href={`/leads/${lead.id}`} className="font-medium text-sm hover:underline">
              {lead.name}
            </Link>
            {lead.email && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {lead.email}
              </p>
            )}
          </>
        );
      case 'email':
        return <span className="text-sm">{lead.email || '—'}</span>;
      case 'phone':
        return <span className="text-sm">{lead.phone || '—'}</span>;
      case 'company':
        return <span className="text-sm">{lead.company || '—'}</span>;
      case 'stage':
        return (
          <span
            className="badge text-xs"
            style={{
              backgroundColor: `${stageColors[lead.stage?.name] || '#e5e7eb'}`,
              color: 'var(--text-primary)',
            }}
          >
            {lead.stage?.name || '—'}
          </span>
        );
      case 'owner':
        return <span className="text-sm">{lead.owner?.name || '—'}</span>;
      case 'source':
        return lead.source ? (
          <span
            className="badge badge-accent text-xs"
            style={{
              backgroundColor: 'rgba(123, 67, 151, 0.1)',
              color: 'var(--accent)',
            }}
          >
            {lead.source}
          </span>
        ) : (
          '—'
        );
      case 'dealValue':
        return (
          <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>
            {lead.dealValue ? `$${(lead.dealValue / 1000).toFixed(0)}k` : '—'}
          </span>
        );
      default:
        return <span className="text-sm">{lead[columnId] || '—'}</span>;
    }
  };
  return (
    <div className="card">
      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-light)' }}>
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.id} style={{ width: COLUMN_WIDTHS[col.id] || '12%' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                {visibleColumns.map((col) => (
                  <td key={`${lead.id}-${col.id}`}>
                    {renderCell(lead, col.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
