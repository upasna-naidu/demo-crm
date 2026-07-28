'use client';

import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
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
];

interface ColumnSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (columns: ColumnConfig[]) => void;
  currentColumns: ColumnConfig[];
}

export default function ColumnSelector({
  isOpen,
  onClose,
  onSave,
  currentColumns,
}: ColumnSelectorProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(currentColumns || DEFAULT_COLUMNS);
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  useEffect(() => {
    setColumns(currentColumns || DEFAULT_COLUMNS);
  }, [isOpen, currentColumns]);

  const toggleColumn = (id: string) => {
    setColumns(
      columns.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const toggleAll = () => {
    const allVisible = columns.every((col) => col.visible);
    setColumns(columns.map((col) => ({ ...col, visible: !allVisible })));
  };

  const handleSave = () => {
    onSave(columns);
    onClose();
  };

  const handleReset = () => {
    setColumns(DEFAULT_COLUMNS);
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const addCustomColumn = () => {
    if (!newColumnName.trim()) return;

    const customId = `custom_${Date.now()}`;
    const newColumn: ColumnConfig = {
      id: customId,
      label: newColumnName,
      visible: true,
    };

    setColumns([...columns, newColumn]);
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const deleteColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id));
  };

  const isCustomColumn = (id: string) => id.startsWith('custom_');
  const visibleCount = columns.filter((col) => col.visible).length;

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
        className={`fixed right-0 top-0 h-screen w-80 bg-white shadow-lg z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between" style={{ borderBottomColor: 'var(--border-light)' }}>
          <div>
            <h2 className="text-lg font-bold">Columns</h2>
            <p className="text-xs text-gray-500 mt-1">{visibleCount} visible</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Toggle All */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={columns.every((col) => col.visible)}
                onChange={toggleAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Select All</span>
            </label>
          </div>

          {/* Columns List */}
          <div className="space-y-2">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => toggleColumn(column.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 flex-1">{column.label}</span>
                {isCustomColumn(column.id) && (
                  <button
                    onClick={() => deleteColumn(column.id)}
                    className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors text-sm"
                    title="Delete column"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Custom Column */}
          <div className="mt-6 pt-6 border-t" style={{ borderTopColor: 'var(--border-light)' }}>
            {!isAddingColumn ? (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full text-sm font-medium py-2 px-3 border rounded hover:bg-gray-50 transition-colors text-blue-600"
                style={{ borderColor: 'var(--border-light)' }}
              >
                + Add Custom Column
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Column name..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomColumn();
                  }}
                  className="w-full text-sm py-2 px-3 border rounded"
                  style={{ borderColor: 'var(--border-light)' }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCustomColumn}
                    className="flex-1 text-sm font-medium py-1.5 px-3 text-white rounded transition-colors"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }}
                    className="flex-1 text-sm font-medium py-1.5 px-3 border rounded hover:bg-gray-50 transition-colors"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 space-y-3" style={{ borderTopColor: 'var(--border-light)' }}>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 border rounded hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 text-sm font-medium text-white rounded transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
