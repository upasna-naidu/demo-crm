'use client';

import { useState, useEffect } from 'react';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface EmailTemplate {
  id: string;
  name: string;
  templateType: string;
  subject: string;
  body: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_TYPES = [
  { id: 'welcome', label: '👋 Welcome Email' },
  { id: 'reminder', label: '📌 Reminder' },
  { id: 'promotional', label: '🎉 Promotional' },
  { id: 'notification', label: '🔔 Notification' },
  { id: 'followup', label: '💬 Follow-up' },
  { id: 'general', label: '📧 General' },
];

const TEMPLATE_VARIABLES = ['{{firstName}}', '{{lastName}}', '{{email}}', '{{companyName}}', '{{date}}', '{{time}}'];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    templateType: 'general',
    subject: '',
    body: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'archived',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/email-templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      templateType: template.templateType,
      subject: template.subject,
      body: template.body,
      description: template.description || '',
      status: template.status,
    });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      templateType: 'general',
      subject: '',
      body: '',
      description: '',
      status: 'draft',
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditTemplate = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
        setError('Name, subject, and body are required');
        setIsSaving(false);
        return;
      }

      if (isEditing && selectedTemplate) {
        // Update existing template
        const res = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTemplates();
          setShowForm(false);
          setSelectedTemplate(null);
          setIsEditing(false);
          alert('✅ Template updated successfully');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to update template');
        }
      } else {
        // Create new template
        const res = await fetch('/api/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTemplates();
          setShowForm(false);
          setFormData({
            name: '',
            templateType: 'general',
            subject: '',
            body: '',
            description: '',
            status: 'draft',
          });
          alert('✅ Template created successfully');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create template');
        }
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTemplates();
        setSelectedTemplate(null);
        alert('✅ Template deleted successfully');
      } else {
        alert('Failed to delete template');
      }
    } catch (err) {
      alert(`Error: ${String(err)}`);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = formData.body.substring(0, start) + variable + formData.body.substring(end);
      setFormData({ ...formData, body: newBody });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'active') return 'rgb(220, 252, 231)';
    if (status === 'archived') return 'rgb(243, 232, 255)';
    return 'rgb(254, 243, 199)';
  };

  const statusTextColor = (status: string) => {
    if (status === 'active') return 'rgb(22, 101, 52)';
    if (status === 'archived') return 'rgb(88, 28, 135)';
    return 'rgb(78, 65, 2)';
  };

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing['3xl'] }}>
          <div>
            <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', marginBottom: spacing.lg }}>
              📧 Email Templates
            </h1>
            <p style={{ ...typography.body, color: 'var(--text-tertiary)' }}>
              Create and manage reusable email templates
            </p>
          </div>
          <button
            onClick={handleNewTemplate}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.button.fontSize,
              fontWeight: typography.button.fontWeight,
              cursor: 'pointer',
            }}
          >
            + New Template
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: spacing['3xl'] }}>
          {/* Left Sidebar - Template List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: borderRadius.lg,
            border: `1px solid var(--border-light)`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '600px',
          }}>
            <div style={{ padding: `${spacing.lg} ${spacing['2xl']}`, borderBottom: `1px solid var(--border-light)` }}>
              <p style={{ ...typography.caption, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Templates ({templates.length})
              </p>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {isLoading ? (
                <div style={{ padding: spacing['2xl'], textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Loading...
                </div>
              ) : templates.length === 0 ? (
                <div style={{ padding: spacing['2xl'], textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No templates yet
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    style={{
                      width: '100%',
                      padding: `${spacing.lg} ${spacing['2xl']}`,
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: `1px solid var(--border-light)`,
                      backgroundColor: selectedTemplate?.id === template.id ? 'var(--bg-secondary)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTemplate?.id !== template.id) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTemplate?.id !== template.id) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <p style={{ ...typography.cardTitle, marginBottom: spacing.sm, color: 'var(--primary)' }}>
                      {template.name}
                    </p>
                    <p style={{ ...typography.small, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                      {TEMPLATE_TYPES.find(t => t.id === template.templateType)?.label}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: statusColor(template.status),
                      color: statusTextColor(template.status),
                      fontSize: typography.caption.fontSize,
                      fontWeight: '600',
                    }}>
                      {template.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel */}
          {showForm ? (
            // Form View
            <div style={{
              backgroundColor: 'white',
              borderRadius: borderRadius.lg,
              border: `1px solid var(--border-light)`,
              padding: spacing['3xl'],
            }}>
              <h2 style={{ ...typography.sectionTitle, marginBottom: spacing['2xl'] }}>
                {isEditing ? 'Edit Template' : 'New Template'}
              </h2>

              <form onSubmit={handleSaveTemplate} style={{ display: 'grid', gap: spacing.xl }}>
                {/* Name */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Template Type
                  </label>
                  <select
                    value={formData.templateType}
                    onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                    }}
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{companyName}}!"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Body with Variables */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Email Body *
                  </label>
                  <div style={{ marginBottom: spacing.md }}>
                    <p style={{ ...typography.caption, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                      Quick Variables:
                    </p>
                    <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => insertVariable(variable)}
                          style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--primary)',
                            border: `1px solid var(--border-light)`,
                            borderRadius: borderRadius.md,
                            fontSize: typography.caption.fontSize,
                            cursor: 'pointer',
                          }}
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="body-textarea"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Enter email body with variables like {{firstName}}"
                    rows={8}
                    style={{
                      width: '100%',
                      padding: `${spacing.lg} ${spacing.xl}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'monospace',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.body.fontSize,
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: spacing.lg,
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.small.fontSize,
                  }}>
                    ❌ {error}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: borderRadius.lg,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1,
                      fontSize: typography.button.fontSize,
                      fontWeight: typography.button.fontWeight,
                    }}
                  >
                    {isSaving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setSelectedTemplate(null);
                    }}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--primary)',
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      fontSize: typography.button.fontSize,
                      fontWeight: typography.button.fontWeight,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTemplate ? (
            // View Mode
            <div style={{
              backgroundColor: 'white',
              borderRadius: borderRadius.lg,
              border: `1px solid var(--border-light)`,
              padding: spacing['3xl'],
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing['2xl'] }}>
                <div>
                  <h2 style={{ ...typography.sectionTitle, marginBottom: spacing.md }}>
                    {selectedTemplate.name}
                  </h2>
                  <p style={{ ...typography.body, color: 'var(--text-tertiary)' }}>
                    {selectedTemplate.description}
                  </p>
                </div>
                <span style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: statusColor(selectedTemplate.status),
                  color: statusTextColor(selectedTemplate.status),
                  fontSize: typography.caption.fontSize,
                  fontWeight: '600',
                }}>
                  {selectedTemplate.status}
                </span>
              </div>

              <div style={{ marginBottom: spacing['2xl'] }}>
                <p style={{ ...typography.caption, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                  Type: {TEMPLATE_TYPES.find(t => t.id === selectedTemplate.templateType)?.label}
                </p>
                <p style={{ ...typography.caption, color: 'var(--text-tertiary)' }}>
                  Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ marginBottom: spacing['2xl'] }}>
                <h3 style={{ ...typography.cardTitle, marginBottom: spacing.md }}>Subject</h3>
                <div style={{
                  padding: spacing.lg,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: borderRadius.lg,
                }}>
                  <p style={{ ...typography.body, fontFamily: 'monospace' }}>
                    {selectedTemplate.subject}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: spacing['2xl'] }}>
                <h3 style={{ ...typography.cardTitle, marginBottom: spacing.md }}>Body</h3>
                <div style={{
                  padding: spacing.lg,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: borderRadius.lg,
                  maxHeight: '300px',
                  overflow: 'auto',
                }}>
                  <p style={{ ...typography.body, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {selectedTemplate.body}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <button
                  onClick={handleEditTemplate}
                  style={{
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: typography.button.fontSize,
                    fontWeight: typography.button.fontWeight,
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  style={{
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: '#fee',
                    color: '#c33',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: typography.button.fontSize,
                    fontWeight: typography.button.fontWeight,
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ) : (
            // Empty State
            <div style={{
              backgroundColor: 'white',
              borderRadius: borderRadius.lg,
              border: `1px solid var(--border-light)`,
              padding: spacing['3xl'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
            }}>
              <div>
                <p style={{ fontSize: '48px', marginBottom: spacing.lg }}>📧</p>
                <p style={{ ...typography.body, color: 'var(--text-tertiary)' }}>
                  Select a template or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
