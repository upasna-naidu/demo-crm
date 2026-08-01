'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Contacts', href: '/contacts' },
    { label: 'Marketing', href: '/marketing' },
    { label: 'Sales', href: '/sales' },
    { label: 'Operations', href: '/operations' },
    { label: 'Service', href: '/service' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Content', href: '/content' },
    { label: 'Commerce', href: '/commerce' },
    { label: 'Automation', href: '/automation' },
    { label: 'Reports', href: '/reports' },
    { label: 'Development', href: '/development' },
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex flex-col transition-all duration-200 border-r`} style={{ backgroundColor: 'var(--primary)', borderRightColor: 'rgba(0,0,0,0.2)' }}>
      {/* Collapse Toggle */}
      {!collapsed && (
        <div className="px-4 py-3 flex justify-end">
          <button
            onClick={() => setCollapsed && setCollapsed(true)}
            className="hover:opacity-80 transition-opacity"
            title="Collapse sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }} />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-4 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">Alice Chen</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavLink({
  href,
  label,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 text-sm font-medium transition-all duration-200 rounded ${
        active ? 'scale-110' : 'hover:scale-105 hover:ml-2'
      }`}
      style={{
        color: 'white',
        transformOrigin: 'left center',
        paddingTop: '16px',
        paddingBottom: '16px',
        marginBottom: '2px'
      }}
      title={collapsed ? label : ''}
    >
      {!collapsed && <span>{label}</span>}
      {collapsed && <span className="text-center block">{label.charAt(0)}</span>}
    </Link>
  );
}
