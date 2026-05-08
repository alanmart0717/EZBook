import { useState, useEffect, useRef } from 'react';
import './MessagingUI.css';

const DEMO_CONVERSATIONS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'S',
    lastMessage: 'See you tomorrow at 2pm!',
    time: '2:30 PM',
    unread: 1,
  },
  {
    id: 2,
    name: "Mike's Barbershop",
    avatar: 'M',
    lastMessage: 'Your appointment is confirmed.',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 3,
    name: 'Wellness Studio',
    avatar: 'W',
    lastMessage: 'We look forward to seeing you!',
    time: 'Mon',
    unread: 0,
  },
];

const DEMO_MESSAGES = {
  1: [
    { id: 1, text: 'Hi, I have a booking for tomorrow.', sent: false, time: '2:15 PM' },
    { id: 2, text: 'Great! Your appointment is confirmed for 2pm.', sent: true, time: '2:20 PM' },
    { id: 3, text: 'See you tomorrow at 2pm!', sent: false, time: '2:30 PM' },
  ],
  2: [
    { id: 1, text: 'Hello, I booked a haircut for Friday.', sent: true, time: 'Yesterday' },
    { id: 2, text: 'Your appointment is confirmed.', sent: false, time: 'Yesterday' },
  ],
  3: [
    { id: 1, text: 'Looking forward to the massage session!', sent: true, time: 'Mon' },
    { id: 2, text: 'We look forward to seeing you!', sent: false, time: 'Mon' },
  ],
};

function MessagingUI() {
  const [selectedConv, setSelectedConv] = useState(DEMO_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const bubblesEndRef = useRef(null);

  // Scroll to bottom whenever the active conversation's messages change
  useEffect(() => {
    bubblesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConv]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedConv) return;

    const newMsg = {
      id: Date.now(),
      text,
      sent: true,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg],
    }));

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = messages[selectedConv?.id] || [];

  return (
    <div className="msg-layout">
      {/* ── Conversation list ── */}
      <aside className="msg-sidebar">
        <div className="msg-sidebar-header">
          <h3 className="msg-sidebar-title">Messages</h3>
        </div>

        <div className="msg-conv-list">
          {DEMO_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              className={`msg-conv-item${selectedConv?.id === conv.id ? ' active' : ''}`}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="msg-conv-avatar">{conv.avatar}</div>

              <div className="msg-conv-info">
                <div className="msg-conv-name">{conv.name}</div>
                <div className="msg-conv-preview">{conv.lastMessage}</div>
              </div>

              <div className="msg-conv-meta">
                <span className="msg-conv-time">{conv.time}</span>
                {conv.unread > 0 && (
                  <span className="msg-conv-badge">{conv.unread}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Message area ── */}
      <div className="msg-main">
        {selectedConv ? (
          <>
            <header className="msg-header">
              <div className="msg-header-avatar">{selectedConv.avatar}</div>
              <span className="msg-header-name">{selectedConv.name}</span>
            </header>

            <div className="msg-bubbles">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg-bubble-row${msg.sent ? ' msg-bubble-row--sent' : ''}`}
                >
                  <div className={`msg-bubble${msg.sent ? ' msg-bubble--sent' : ' msg-bubble--received'}`}>
                    {msg.text}
                  </div>
                  <span className="msg-bubble-time">{msg.time}</span>
                </div>
              ))}
              <div ref={bubblesEndRef} />
            </div>

            <div className="msg-input-row">
              <textarea
                className="msg-input"
                placeholder="Type a message… (Enter to send)"
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
            <p>Select a conversation to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagingUI;
