'use client';

import { useState, useEffect } from 'react';

export interface FilterRule {
  id: string;
  field: string;
  operator: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan' | 'contains' | 'startsWith';
  value: string;
  isCustomValue?: boolean;
  operator_logic?: 'AND' | 'OR';
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterRule[]) => void;
  currentFilters: FilterRule[];
  availableFields: { id: string; label: string }[];
  fieldValues: Record<string, any[]>;
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'Equals (=)',
  notEquals: 'Not Equals (≠)',
  lessThan: 'Less Than (<)',
  greaterThan: 'Greater Than (>)',
  contains: 'Contains',
  startsWith: 'Starts With',
};

const NUMERIC_FIELDS = ['dealValue'];
const TEXT_FIELDS = ['name', 'company', 'email', 'phone', 'linkedinId', 'utmSource', 'utmCampaign', 'deviceUsed'];
const DATE_FIELDS = ['webinarRegDate', 'webinarAttendDate'];
const SELECT_FIELDS = ['stage', 'owner', 'source'];

export default function FilterSidebar({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  availableFields,
  fieldValues,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterRule[]>(currentFilters);
  const [nextId, setNextId] = useState(currentFilters.length + 1);

  useEffect(() => {
    setFilters(currentFilters);
    setNextId(currentFilters.length + 1);
  }, [isOpen, currentFilters, fieldValues]);

  const addFilter = (logicOperator: 'AND' | 'OR' = 'AND') => {
    const newFilter: FilterRule = {
      id: String(nextId),
      field: 'name',
      operator: 'equals',
      value: '',
      isCustomValue: false,
      operator_logic: logicOperator,
    };
    setFilters([...filters, newFilter]);
    setNextId(nextId + 1);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    setFilters(
      filters.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      )
    );
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters([]);
    onApplyFilters([]);
    onClose();
  };

  const getOperatorsForField = (fieldId: string) => {
    if (NUMERIC_FIELDS.includes(fieldId)) {
      return ['equals', 'notEquals', 'lessThan', 'greaterThan'];
    } else if (TEXT_FIELDS.includes(fieldId)) {
      return ['equals', 'notEquals', 'contains', 'startsWith'];
    } else if (DATE_FIELDS.includes(fieldId)) {
      return ['equals', 'lessThan', 'greaterThan'];
    } else {
      return ['equals', 'notEquals'];
    }
  };

  const getInputType = (fieldId: string) => {
    if (NUMERIC_FIELDS.includes(fieldId)) {
      return 'number';
    } else if (DATE_FIELDS.includes(fieldId)) {
      return 'date';
    }
    return 'text';
  };

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const hasDropdown = (fieldId: string) => {
    return SELECT_FIELDS.includes(fieldId);
  };

  const getDropdownOptions = (fieldId: string, searchText: string = '') => {
    const values = fieldValues[fieldId];
    if (!values || values.length === 0) {
      return [];
    }

    const options = values.map((v: any) => {
      if (typeof v === 'string') {
        return { id: v, label: v };
      } else if (v && typeof v === 'object') {
        return {
          id: String(v.id || v),
          label: v.name || v.label || String(v.id || v)
        };
      }
      return { id: String(v), label: String(v) };
    });

    if (searchText) {
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return options;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between" style={{ borderBottomColor: 'var(--border-light)' }}>
          <h2 className="text-lg font-bold">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filters.length === 0 ? (
            <p className="text-gray-500 text-sm">No filters applied. Add one to get started.</p>
          ) : (
            filters.map((filter, index) => (
              <div key={filter.id} className="space-y-3">
                {/* Logic Operator */}
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={filter.operator_logic || 'AND'}
                      onChange={(e) =>
                        updateFilter(filter.id, {
                          operator_logic: e.target.value as 'AND' | 'OR',
                        })
                      }
                      className="px-3 py-2 text-sm font-medium border rounded"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                )}

                {/* Filter Row */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {/* Field Selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Field</label>
                    <select
                      value={filter.field}
                      onChange={(e) =>
                        updateFilter(filter.id, {
                          field: e.target.value,
                          operator: 'equals',
                          value: '',
                          isCustomValue: false,
                        })
                      }
                      className="w-full text-sm py-2 px-3 border rounded"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      {availableFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Operator</label>
                    <select
                      value={filter.operator}
                      onChange={(e) =>
                        updateFilter(filter.id, {
                          operator: e.target.value as FilterRule['operator'],
                        })
                      }
                      className="w-full text-sm py-2 px-3 border rounded"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      {getOperatorsForField(filter.field).map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input - Dropdown or Text */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">Value</label>
                    {hasDropdown(filter.field) ? (
                      <select
                        value={filter.value}
                        onChange={(e) => {
                          updateFilter(filter.id, { value: e.target.value, isCustomValue: e.target.value !== '' });
                        }}
                        className="w-full text-sm py-2 px-3 border rounded"
                        style={{ borderColor: 'var(--border-light)' }}
                      >
                        <option value="">-- Select a value --</option>
                        {getDropdownOptions(filter.field).map((opt, idx) => (
                          <option key={`${opt.id}-${idx}`} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                        <option value="" disabled style={{ borderTop: '1px solid #ccc' }}>
                          ─────────────────
                        </option>
                      </select>
                    ) : (
                      <input
                        type={getInputType(filter.field)}
                        placeholder="Enter value..."
                        value={filter.value}
                        onChange={(e) =>
                          updateFilter(filter.id, { value: e.target.value })
                        }
                        className="w-full text-sm py-2 px-3 border rounded"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                    )}
                  </div>

                  {/* Preview */}
                  {filter.value && (
                    <div className="text-xs text-gray-600 p-2 bg-white rounded border" style={{ borderBottomColor: 'var(--border-light)' }}>
                      <span className="font-semibold">{getFieldLabel(filter.field)}</span>
                      {' '}
                      <span className="text-gray-500">{OPERATOR_LABELS[filter.operator]}</span>
                      {' '}
                      <span className="font-semibold">{filter.value}</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="w-full py-2 px-3 text-sm font-medium text-red-600 border rounded hover:bg-red-50 transition-colors"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    Remove Filter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 space-y-3" style={{ borderTopColor: 'var(--border-light)' }}>
          {filters.length === 0 ? (
            <button
              onClick={() => addFilter()}
              className="w-full py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              + Add Filter
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => addFilter('AND')}
                className="flex-1 py-2 px-3 text-sm font-medium border rounded hover:bg-blue-50 transition-colors text-blue-600"
                style={{ borderColor: 'var(--border-light)' }}
              >
                + AND
              </button>
              <button
                onClick={() => addFilter('OR')}
                className="flex-1 py-2 px-3 text-sm font-medium border rounded hover:bg-purple-50 transition-colors text-purple-600"
                style={{ borderColor: 'var(--border-light)' }}
              >
                + OR
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 border rounded hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 px-4 text-sm font-medium text-white rounded transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
