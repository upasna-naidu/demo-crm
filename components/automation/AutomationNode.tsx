import { Handle, Position } from 'reactflow';

interface NodeData {
  label: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  config?: any;
}

export default function AutomationNode({ data }: { data: NodeData }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'trigger':
        return {
          background: '#ff6b6b',
          border: '2px solid #d63031',
        };
      case 'action':
        return {
          background: '#4ecdc4',
          border: '2px solid #1a9b8e',
        };
      case 'condition':
        return {
          background: '#ffd93d',
          border: '2px solid #f9ca24',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
        };
      case 'delay':
        return {
          background: '#95e1d3',
          border: '2px solid #38c9aa',
        };
      default:
        return {
          background: '#4a9eff',
          border: '2px solid #1e88e5',
        };
    }
  };

  const handleCount = data.type === 'condition' ? 3 : 2;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: data.type === 'condition' ? '50%' : '8px',
        color: data.type === 'condition' ? '#333' : 'white',
        fontWeight: '600',
        fontSize: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...getNodeStyle(),
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.label}
      </div>
      {data.type === 'condition' ? (
        <>
          <Handle type="source" position={Position.Bottom} id="yes" />
          <Handle type="source" position={Position.Right} id="no" />
          <Handle type="source" position={Position.Left} id="else" />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
}
