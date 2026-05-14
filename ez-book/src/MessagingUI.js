import { useState, useEffect, useRef } from 'react';
import './MessagingUI.css';
import {
  getConversationsForUser,
  getConversationMessages,
  sendLocalMessage,
} from './LocalMessagingStore';

// currentUserId must be passed from the parent so the correct identity is used
// even when two accounts share the same browser (second login overwrites localStorage).
function MessagingUI({ initialConvId, currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bubblesEndRef = useRef(null);

  const userId = String(currentUserId ?? JSON.parse(localStorage.getItem('user'))?.user_id ?? '');

  const getOtherName = (conv) => {
    if (!conv) return 'Chat';
    const isProvider = userId === String(conv.ProviderID);
    return isProvider ? (conv.clientName ?? 'Client') : (conv.providerName ?? 'Provider');
  };

  // Returns the label to show above the first message of each new day.
  // Within 7 days: "Today" / "Yesterday" / day name. Older: full date.
  const formatDateSep = (timestamp) => {
    const d = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    if (!userId) return;
    const convs = getConversationsForUser(userId);
    setConversations(convs);
    const target = initialConvId ? convs.find(c => c.id === initialConvId) : convs[0];
    if (target) setSelectedConv(target);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedConv) return;
    setMessages(getConversationMessages(selectedConv.id));
  }, [selectedConv]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!userId) return;
      setConversations(getConversationsForUser(userId));
      if (selectedConv) setMessages(getConversationMessages(selectedConv.id));
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConv]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bubblesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt || !selectedConv) return;
    const msg = sendLocalMessage(selectedConv.id, userId, txt);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="msg-layout">

      {/* ───────────────── Sidebar ───────────────── */}
      <aside className="msg-sidebar">
        <div className="msg-sidebar-header">
          <h3 className="msg-sidebar-title">Messages</h3>
        </div>

        <div className="msg-conv-list">
          {conversations.length === 0 ? (
            <p style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No conversations yet.
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`msg-conv-item${selectedConv?.id === conv.id ? ' active' : ''}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="msg-conv-avatar">
                  {(getOtherName(conv)?.[0] || 'C').toUpperCase()}
                </div>
                <div className="msg-conv-info">
                  <div className="msg-conv-name">{getOtherName(conv)}</div>
                  <div className="msg-conv-preview">Booking Chat</div>
                </div>
                <div className="msg-conv-meta">
                  <span className="msg-conv-time">Active</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ───────────────── Main Chat ───────────────── */}
      <div className="msg-main">
        {selectedConv ? (
          <>
            <header className="msg-header">
              <div className="msg-header-avatar">
                {(getOtherName(selectedConv)?.[0] || 'C').toUpperCase()}
              </div>
              <span className="msg-header-name">{getOtherName(selectedConv)}</span>
            </header>

            <div className="msg-bubbles">
              {messages.map((msg, index) => {
                const isSent = String(msg.SenderID) === userId;

                // Show a date separator when the day changes between messages
                const msgDateStr = new Date(msg.timestamp).toDateString();
                const prevDateStr = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
                const showSep = msgDateStr !== prevDateStr;

                return (
                  <div key={msg.id}>
                    {showSep && (
                      <div className="msg-date-sep">{formatDateSep(msg.timestamp)}</div>
                    )}
                    <div className={`msg-bubble-row${isSent ? ' msg-bubble-row--sent' : ''}`}>
                      <div className={`msg-bubble${isSent ? ' msg-bubble--sent' : ' msg-bubble--received'}`}>
                        {msg.txt}
                      </div>
                      <span className="msg-bubble-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bubblesEndRef} />
            </div>

            <div className="msg-input-row">
              <textarea
                className="msg-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="btn-primary msg-send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="msg-empty">
            <span>💬</span>
            <p>Select a conversation.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default MessagingUI;
