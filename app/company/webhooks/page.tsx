'use client';

import { useEffect, useState } from 'react';

interface Webhook {
  id: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [testResults, setTestResults] = useState('');

  useEffect(() => {
    const cid = localStorage.getItem('companyId') || 'default';
    setCompanyId(cid);
    fetchWebhook(cid);
  }, []);

  const fetchWebhook = async (cid: string) => {
    try {
      const response = await fetch(`/api/organizations/${cid}/webhooks`);
      const data = await response.json();
      setWebhook(data.webhook);
    } catch (error) {
      console.error('Error fetching webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch(`/api/organizations/${companyId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const data = await response.json();
      if (data.webhook) {
        setWebhook(data.webhook);
        alert('Webhook created successfully!');
      } else {
        alert('Error creating webhook');
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleRegenerateSecret = async () => {
    if (!confirm('Regenerating the secret will invalidate the old one. Continue?')) return;

    try {
      const response = await fetch(`/api/organizations/${companyId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      });
      const data = await response.json();
      if (data.webhook) {
        setWebhook(data.webhook);
        setShowSecret(true);
        alert('Secret regenerated successfully!');
      }
    } catch (error) {
      console.error('Error regenerating secret:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testName) {
      alert('Please fill all fields');
      return;
    }

    if (!webhook) {
      alert('No webhook configured');
      return;
    }

    try {
      setTestResults('Sending test...');

      const payload = {
        companyId,
        webhookSecret: webhook.secret,
        leadData: {
          name: testName,
          email: testEmail,
          phone: '+1234567890',
          company: 'Test Company',
          source: 'test_webhook',
        },
      };

      const payloadStr = JSON.stringify(payload);

      // Generate signature
      const crypto = await import('crypto');
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadStr)
        .digest('hex');

      const response = await fetch('/api/webhooks/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature,
        },
        body: payloadStr,
      });

      const result = await response.json();
      setTestResults(JSON.stringify(result, null, 2));

      if (result.success) {
        alert('Test webhook sent successfully! Check below for response.');
        setTestEmail('');
        setTestName('');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setTestResults(JSON.stringify({ error: (error as any).message }, null, 2));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Webhook Integration</h1>
      <p>Integrate your website forms to automatically send leads to the CRM.</p>

      {loading ? (
        <p>Loading webhook...</p>
      ) : !webhook ? (
        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>No Webhook Configured</h3>
          <p>Create a webhook to start receiving leads from your website.</p>
          <button
            onClick={handleCreateWebhook}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Create Webhook
          </button>
        </div>
      ) : (
        <>
          {/* Webhook Details */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>Your Webhook Details</h2>

            {/* Webhook URL */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Webhook URL:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  readOnly
                  value={webhook.url}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                  }}
                />
                <button
                  onClick={() => copyToClipboard(webhook.url)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Use this URL to configure your website form or third-party service.
              </p>
            </div>

            {/* Webhook Secret */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Webhook Secret:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type={showSecret ? 'text' : 'password'}
                  readOnly
                  value={webhook.secret}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                  }}
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={handleRegenerateSecret}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Regenerate
                </button>
              </div>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Use this secret to sign webhook requests. Keep it confidential!
              </p>
            </div>

            {/* Created At */}
            <div>
              <p style={{ margin: 0 }}>
                <strong>Created:</strong> {new Date(webhook.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Setup Instructions</h3>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
              <h4>For Your Website Form</h4>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {`// After form submission:
const payload = {
  companyId: "${companyId}",
  webhookSecret: "${webhook.secret}",
  leadData: {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    source: "website_form",
    landingPageUrl: window.location.href
  }
};

const signature = await sha256(JSON.stringify(payload), "${webhook.secret}");

fetch("${webhook.url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-webhook-signature": signature
  },
  body: JSON.stringify(payload)
});`}
              </pre>
            </div>
          </div>

          {/* Test Webhook */}
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Test Webhook</h3>
            <form onSubmit={handleTestWebhook} style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Test
                </button>
              </div>
              {testResults && (
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}
                >
                  {testResults}
                </pre>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
