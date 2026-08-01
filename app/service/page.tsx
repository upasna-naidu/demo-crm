'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  assignedToName: string | null;
}

export default function ServiceHub() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('open');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
  });

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/tickets' : `/api/tickets?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject) {
      alert('Subject is required');
      return;
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      if (res.ok) {
        setNewTicket({ subject: '', description: '', priority: 'medium', category: '' });
        setShowNewTicket(false);
        loadTickets();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'var(--primary)';
      case 'pending':
        return '#ff9800';
      case 'resolved':
        return '#4caf50';
      default:
        return 'var(--text-tertiary)';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ff5252';
      case 'high':
        return '#ff6f00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#81c784';
      default:
        return 'var(--bg-secondary)';
    }
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  if (loading && !showNewTicket) {
    return <div style={{ padding: '20px' }}>Loading Service Hub...</div>;
  }

  return (
    <div style={{ padding: '24px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 700 }}>
            🎧 Service Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Support tickets and customer success management
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Open
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
              {openCount}
            </p>
          </div>

          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Pending
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#ff9800' }}>
              {pendingCount}
            </p>
          </div>

          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Resolved
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
              {resolvedCount}
            </p>
          </div>

          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Total
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
              {tickets.length}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowNewTicket(!showNewTicket)}
            style={{
              padding: '10px 16px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            ➕ New Ticket
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'open', 'pending', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 16px',
                  background: filter === f ? 'var(--primary)' : 'white',
                  color: filter === f ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Subject</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                    {ticket.ticketId}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{ticket.subject}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        background: getStatusColor(ticket.status),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        background: getPriorityBg(ticket.priority),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tickets.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No tickets found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
