'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { spacing, typography, borderRadius, shadows } from '@/lib/design-system';

interface ConversationMessage {
  id: string;
  conversationId: string;
  senderType: 'customer' | 'agent';
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  leadId: string;
  channel: 'sms' | 'whatsapp' | 'voice';
  status: 'open' | 'closed';
  assignedTo: string | null;
  isRead: number;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: string;
  leadName: string;
  leadEmail: string;
}

const channelIcons = {
  sms: '💬',
  whatsapp: '📱',
  voice: '🎙️',
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'sms' | 'whatsapp' | 'voice'>('all');
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure conversations are set up on mount
  useEffect(() => {
    const ensureSetup = async () => {
      try {
        console.log('Checking if conversations need setup...');
        const setupRes = await fetch(`/api/setup-conversations`);
        const setupData = await setupRes.json();
        console.log('Setup result:', setupData);
      } catch (error) {
        console.error('Setup check failed:', error);
      }
    };

    ensureSetup();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('channel', filter);
        if (status !== 'all') params.append('status', status);
        if (search) params.append('search', search);

        const res = await fetch(`/api/conversations?${params.toString()}`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchConversations, 300);
    return () => clearTimeout(timer);
  }, [filter, status, search]);

  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedConv.id}`);
        const data = await res.json();
        if (data.conversation) {
          setSelectedConv(data.conversation);
          setMessages(data.messages || []);
        } else if (data.error) {
          console.error('API error:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConv?.id]);

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedConv) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText, senderName: 'You' }),
      });

      if (res.ok) {
        const messRes = await fetch(`/api/conversations/${selectedConv.id}`);
        const messData = await messRes.json();
        setMessages(messData.messages || []);
        setSelectedConv(messData.conversation);
        setReplyText('');

        const convRes = await fetch(
          `/api/conversations?${new URLSearchParams({
            ...(filter !== 'all' && { channel: filter }),
            ...(status !== 'all' && { status }),
          }).toString()}`
        );
        const convData = await convRes.json();
        setConversations(convData.conversations || []);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    if (!selectedConv) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSelectedConv({ ...selectedConv, status: newStatus });
        setConversations(
          conversations.map(c =>
            c.id === selectedConv.id ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter !== 'all' && conv.channel !== filter) return false;
    if (status !== 'all' && conv.status !== status) return false;
    return true;
  });

  const unreadCount = conversations.filter(c => !c.isRead).length;
  const openCount = conversations.filter(c => c.status === 'open').length;

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Left Sidebar */}
      <div
        className="w-72 border-r overflow-y-auto"
        style={{
          borderColor: 'var(--border-light)',
          backgroundColor: 'white',
        }}
      >
        {/* Header Section */}
        <div
          className="border-b"
          style={{
            borderColor: 'var(--border-light)',
            padding: `${spacing['2xl']} ${spacing['2xl']} ${spacing.xl} ${spacing['2xl']}`,
          }}
        >
          <h1
            className="mb-2 font-bold"
            style={{
              fontSize: typography.pageTitle.fontSize,
              fontWeight: typography.pageTitle.fontWeight,
              lineHeight: typography.pageTitle.lineHeight,
              color: 'var(--primary)',
            }}
          >
            🔔 Inbox
          </h1>

          {/* Search */}
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              border: `1px solid var(--border-light)`,
              borderRadius: borderRadius.lg,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              marginTop: spacing.xl,
            }}
          />

          {/* Stats */}
          <div
            style={{
              marginTop: spacing.xl,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.sm,
            }}
          >
            {[
              { label: 'All conversations', value: conversations.length },
              { label: 'Unread', value: unreadCount, isAlert: true },
              { label: 'Open', value: openCount },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: borderRadius.lg,
                }}
              >
                <span
                  style={{
                    fontSize: typography.body.fontSize,
                    color: 'var(--text-tertiary)',
                    fontWeight: '500',
                  }}
                >
                  {stat.label}
                </span>
                <span
                  style={{
                    fontSize: typography.cardTitle.fontSize,
                    fontWeight: typography.cardTitle.fontWeight,
                    color: stat.isAlert ? '#dc2626' : 'var(--primary)',
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Filters */}
        <div
          style={{
            borderBottom: `1px solid var(--border-light)`,
            padding: `${spacing.lg} ${spacing['2xl']}`,
          }}
        >
          <p
            style={{
              fontSize: typography.caption.fontSize,
              fontWeight: typography.caption.fontWeight,
              color: 'var(--text-tertiary)',
              marginBottom: spacing.lg,
              textTransform: 'uppercase',
            }}
          >
            Channels
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {(['all', 'sms', 'whatsapp', 'voice'] as const).map(channel => (
              <button
                key={channel}
                onClick={() => setFilter(channel)}
                style={{
                  width: '100%',
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.body.fontSize,
                  fontWeight: '600',
                  transition: 'all 200ms ease-in-out',
                  backgroundColor:
                    filter === channel ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: filter === channel ? 'white' : 'var(--text-tertiary)',
                }}
              >
                {channel === 'all' && '📊 All Channels'}
                {channel === 'sms' && '💬 SMS/Text'}
                {channel === 'whatsapp' && '📱 WhatsApp'}
                {channel === 'voice' && '🎙️ Voice Notes'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div style={{ padding: `${spacing.lg} ${spacing['2xl']}` }}>
          <p
            style={{
              fontSize: typography.caption.fontSize,
              fontWeight: typography.caption.fontWeight,
              color: 'var(--text-tertiary)',
              marginBottom: spacing.lg,
              textTransform: 'uppercase',
            }}
          >
            Status
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {(['all', 'open', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  width: '100%',
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.body.fontSize,
                  fontWeight: '600',
                  transition: 'all 200ms ease-in-out',
                  backgroundColor:
                    status === s ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: status === s ? 'white' : 'var(--text-tertiary)',
                }}
              >
                {s === 'all' && '🔄 All Status'}
                {s === 'open' && '🟢 Open'}
                {s === 'closed' && '🔴 Closed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - Conversation List */}
      <div
        className="border-r overflow-y-auto"
        style={{
          flex: '0 0 380px',
          borderColor: 'var(--border-light)',
          backgroundColor: 'white',
        }}
      >
        {isLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ color: 'var(--text-tertiary)', fontSize: typography.body.fontSize }}>
              Loading conversations...
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: '48px', marginBottom: spacing.lg }}>📭</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: typography.body.fontSize }}>
                No conversations yet
              </p>
            </div>
          </div>
        ) : (
          <div style={{ borderTop: `1px solid var(--border-light)` }}>
            {filteredConversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  width: '100%',
                  padding: `${spacing.lg} ${spacing['2xl']}`,
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: `1px solid var(--border-light)`,
                  borderLeft: selectedConv?.id === conv.id ? `4px solid var(--primary)` : 'none',
                  paddingLeft:
                    selectedConv?.id === conv.id
                      ? `calc(${spacing['2xl']} - 4px)`
                      : spacing['2xl'],
                  backgroundColor:
                    selectedConv?.id === conv.id ? 'var(--bg-secondary)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-in-out',
                }}
                onMouseEnter={e => {
                  if (selectedConv?.id !== conv.id) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'rgba(0,0,0,0.02)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedConv?.id !== conv.id) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'white';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: spacing.md,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <span style={{ fontSize: '20px' }}>
                      {channelIcons[conv.channel]}
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: typography.cardTitle.fontSize,
                          fontWeight: typography.cardTitle.fontWeight,
                          color: 'var(--primary)',
                          lineHeight: typography.cardTitle.lineHeight,
                        }}
                      >
                        {conv.leadName}
                      </p>
                      <p
                        style={{
                          fontSize: typography.small.fontSize,
                          color: 'var(--text-tertiary)',
                          lineHeight: typography.small.lineHeight,
                          marginTop: '2px',
                        }}
                      >
                        {conv.leadEmail}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {!conv.isRead && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          marginBottom: spacing.sm,
                        }}
                      ></span>
                    )}
                    <p
                      style={{
                        fontSize: typography.small.fontSize,
                        color: 'var(--text-tertiary)',
                        lineHeight: typography.small.lineHeight,
                      }}
                    >
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: typography.body.fontSize,
                    color: 'var(--text-tertiary)',
                    lineHeight: typography.body.lineHeight,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: spacing.md,
                  }}
                >
                  {conv.lastMessage}
                </p>
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-tertiary)',
                      borderRadius: borderRadius.md,
                      fontSize: typography.caption.fontSize,
                      fontWeight: '600',
                    }}
                  >
                    {conv.channel.toUpperCase()}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor:
                        conv.status === 'open' ? 'rgb(220, 252, 231)' : 'rgb(243, 232, 255)',
                      color:
                        conv.status === 'open'
                          ? 'rgb(22, 101, 52)'
                          : 'rgb(88, 28, 135)',
                      borderRadius: borderRadius.md,
                      fontSize: typography.caption.fontSize,
                      fontWeight: '600',
                    }}
                  >
                    {conv.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Message Thread */}
      {selectedConv ? (
        <div className="flex flex-col" style={{ flex: '1', backgroundColor: 'white' }}>
          {/* Header */}
          <div
            style={{
              padding: `${spacing['2xl']} ${spacing['3xl']}`,
              borderBottom: `1px solid var(--border-light)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: spacing.xl,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md }}>
                  <span style={{ fontSize: '28px' }}>
                    {channelIcons[selectedConv.channel]}
                  </span>
                  <div>
                    <h2
                      style={{
                        fontSize: typography.sectionTitle.fontSize,
                        fontWeight: typography.sectionTitle.fontWeight,
                        lineHeight: typography.sectionTitle.lineHeight,
                        color: 'var(--primary)',
                      }}
                    >
                      {selectedConv.leadName}
                    </h2>
                    <p
                      style={{
                        fontSize: typography.body.fontSize,
                        color: 'var(--text-tertiary)',
                        lineHeight: typography.body.lineHeight,
                      }}
                    >
                      {selectedConv.leadEmail} • {selectedConv.channel.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href={`/leads/${selectedConv.leadId}`}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--primary)',
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                  textDecoration: 'none',
                  transition: 'all 150ms ease-in-out',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                View Lead
              </Link>
            </div>

            {/* Status & Actions */}
            <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
              <select
                value={selectedConv.status}
                onChange={e =>
                  handleStatusChange(e.target.value as 'open' | 'closed')
                }
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  border: `1px solid var(--border-light)`,
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                  cursor: 'pointer',
                }}
              >
                <option value="open">🟢 Open</option>
                <option value="closed">🔴 Closed</option>
              </select>
              <button
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                  cursor: 'pointer',
                  transition: 'all 150ms ease-in-out',
                }}
              >
                📌 Assign
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              padding: `${spacing['3xl']}`,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p style={{ color: 'var(--text-tertiary)', fontSize: typography.body.fontSize }}>
                  No messages yet
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      msg.senderType === 'agent' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '60%',
                      padding: `${spacing.lg} ${spacing.xl}`,
                      borderRadius: borderRadius.xl,
                      backgroundColor:
                        msg.senderType === 'agent'
                          ? 'var(--primary)'
                          : 'var(--bg-secondary)',
                      color:
                        msg.senderType === 'agent'
                          ? 'white'
                          : 'var(--primary)',
                    }}
                  >
                    {msg.senderName && (
                      <p
                        style={{
                          fontSize: typography.caption.fontSize,
                          fontWeight: '600',
                          marginBottom: spacing.sm,
                          opacity: 0.75,
                        }}
                      >
                        {msg.senderName}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: typography.body.fontSize,
                        lineHeight: typography.body.lineHeight,
                      }}
                    >
                      {msg.message}
                    </p>
                    <p
                      style={{
                        fontSize: typography.small.fontSize,
                        marginTop: spacing.md,
                        opacity: 0.6,
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div
            style={{
              padding: `${spacing['2xl']} ${spacing['3xl']}`,
              borderTop: `1px solid var(--border-light)`,
            }}
          >
            <div style={{ display: 'flex', gap: spacing.lg }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                style={{
                  flex: 1,
                  padding: `${spacing.lg} ${spacing.xl}`,
                  border: `1px solid var(--border-light)`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.fontSize,
                  lineHeight: typography.body.lineHeight,
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !replyText.trim()}
                style={{
                  padding: `${spacing.xl} ${spacing['2xl']}`,
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                  cursor: isSending || !replyText.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms ease-in-out',
                  opacity: isSending || !replyText.trim() ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                {isSending ? '⏳' : '📤'}
                <div style={{ fontSize: typography.caption.fontSize }}>Send</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '56px', marginBottom: spacing.xl }}>💬</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: typography.body.fontSize }}>
              Select a conversation to view messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
