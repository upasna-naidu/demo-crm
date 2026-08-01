'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LoginModal from './LoginModal';
import CompanySwitcher from './CompanySwitcher';

export default function TopNavigation({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const modules = [
    { name: 'Contacts', href: '/contacts', icon: '👤' },
    { name: 'Multi-Channel Inbound', href: '/conversations', icon: '💬' },
    { name: 'Marketing Hub', href: '/marketing', icon: '📧' },
    { name: 'Sales', href: '/sales', icon: '📊', active: pathname.startsWith('/leads') },
    { name: 'Service', href: '/service', icon: '🎫' },
    { name: 'Automation', href: '/automation', icon: '⚡' },
    { name: 'Reports', href: '/reports', icon: '📈' },
  ];

  const isActive = (href: string) => {
    if (href === '/contacts') return pathname.startsWith('/contacts') || pathname.startsWith('/leads');
    if (href === '/sales') return pathname.startsWith('/sales');
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="h-14 bg-white border-b flex items-center justify-between" style={{ borderBottomColor: 'var(--border-light)', padding: '0 30px 0 0' }}>
        {/* Logo / Sidebar Toggle */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-2 flex-shrink-0 px-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: 'var(--primary)' }}>
              CR
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>CRM</span>
          </button>

          {/* Company Switcher */}
          {isLoggedIn && <CompanySwitcher />}

          {/* Main Modules */}
          <div className="flex gap-8 px-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className={`flex items-center gap-2 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive(module.href)
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={
                  isActive(module.href)
                    ? { borderBottomColor: 'var(--primary)', borderBottom: '3px solid var(--primary)' }
                    : {}
                }
              >
                <span className="text-sm">{module.icon}</span>
                <span>{module.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-6 px-6">
          <button className="text-gray-600 hover:text-gray-900 transition-colors text-sm">🔍</button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors text-sm">❓</button>

          {isLoggedIn && (
            <Link href="/admin/companies" className="text-gray-600 hover:text-gray-900 transition-colors text-sm" title="Companies Admin">
              ⚙️
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium">{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="text-xs font-medium px-3 py-1.5 border rounded hover:bg-red-50 transition-colors text-red-600"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs font-medium px-4 py-2 rounded text-white transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
