'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AUTOMATION_TEMPLATES, getTemplatesByCategory } from '@/lib/automationTemplates';

const CATEGORIES = ['Sales', 'Marketing', 'Support', 'Operations'];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const filteredTemplates = AUTOMATION_TEMPLATES.filter((template) => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesIndustry = !selectedIndustry || template.industryFit.includes(selectedIndustry);
    return matchesCategory && matchesIndustry;
  });

  const applyTemplate = async (templateId: string) => {
    // This will create a new automation from the template
    // For now, redirect to builder with template data
    // In production, save template as new automation first
    alert(`Template "${templateId}" selected. Redirect to builder with pre-filled nodes.`);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Automation Templates</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Pre-built automations for common business processes. Customize and activate in seconds.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '32px', marginBottom: '32px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
            Category
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === null ? 'var(--primary)' : '#e5e7eb',
                color: selectedCategory === null ? 'white' : '#374151',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedCategory === category ? 'var(--primary)' : '#e5e7eb',
                  color: selectedCategory === category ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
            Industry
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedIndustry(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedIndustry === null ? 'var(--primary)' : '#e5e7eb',
                color: selectedIndustry === null ? 'white' : '#374151',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              All
            </button>
            {['SaaS', 'B2B', 'E-commerce', 'Services', 'Enterprise'].map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedIndustry === industry ? 'var(--primary)' : '#e5e7eb',
                  color: selectedIndustry === industry ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredTemplates.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No templates match your filters.
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '20px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{template.icon}</div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: template.difficulty === 'beginner' ? '#d1fae5' : template.difficulty === 'intermediate' ? '#fef3c7' : '#fee2e2',
                    color: template.difficulty === 'beginner' ? '#065f46' : template.difficulty === 'intermediate' ? '#78350f' : '#7f1d1d',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                  }}
                >
                  {template.difficulty}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
                {template.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
                {template.description}
              </p>

              {/* Meta */}
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  <strong>Category:</strong> {template.category}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <strong>Best for:</strong> {template.industryFit.join(', ')}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {template.nodes.length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Steps</div>
                </div>
                <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {template.edges.length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Connections</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => applyTemplate(template.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  }}
                >
                  Use Template
                </button>
                <Link
                  href={`/automations/builder?template=${template.id}`}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#e5e7eb';
                  }}
                >
                  Preview
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Start Section */}
      <div style={{ marginTop: '48px', backgroundColor: '#eff6ff', borderLeft: '4px solid var(--primary)', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1e3a8a' }}>
          💡 Pro Tip
        </h3>
        <p style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6' }}>
          Not sure where to start? Try the "Lead Routing" template first – it's perfect for setting up your first automation. You can always customize it later!
        </p>
      </div>
    </div>
  );
}
