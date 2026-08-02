interface NodePaletteProps {
  onAddNode: (type: 'trigger' | 'action' | 'condition' | 'delay', label?: string) => void;
}

const NODE_CATEGORIES = [
  {
    title: 'Triggers',
    icon: '🔴',
    color: '#ff6b6b',
    nodes: [
      { type: 'trigger' as const, label: 'Lead Created' },
      { type: 'trigger' as const, label: 'Lead Updated' },
      { type: 'trigger' as const, label: 'Deal Moved' },
      { type: 'trigger' as const, label: 'Manual Trigger' },
    ],
  },
  {
    title: 'Actions',
    icon: '🟢',
    color: '#4ecdc4',
    nodes: [
      { type: 'action' as const, label: 'Assign Lead' },
      { type: 'action' as const, label: 'Send Email' },
      { type: 'action' as const, label: 'Send SMS' },
      { type: 'action' as const, label: 'Create Task' },
      { type: 'action' as const, label: 'Update Field' },
      { type: 'action' as const, label: 'Change Status' },
      { type: 'action' as const, label: 'Create Deal' },
      { type: 'action' as const, label: 'Notify Team' },
      { type: 'action' as const, label: 'Webhook Call' },
      { type: 'action' as const, label: 'Slack Message' },
      { type: 'action' as const, label: 'Record Activity' },
      { type: 'action' as const, label: 'Add to Campaign' },
      { type: 'action' as const, label: 'Schedule Call' },
      { type: 'action' as const, label: 'Update CRM Field' },
      { type: 'action' as const, label: 'Create Note' },
    ],
  },
  {
    title: 'Conditions',
    icon: '🟡',
    color: '#ffd93d',
    nodes: [
      { type: 'condition' as const, label: 'Score Check' },
      { type: 'condition' as const, label: 'Source Match' },
      { type: 'condition' as const, label: 'Field Equals' },
    ],
  },
  {
    title: 'Utilities',
    icon: '🔵',
    color: '#95e1d3',
    nodes: [
      { type: 'delay' as const, label: 'Delay' },
      { type: 'delay' as const, label: 'Wait for Event' },
    ],
  },
];

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div
      style={{
        width: '200px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '16px',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {NODE_CATEGORIES.map((category) => (
        <div key={category.title} style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#495057',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {category.icon} {category.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {category.nodes.map((node) => (
              <button
                key={`${node.type}_${node.label}`}
                onClick={() => onAddNode(node.type, node.label)}
                title={node.label}
                style={{
                  padding: '8px 12px',
                  backgroundColor: category.color,
                  color: node.type === 'condition' ? '#333' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {node.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
