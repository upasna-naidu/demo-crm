'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleName: string;
  isAdmin: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function CompanyDashboardPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  // Get company ID from localStorage or URL
  useEffect(() => {
    const cid = localStorage.getItem('companyId') || 'default';
    setCompanyId(cid);
    fetchTeamMembers(cid);
    fetchRoles();
  }, []);

  const fetchTeamMembers = async (cid: string) => {
    try {
      const response = await fetch(`/api/organizations/${cid}/team`);
      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName || !inviteRole) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${companyId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          roleId: inviteRole,
        }),
      });

      if (response.ok) {
        alert('User invited successfully!');
        setInviteEmail('');
        setInviteName('');
        setInviteRole('');
        fetchTeamMembers(companyId);
      } else {
        alert('Failed to invite user');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const handleChangeRole = async (userId: string, newRoleId: string) => {
    try {
      const response = await fetch(`/api/organizations/${companyId}/team/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      });

      if (response.ok) {
        alert('Role updated successfully!');
        fetchTeamMembers(companyId);
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      const response = await fetch(`/api/organizations/${companyId}/team/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('User removed successfully!');
        fetchTeamMembers(companyId);
      } else {
        alert('Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Organization Dashboard</h1>
      <p>Welcome to your organization admin panel. Manage your team, configure webhooks, and set up automations.</p>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Team Members</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{teamMembers.length}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Webhooks</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>0</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
            <Link href="/company/webhooks">Configure</Link>
          </p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Automations</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>0</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
            <Link href="/automations">Configure</Link>
          </p>
        </div>
      </div>

      {/* Team Management Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Team Members</h2>

        {/* Invite Form */}
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Invite New Member</h3>
          <form onSubmit={handleInviteUser} style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px' }}>
              <input
                type="text"
                placeholder="Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">Select Role</option>
                {roles
                  .filter((r) => r.id !== 'super_admin')
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Invite
              </button>
            </div>
          </form>
        </div>

        {/* Team Members Table */}
        {loading ? (
          <p>Loading team members...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #ddd',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Admin</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{member.name}</td>
                    <td style={{ padding: '12px' }}>{member.email}</td>
                    <td style={{ padding: '12px' }}>
                      {selectedMember === member.id ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          style={{
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                          }}
                        >
                          {roles
                            .filter((r) => r.id !== 'super_admin')
                            .map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name.replace(/_/g, ' ').toUpperCase()}
                              </option>
                            ))}
                        </select>
                      ) : (
                        member.roleName.replace(/_/g, ' ').toUpperCase()
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{member.isAdmin ? '✓' : '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {selectedMember === member.id ? (
                        <>
                          <button
                            onClick={() => handleChangeRole(member.id, selectedRole)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '8px',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedMember(null)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#999',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedMember(member.id);
                              setSelectedRole(member.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '8px',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveUser(member.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginTop: '40px' }}>
        <h3>Next Steps</h3>
        <ul>
          <li>✓ Team Management - Complete!</li>
          <li>
            → <Link href="/company/webhooks">Setup Webhooks</Link> to receive leads from your website
          </li>
          <li>
            → <Link href="/automations">Create Automations</Link> to process leads automatically
          </li>
        </ul>
      </div>
    </div>
  );
}
