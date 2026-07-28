'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-white border-b p-6" style={{ borderBottomColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Manage users, organizations, and system settings</p>
          </div>
          <Link href="/contacts" className="btn btn-secondary">← Back to CRM</Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0" style={{ borderBottomColor: 'var(--border-light)' }}>
        <div className="flex gap-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'organizations', label: 'Organizations', icon: '🏢' },
            { id: 'roles', label: 'Roles & Permissions', icon: '🔐' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === tab.id ? 'border-b-2' : 'border-b-2 border-transparent text-gray-600'
              }`}
              style={
                activeTab === tab.id
                  ? { borderBottomColor: 'var(--primary)', color: 'var(--primary)' }
                  : {}
              }
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'organizations' && <OrganizationsSection />}
        {activeTab === 'roles' && <RolesSection />}
        {activeTab === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
}

function OverviewSection() {
  const stats = [
    { label: 'Total Users', value: '12', icon: '👥' },
    { label: 'Active Organizations', value: '3', icon: '🏢' },
    { label: 'Total Leads', value: '245', icon: '📋' },
    { label: 'System Health', value: '99.8%', icon: '✅' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link href="/admin/users/new" className="btn btn-primary">+ Add New User</Link>
          <Link href="/admin/organizations/new" className="btn btn-primary">+ Add Organization</Link>
          <button className="btn btn-secondary">View System Logs</button>
          <button className="btn btn-secondary">Export Analytics</button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'User created', detail: 'john.doe@company.com', time: '2 hours ago' },
            { action: 'Organization added', detail: 'Acme Corp', time: '5 hours ago' },
            { action: 'Role updated', detail: 'Sales Admin permissions changed', time: '1 day ago' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b" style={{ borderBottomColor: 'var(--border-light)' }}>
              <div>
                <p className="font-medium text-sm">{item.action}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.detail}</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  const [users] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Super Admin', org: 'Acme Corp', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@acme.com', role: 'Admin', org: 'Acme Corp', status: 'Active' },
    { id: 3, name: 'Carol Davis', email: 'carol@techstartup.com', role: 'Sales Manager', org: 'Tech Startup', status: 'Active' },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Management</h2>
        <Link href="/admin/users/new" className="btn btn-primary">+ Add New User</Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="text-left p-4 font-bold text-sm">Name</th>
                <th className="text-left p-4 font-bold text-sm">Email</th>
                <th className="text-left p-4 font-bold text-sm">Role</th>
                <th className="text-left p-4 font-bold text-sm">Organization</th>
                <th className="text-left p-4 font-bold text-sm">Status</th>
                <th className="text-left p-4 font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-50" style={{ borderTopColor: 'var(--border-light)' }}>
                  <td className="p-4 font-medium text-sm">{user.name}</td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4 text-sm">
                    <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(123, 67, 151, 0.1)', color: 'var(--accent)' }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{user.org}</td>
                  <td className="p-4 text-sm">
                    <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <button className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button className="text-red-600 hover:underline">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrganizationsSection() {
  const [orgs] = useState([
    { id: 1, name: 'Acme Corp', email: 'admin@acme.com', users: 5, plan: 'Enterprise', status: 'Active' },
    { id: 2, name: 'Tech Startup', email: 'contact@techstartup.com', users: 3, plan: 'Professional', status: 'Active' },
    { id: 3, name: 'Global Solutions', email: 'info@globalsolutions.com', users: 2, plan: 'Starter', status: 'Trial' },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Organizations</h2>
        <Link href="/admin/organizations/new" className="btn btn-primary">+ Add Organization</Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="text-left p-4 font-bold text-sm">Organization</th>
                <th className="text-left p-4 font-bold text-sm">Contact Email</th>
                <th className="text-left p-4 font-bold text-sm">Users</th>
                <th className="text-left p-4 font-bold text-sm">Plan</th>
                <th className="text-left p-4 font-bold text-sm">Status</th>
                <th className="text-left p-4 font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} className="border-t hover:bg-gray-50" style={{ borderTopColor: 'var(--border-light)' }}>
                  <td className="p-4 font-medium text-sm">{org.name}</td>
                  <td className="p-4 text-sm">{org.email}</td>
                  <td className="p-4 text-sm font-bold">{org.users}</td>
                  <td className="p-4 text-sm">{org.plan}</td>
                  <td className="p-4 text-sm">
                    <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <button className="text-blue-600 hover:underline mr-3">Manage</button>
                    <button className="text-red-600 hover:underline">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RolesSection() {
  const roles = [
    { name: 'Super Admin', desc: 'Full system access', permissions: ['Read', 'Write', 'Delete', 'Manage Users', 'Manage Orgs'] },
    { name: 'Admin', desc: 'Organization admin', permissions: ['Read', 'Write', 'Delete', 'Manage Users'] },
    { name: 'Sales Manager', desc: 'Sales team lead', permissions: ['Read', 'Write', 'Export'] },
    { name: 'Sales Rep', desc: 'Individual contributor', permissions: ['Read', 'Write'] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Roles & Permissions</h2>
        <button className="btn btn-primary">+ Create Role</button>
      </div>

      <div className="grid gap-4">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{role.name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{role.desc}</p>
              </div>
              <button className="text-blue-600 hover:underline">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((perm, pidx) => (
                <span key={pidx} className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="font-bold text-lg mb-4">System Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Platform Name</label>
            <input type="text" defaultValue="CRM Pro" className="w-full mt-2 p-2 border rounded" style={{ borderColor: 'var(--border-light)' }} />
          </div>
          <div>
            <label className="text-sm font-medium">Support Email</label>
            <input type="email" defaultValue="support@crmplatform.com" className="w-full mt-2 p-2 border rounded" style={{ borderColor: 'var(--border-light)' }} />
          </div>
          <div>
            <label className="text-sm font-medium">Max Organizations</label>
            <input type="number" defaultValue="100" className="w-full mt-2 p-2 border rounded" style={{ borderColor: 'var(--border-light)' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="font-bold text-lg mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Two-Factor Authentication</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">IP Whitelist</span>
            <input type="checkbox" className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Audit Logging</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-full">Save Settings</button>
    </div>
  );
}
