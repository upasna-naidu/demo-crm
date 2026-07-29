'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadsKanban from '@/components/leads/LeadsKanban';
import FilterSidebar, { FilterRule } from '@/components/FilterSidebar';
import ColumnSelector, { ColumnConfig } from '@/components/ColumnSelector';

export default function ContactsPage() {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sources, setSources] = useState<string[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterRule[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [isColumnOpen, setIsColumnOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Load column preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contactsColumns');
    if (saved) {
      setColumns(JSON.parse(saved));
    } else {
      setColumns([
        { id: 'leadId', label: 'Lead ID', visible: true },
        { id: 'name', label: 'Name', visible: true },
        { id: 'email', label: 'Email ID', visible: false },
        { id: 'phone', label: 'Contact Number', visible: false },
        { id: 'company', label: 'Company', visible: true },
        { id: 'stage', label: 'Stage', visible: true },
        { id: 'owner', label: 'Owner', visible: true },
        { id: 'source', label: 'Source', visible: true },
        { id: 'dealValue', label: 'Deal Value', visible: true },
        { id: 'linkedinId', label: 'LinkedIn ID', visible: false },
        { id: 'webinarRegDate', label: 'Webinar Registration Date', visible: false },
        { id: 'webinarAttendDate', label: 'Webinar Attended Date', visible: false },
        { id: 'webinarDuration', label: 'Minutes in Webinar', visible: false },
        { id: 'utmSource', label: 'UTM Source', visible: false },
        { id: 'utmCampaign', label: 'UTM Campaign', visible: false },
        { id: 'deviceUsed', label: 'Device Used', visible: false },
      ]);
    }
  }, []);

  const handleSaveColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem('contactsColumns', JSON.stringify(newColumns));
  };

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
        let baseLeads = leadsData.leads || [];

        // Store all leads for advanced filtering
        setAllLeads(baseLeads);

        let filtered = [...baseLeads];

        // Apply search filter
        if (search) {
          filtered = filtered.filter((l: any) => matchesSearch(l, search));
        }

        // Apply stage filter
        if (stageFilter) {
          filtered = filtered.filter((l: any) => l.stageId === stageFilter);
        }

        // Apply source filter
        if (sourceFilter) {
          filtered = filtered.filter((l: any) => l.source === sourceFilter);
        }

        // Apply owner filter
        if (ownerFilter) {
          filtered = filtered.filter((l: any) => l.ownerId === ownerFilter);
        }

        // Apply advanced filters (with AND/OR logic)
        if (advancedFilters.length > 0) {
          filtered = applyAdvancedFilters(filtered, advancedFilters);
        }

        if (sortBy === 'name') {
          filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else if (sortBy === 'value-high') {
          filtered.sort((a: any, b: any) => (b.dealValue || 0) - (a.dealValue || 0));
        } else if (sortBy === 'value-low') {
          filtered.sort((a: any, b: any) => (a.dealValue || 0) - (b.dealValue || 0));
        } else if (sortBy === 'oldest') {
          filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        setLeads(filtered);
        setCurrentPage(1);
        const uniqueSources = [...new Set(baseLeads?.map((l: any) => l.source).filter(Boolean))] as string[];
        setSources(uniqueSources.sort());
        const uniqueOwners = [...new Map(baseLeads?.map((l: any) => [l.ownerId, l.owner])).values()] as any[];
        setOwners(uniqueOwners.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to load contacts:', error);
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
  }, [search, stageFilter, sourceFilter, ownerFilter, sortBy, advancedFilters]);

  const applyAdvancedFilters = (data: any[], filters: FilterRule[]): any[] => {
    if (filters.length === 0) return data;

    return data.filter((item) => {
      let result = matchesFilterRule(item, filters[0]);

      for (let i = 1; i < filters.length; i++) {
        const matches = matchesFilterRule(item, filters[i]);
        const operator = filters[i].operator_logic || 'AND';

        if (operator === 'AND') {
          result = result && matches;
        } else {
          result = result || matches;
        }
      }

      return result;
    });
  };

  const matchesFilterRule = (item: any, rule: FilterRule): boolean => {
    const fieldValue = getFieldValue(item, rule.field);
    const ruleValue = rule.value;

    if (fieldValue === null || fieldValue === undefined) {
      return rule.operator === 'notEquals';
    }

    const fieldStr = String(fieldValue).toLowerCase();
    const ruleStr = String(ruleValue).toLowerCase();

    switch (rule.operator) {
      case 'equals':
        return fieldStr === ruleStr;
      case 'notEquals':
        return fieldStr !== ruleStr;
      case 'contains':
        return fieldStr.includes(ruleStr);
      case 'startsWith':
        return fieldStr.startsWith(ruleStr);
      case 'lessThan':
        return Number(fieldValue) < Number(ruleValue);
      case 'greaterThan':
        return Number(fieldValue) > Number(ruleValue);
      default:
        return true;
    }
  };

  const matchesSearch = (item: any, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.leadId?.toLowerCase().includes(term)) ||
      (item.name?.toLowerCase().includes(term)) ||
      (item.company?.toLowerCase().includes(term)) ||
      (item.phone?.toLowerCase().includes(term)) ||
      (item.email?.toLowerCase().includes(term))
    );
  };

  const getFieldValue = (item: any, fieldId: string): any => {
    switch (fieldId) {
      case 'leadId':
        return item.leadId;
      case 'name':
        return item.name;
      case 'email':
        return item.email;
      case 'phone':
        return item.phone;
      case 'company':
        return item.company;
      case 'stage':
        return item.stage?.name;
      case 'owner':
        return item.owner?.name;
      case 'source':
        return item.source;
      case 'dealValue':
        return item.dealValue;
      case 'linkedinId':
        return item.linkedinId;
      case 'webinarRegDate':
        return item.webinarRegDate;
      case 'webinarAttendDate':
        return item.webinarAttendDate;
      case 'webinarDuration':
        return item.webinarDuration;
      case 'utmSource':
        return item.utmSource;
      case 'utmCampaign':
        return item.utmCampaign;
      case 'deviceUsed':
        return item.deviceUsed;
      default:
        return item[fieldId];
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = leads.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-6" style={{ borderBottomColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Manage and track your contacts and relationships</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="btn btn-secondary"
              title="Advanced Filters"
            >
              🔍 Filters
            </button>
            <Link href="/contacts/import" className="btn btn-secondary">📥 Import</Link>
            <button className="btn btn-primary">➕ New Contact</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by Lead ID, Name, Company, Phone, Email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
              }
            }}
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

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {leads.length} contact{leads.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5 px-2 border rounded"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={75}>75</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                per page
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsColumnOpen(true)}
            className="text-xs font-medium px-3 py-1.5 border rounded hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-tertiary)' }}
            title="Customize columns"
          >
            ⚙️ Columns
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="card p-12 text-center">
              <p style={{ color: 'var(--text-tertiary)' }}>No contacts found</p>
            </div>
          ) : view === 'table' ? (
            <LeadsTable leads={paginatedLeads} columns={columns} />
          ) : (
            <LeadsKanban leads={paginatedLeads} stages={stages} />
          )}
        </div>

        {/* Pagination */}
        {leads.length > 0 && view === 'table' && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1.5 text-xs font-medium border rounded transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: currentPage === page ? 'var(--primary)' : 'transparent',
                    borderColor: currentPage === page ? 'var(--primary)' : 'var(--border-light)',
                    color: currentPage === page ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={setAdvancedFilters}
        currentFilters={advancedFilters}
        availableFields={[
          { id: 'leadId', label: 'Lead ID' },
          { id: 'name', label: 'Lead Name' },
          { id: 'email', label: 'Email ID' },
          { id: 'phone', label: 'Contact Number' },
          { id: 'company', label: 'Company' },
          { id: 'stage', label: 'Lead Stage' },
          { id: 'owner', label: 'Owner Name' },
          { id: 'source', label: 'Source' },
          { id: 'dealValue', label: 'Deal Value' },
          { id: 'linkedinId', label: 'LinkedIn ID' },
          { id: 'webinarRegDate', label: 'Webinar Registration Date' },
          { id: 'webinarAttendDate', label: 'Webinar Attended Date' },
          { id: 'webinarDuration', label: 'Minutes in Webinar' },
          { id: 'utmSource', label: 'UTM Source' },
          { id: 'utmCampaign', label: 'UTM Campaign' },
          { id: 'deviceUsed', label: 'Device Used' },
        ]}
        fieldValues={{
          stage: stages && stages.length > 0 ? stages.map((s: any) => ({ id: String(s.id), name: s.name })) : [],
          owner: owners && owners.length > 0 ? owners.map((o: any) => ({ id: String(o.id), name: o.name })) : [],
          source: sources && sources.length > 0 ? sources.map((s: string) => ({ id: s, name: s })) : [],
        }}
      />

      {/* Column Selector */}
      <ColumnSelector
        isOpen={isColumnOpen}
        onClose={() => setIsColumnOpen(false)}
        onSave={handleSaveColumns}
        currentColumns={columns}
      />
    </div>
  );
}
