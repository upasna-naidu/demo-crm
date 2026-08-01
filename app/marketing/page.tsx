'use client';

import { useState, useEffect } from 'react';
import { spacing, typography, borderRadius } from '@/lib/design-system';

interface GeneratedContent {
  contentId: string;
  title: string;
  content: string;
  contentType: string;
  companyName: string;
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  description?: string;
}

const CONTENT_TYPES = [
  { id: 'email_campaign', label: '📧 Email Campaign', description: 'Professional email marketing content' },
  { id: 'social_posts', label: '📱 Social Media Posts', description: 'Posts for LinkedIn, Twitter, Facebook' },
  { id: 'landing_page', label: '🌐 Landing Page', description: 'High-converting landing page copy' },
  { id: 'blog_post', label: '📝 Blog Post', description: 'SEO-optimized blog content' }
];

export default function MarketingHubPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('email_campaign');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    fetchCompanies();
    const saved = localStorage.getItem('selectedCompanyId');
    if (saved) setSelectedCompany(saved);
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    if (!selectedCompany) {
      setError('Please select a company');
      setIsGenerating(false);
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a topic or prompt');
      setIsGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany,
          contentType: selectedContentType,
          prompt: prompt.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedContent(data);
        setPrompt('');
      } else {
        setError(data.error || 'Failed to generate content');
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedContent) {
      const element = document.createElement('a');
      const file = new Blob([generatedContent.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${generatedContent.title}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div style={{ padding: spacing['3xl'], backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: spacing['3xl'] }}>
          <h1 style={{ ...typography.pageTitle, color: 'var(--primary)', marginBottom: spacing.lg }}>
            🚀 Marketing Hub
          </h1>
          <p style={{ ...typography.body, color: 'var(--text-tertiary)' }}>
            Generate professional marketing content for your company in seconds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['3xl'] }}>
          {/* Generator Panel */}
          <div style={{
            backgroundColor: 'white',
            padding: spacing['3xl'],
            borderRadius: borderRadius.lg,
            border: `1px solid var(--border-light)`,
            height: 'fit-content'
          }}>
            <h2 style={{ ...typography.sectionTitle, marginBottom: spacing['2xl'] }}>Generate Content</h2>

            <form onSubmit={handleGenerate} style={{ display: 'grid', gap: spacing.xl }}>
              {/* Company Selector */}
              <div>
                <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                  SELECT COMPANY
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                    localStorage.setItem('selectedCompanyId', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `1px solid var(--border-light)`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.body.fontSize,
                    fontFamily: 'inherit',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Choose a company...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Content Type Selector */}
              <div>
                <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.md }}>
                  CONTENT TYPE
                </label>
                <div style={{ display: 'grid', gap: spacing.md }}>
                  {CONTENT_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      style={{
                        padding: spacing.lg,
                        border: `2px solid ${selectedContentType === type.id ? 'var(--primary)' : 'var(--border-light)'}`,
                        borderRadius: borderRadius.lg,
                        cursor: 'pointer',
                        backgroundColor: selectedContentType === type.id ? 'rgba(var(--primary-rgb), 0.05)' : 'white',
                        transition: 'all 200ms ease'
                      }}
                    >
                      <p style={{ ...typography.cardTitle, marginBottom: spacing.sm }}>
                        {type.label}
                      </p>
                      <p style={{ ...typography.small, color: 'var(--text-tertiary)' }}>
                        {type.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label style={{ ...typography.caption, color: 'var(--text-tertiary)', display: 'block', marginBottom: spacing.sm }}>
                  YOUR TOPIC OR PROMPT
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'AI-powered customer service solutions' or 'Why our product is better than competitors'"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `1px solid var(--border-light)`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.body.fontSize,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: spacing.lg,
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.small.fontSize
                }}>
                  ❌ {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.6 : 1,
                  transition: 'all 200ms ease'
                }}
              >
                {isGenerating ? '⏳ Generating...' : '✨ Generate Content'}
              </button>
            </form>
          </div>

          {/* Generated Content Panel */}
          <div style={{
            backgroundColor: 'white',
            padding: spacing['3xl'],
            borderRadius: borderRadius.lg,
            border: `1px solid var(--border-light)`
          }}>
            {generatedContent ? (
              <div>
                <div style={{ marginBottom: spacing['2xl'] }}>
                  <div style={{ marginBottom: spacing.lg }}>
                    <p style={{ ...typography.caption, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                      COMPANY
                    </p>
                    <p style={{ ...typography.body, fontWeight: '600' }}>
                      {generatedContent.companyName}
                    </p>
                  </div>

                  <div>
                    <p style={{ ...typography.caption, color: 'var(--text-tertiary)', marginBottom: spacing.sm }}>
                      TITLE
                    </p>
                    <p style={{ ...typography.sectionTitle }}>
                      {generatedContent.title}
                    </p>
                  </div>
                </div>

                {/* Content Display */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: spacing['2xl'],
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing['2xl'],
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  <p style={{ ...typography.body, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {generatedContent.content}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gap: spacing.md }}>
                  <button
                    onClick={handleCopyToClipboard}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: copiedToClipboard ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: copiedToClipboard ? 'white' : 'var(--primary)',
                      border: `1px solid var(--primary)`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 200ms ease'
                    }}
                  >
                    {copiedToClipboard ? '✅ Copied to Clipboard' : '📋 Copy to Clipboard'}
                  </button>

                  <button
                    onClick={handleDownload}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--primary)',
                      border: `1px solid var(--border-light)`,
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ⬇️ Download as Text File
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                padding: `${spacing['3xl']} ${spacing['2xl']}`
              }}>
                <p style={{ ...typography.body, marginBottom: spacing.lg }}>
                  👈 Fill in the form and click "Generate Content" to get started
                </p>
                <p style={{ ...typography.small }}>
                  Your generated content will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
