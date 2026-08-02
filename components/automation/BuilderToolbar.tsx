import { useRouter } from 'next/navigation';

interface BuilderToolbarProps {
  automationName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onTest: () => void;
  isSaving: boolean;
}

export default function BuilderToolbar({
  automationName,
  onNameChange,
  onSave,
  onTest,
  isSaving,
}: BuilderToolbarProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #dee2e6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: '#495057',
        }}
      >
        ← Back
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6' }} />

      {/* Automation Name Input */}
      <input
        type="text"
        value={automationName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Automation name..."
        style={{
          flex: 1,
          padding: '8px 12px',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '600',
        }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onTest}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffb300';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffc107';
          }}
        >
          🧪 Test
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            opacity: isSaving ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isSaving) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            if (!isSaving) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
        >
          {isSaving ? '💾 Saving...' : '💾 Save'}
        </button>
      </div>
    </div>
  );
}
