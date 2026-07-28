'use client';

import { useState } from 'react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform z-40"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 rounded-lg shadow-2xl flex flex-col max-h-[32rem] z-50 bg-white border" style={{ borderColor: 'var(--border-light)' }}>
          {/* Header */}
          <div
            className="p-4 text-white rounded-t-lg font-bold text-lg"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Help & Support
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* FAQ Section */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Quick Tips
              </h3>
              <ul className="space-y-2">
                {[
                  'View leads in table or Kanban view',
                  'Search leads by name or company',
                  'Filter by UTM source or stage',
                  'Click any lead to view details',
                  'Import leads from CSV file',
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: 'var(--accent)' }}>→</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Section */}
            <div className="pt-4 border-t" style={{ borderTopColor: 'var(--border-light)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Need help?
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                📞 Call us at <span className="font-semibold" style={{ color: 'var(--primary)' }}>1-800-CRM-DEMO</span>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                📧 Email: <span className="font-semibold" style={{ color: 'var(--primary)' }}>support@crmdemo.com</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end" style={{ borderTopColor: 'var(--border-light)' }}>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-ghost"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
