'use client';

import { useState, useEffect } from 'react';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await fetch('/api/init-company');
      } catch (error) {
        console.error('Auto-init company tables:', error);
      }
    };
    initializeDatabase();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <TopNavigation onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}
        {sidebarCollapsed && (
          <div className="w-16 bg-white border-r flex items-start justify-center pt-4" style={{ borderRightColor: 'var(--border-light)' }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hover:opacity-80 transition-opacity p-2"
              title="Expand sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }} />
              </svg>
            </button>
          </div>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
