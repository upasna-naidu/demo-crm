'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadsKanban from '@/components/leads/LeadsKanban';

export default function LeadsPage() {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sources, setSources] = useState<string[]>([]);
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (stageFilter) query.append('stageId', stageFilter);
        if (sourceFilter) query.append('source', sourceFilter);

        const leadsRes = await fetch(`/api/leads?${query}`);
        const leadsData = await leadsRes.json();
        let filtered = leadsData.leads || [];

        if (sortBy === 'name') {
          filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else if (sortBy === 'value-high') {
          filtered.sort((a: any, b: any) => (b.dealValue || 0) - (a.dealValue || 0));
        } else if (sortBy === 'value-low') {
          filtered.sort((a: any, b: any) => (a.dealValue || 0) - (b.dealValue || 0));
        } else if (sortBy === 'oldest') {
          filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        if (ownerFilter) {
          filtered = filtered.filter((l: any) => l.ownerId === ownerFilter);
        }

        setLeads(filtered);
        const uniqueSources = [...new Set(leadsData.leads?.map((l: any) => l.source).filter(Boolean))] as string[];
        setSources(uniqueSources.sort());
        const uniqueOwners = [...new Map(leadsData.leads?.map((l: any) => [l.ownerId, l.owner])).values()] as any[];
        setOwners(uniqueOwners.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load leads:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadStages = async () => {
      try {
        const stagesRes = await fetch('/api/stages');
        setStages(await stagesRes.json());
      } catch (error) {
        console.error('Failed to load stages:', error);
      }
    };

    loadData();
    loadStages();
  }, [search, stageFilter, sourceFilter, ownerFilter, sortBy]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-6" style={{ borderBottomColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Leads</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Manage and track your sales leads</p>
          </div>
          <div className="flex gap-2">
            <Link href="/leads/import" className="btn btn-secondary">📥 Import</Link>
            <button className="btn btn-primary">➕ New Lead</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64"
          />
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-40">
            <option value="">All Stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-40">
            <option value="">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="w-40">
            <option value="">All Owners</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="value-high">Deal Value (High)</option>
            <option value="value-low">Deal Value (Low)</option>
          </select>
          <button
            onClick={() => setView(view === 'table' ? 'kanban' : 'table')}
            className="btn btn-ghost"
          >
            {view === 'table' ? '🎯 Kanban' : '📋 Table'}
          </button>
        </div>

        <div className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="card p-12 text-center">
            <p style={{ color: 'var(--text-tertiary)' }}>No leads found</p>
          </div>
        ) : view === 'table' ? (
          <LeadsTable leads={leads} />
        ) : (
          <LeadsKanban leads={leads} stages={stages} />
        )}
      </div>
    </div>
  );
}
