import { Node } from 'reactflow';

interface NodeConfigPanelProps {
  selectedNodeId: string | null;
  nodes: Node[];
  onUpdateNode: (id: string, data: any) => void;
  onDeleteNode: (id: string) => void;
}

const ACTION_CONFIGS: Record<string, any[]> = {
  'Assign Lead': [
    { key: 'method', label: 'Assignment Method', type: 'select', options: ['round-robin', 'highest-score', 'specific-user'] },
    { key: 'filter', label: 'Filter by Department', type: 'select', options: ['all', 'sales', 'marketing', 'support'] },
  ],
  'Send Email': [
    { key: 'template', label: 'Email Template', type: 'select', options: ['welcome', 'nurture', 'follow-up', 'reminder', 'offer'] },
    { key: 'recipient', label: 'Send to', type: 'select', options: ['lead_email', 'owner_email', 'both'] },
  ],
  'Send SMS': [
    { key: 'message', label: 'Message', type: 'textarea', placeholder: 'SMS message text' },
    { key: 'phoneField', label: 'Phone Field', type: 'select', options: ['phone', 'mobile', 'other'] },
  ],
  'Create Task': [
    { key: 'title', label: 'Task Title', type: 'text', placeholder: 'Follow-up call' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'days', label: 'Due in (days)', type: 'number', placeholder: '3' },
  ],
  'Update Field': [
    { key: 'field', label: 'Field Name', type: 'select', options: ['status', 'score', 'source', 'owner', 'company'] },
    { key: 'value', label: 'New Value', type: 'text', placeholder: 'Enter value' },
  ],
  'Change Status': [
    { key: 'status', label: 'New Status', type: 'select', options: ['new', 'qualified', 'contacted', 'negotiating', 'closed'] },
  ],
  'Create Deal': [
    { key: 'dealTitle', label: 'Deal Title', type: 'text', placeholder: 'Deal from {{lead_name}}' },
    { key: 'value', label: 'Deal Value', type: 'number', placeholder: '0' },
  ],
  'Notify Team': [
    { key: 'message', label: 'Notification Message', type: 'textarea', placeholder: 'Enter notification' },
    { key: 'recipients', label: 'Recipients', type: 'select', options: ['manager', 'team_lead', 'all', 'sales_team'] },
  ],
  'Webhook Call': [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://example.com/webhook' },
    { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'GET'] },
    { key: 'payload', label: 'Payload (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
  ],
  'Slack Message': [
    { key: 'slackWebhook', label: 'Slack Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' },
    { key: 'channel', label: 'Channel', type: 'text', placeholder: '#notifications' },
    { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Message text' },
  ],
  'Record Activity': [
    { key: 'activityType', label: 'Activity Type', type: 'select', options: ['call', 'email', 'meeting', 'note', 'task'] },
    { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Activity details' },
  ],
  'Add to Campaign': [
    { key: 'campaignId', label: 'Campaign', type: 'select', options: ['summer_campaign', 'product_launch', 'seasonal'] },
    { key: 'campaignName', label: 'Campaign Name', type: 'text', placeholder: 'Campaign name' },
  ],
  'Schedule Call': [
    { key: 'callType', label: 'Call Type', type: 'select', options: ['inbound', 'outbound', 'video'] },
    { key: 'duration', label: 'Duration (mins)', type: 'number', placeholder: '15' },
    { key: 'daysFromNow', label: 'Schedule for (days)', type: 'number', placeholder: '1' },
  ],
  'Update CRM Field': [
    { key: 'crmObject', label: 'CRM Object', type: 'select', options: ['lead', 'contact', 'deal', 'account'] },
    { key: 'crmField', label: 'Field Name', type: 'text', placeholder: 'custom_field_1' },
    { key: 'crmValue', label: 'Field Value', type: 'text', placeholder: 'Enter value' },
  ],
  'Create Note': [
    { key: 'noteType', label: 'Note Type', type: 'select', options: ['general', 'follow_up', 'internal', 'customer'] },
    { key: 'noteContent', label: 'Note Content', type: 'textarea', placeholder: 'Enter note text' },
  ],
};

const CONDITION_CONFIGS: Record<string, any[]> = {
  'Score Check': [
    { key: 'operator', label: 'Operator', type: 'select', options: ['>', '<', '=', '>=', '<='] },
    { key: 'value', label: 'Score Value', type: 'number', placeholder: '50' },
  ],
  'Source Match': [
    { key: 'source', label: 'Lead Source', type: 'select', options: ['Website', 'LinkedIn', 'Phone', 'Email', 'Event'] },
  ],
  'Field Equals': [
    { key: 'field', label: 'Field Name', type: 'select', options: ['status', 'source', 'company', 'title'] },
    { key: 'value', label: 'Value', type: 'text', placeholder: 'Enter value to match' },
  ],
};

export default function NodeConfigPanel({
  selectedNodeId,
  nodes,
  onUpdateNode,
  onDeleteNode,
}: NodeConfigPanelProps) {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div
        style={{
          width: '280px',
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #dee2e6',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '14px',
        }}
      >
        Select a node to configure
      </div>
    );
  }

  const nodeData = selectedNode.data;
  const configOptions =
    nodeData.type === 'action'
      ? ACTION_CONFIGS[nodeData.label] || []
      : nodeData.type === 'condition'
      ? CONDITION_CONFIGS[nodeData.label] || []
      : [];

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        borderLeft: '1px solid #dee2e6',
        padding: '16px',
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Node Info */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#6c757d', marginBottom: '4px', textTransform: 'uppercase' }}>
          {selectedNode.data.type}
        </div>
        <input
          type="text"
          value={nodeData.label}
          onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
          }}
        />
      </div>

      {/* Configuration Options */}
      {configOptions.length > 0 && (
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6c757d', marginBottom: '12px', textTransform: 'uppercase' }}>
            Configuration
          </div>

          {configOptions.map((option) => (
            <div key={option.key} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#495057' }}>
                {option.label}
              </label>

              {option.type === 'select' ? (
                <select
                  value={nodeData.config?.[option.key] || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { config: { ...nodeData.config, [option.key]: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <option value="">Select...</option>
                  {option.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : option.type === 'textarea' ? (
                <textarea
                  value={nodeData.config?.[option.key] || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { config: { ...nodeData.config, [option.key]: e.target.value } })}
                  placeholder={option.placeholder}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    minHeight: '60px',
                    resize: 'vertical',
                  }}
                />
              ) : (
                <input
                  type={option.type}
                  value={nodeData.config?.[option.key] || ''}
                  onChange={(e) => onUpdateNode(selectedNode.id, { config: { ...nodeData.config, [option.key]: e.target.value } })}
                  placeholder={option.placeholder}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDeleteNode(selectedNode.id)}
        style={{
          padding: '8px 12px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          marginTop: 'auto',
        }}
      >
        Delete Node
      </button>
    </div>
  );
}
