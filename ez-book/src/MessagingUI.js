import { useState, useEffect, useRef } from 'react';
import './MessagingUI.css';

import {
  getConversations,
  getMessages,
  sendMessage
} from './Messages.service.js';

function MessagingUI({initialConvId}) {

  // ─────────────────────────────
  // State
  // ─────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const bubblesEndRef = useRef(null);

  // Current logged in user
  const user = JSON.parse(localStorage.getItem('user'));

  // ─────────────────────────────
  // Load conversations
  // ─────────────────────────────
 useEffect(() => {
    if (!user?.user_id) return;

    async function loadConversations() {
        try {
            const data = await getConversations(user.user_id);
            const convs = data.conversations || [];
            setConversations(convs);                    // ← move setConversations here

            const target = initialConvId
                ? convs.find(c => c.id === initialConvId)
                : convs[0];

            if (target) setSelectedConv(target);

        } catch (err) {
            console.error(err);
        }
    }

    loadConversations();
}, []);  // keep deps array empty

  // ─────────────────────────────
  // Load messages for conversation
  // ─────────────────────────────
  useEffect(() => {

    async function loadMessages() {

      if (!selectedConv) return;

      try {

        const data = await getMessages(selectedConv.id);

        setMessages(data.messages || []);

      } catch (err) {
        console.error(err);
      }
    }

    loadMessages();

  }, [selectedConv]);

  // ─────────────────────────────
  // Poll messages every 3 seconds
  // ─────────────────────────────
  useEffect(() => {

    if (!selectedConv) return;

    const interval = setInterval(async () => {

      try {

        const data = await getMessages(selectedConv.id);

        setMessages(data.messages || []);

      } catch (err) {
        console.error(err);
      }

    }, 3000);

    return () => clearInterval(interval);

  }, [selectedConv]);

  // ─────────────────────────────
  // Auto scroll to bottom
  // ─────────────────────────────
  useEffect(() => {

    bubblesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages]);

  // ─────────────────────────────
  // Send message
  // ─────────────────────────────
  const handleSend = async () => {

    const txt = input.trim();

    if (!txt || !selectedConv) return;

    try {

      const data = await sendMessage({
        ConversationID: selectedConv.id,
        SenderID: user.user_id,
        txt
      });

      setMessages(prev => [
        ...prev,
        data.message
      ]);

      setInput('');

    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────
  // Enter key send
  // ─────────────────────────────
  const handleKeyDown = (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      handleSend();
    }
  };

  // Current messages
  const currentMessages = messages;

  return (
  <div className="msg-layout">

    {/* ───────────────── Sidebar ───────────────── */}
    <aside className="msg-sidebar">

      <div className="msg-sidebar-header">
        <h3 className="msg-sidebar-title">
          Messages
        </h3>
      </div>

      <div className="msg-conv-list">

        {conversations.map((conv) => (

          <button
            key={conv.id}
            className={`msg-conv-item${
              selectedConv?.id === conv.id
                ? ' active'
                : ''
            }`}
            onClick={() => setSelectedConv(conv)}
          >

            <div className="msg-conv-avatar">
              {(conv.clientId?.[0] || 'U').toUpperCase()}
            </div>

            <div className="msg-conv-info">

              <div className="msg-conv-name">
                Conversation
              </div>

              <div className="msg-conv-preview">
                Booking Chat
              </div>

            </div>

            <div className="msg-conv-meta">

              <span className="msg-conv-time">
                Active
              </span>

            </div>

          </button>

        ))}

      </div>

    </aside>

    {/* ───────────────── Main Chat ───────────────── */}
    <div className="msg-main">

      {selectedConv ? (

        <>

          {/* Header */}
          <header className="msg-header">

            <div className="msg-header-avatar">
              {(selectedConv.clientId?.[0] || 'U').toUpperCase()}
            </div>

            <span className="msg-header-name">
              Conversation
            </span>

          </header>

          {/* Messages */}
          <div className="msg-bubbles">

            {currentMessages.map((msg) => {

              const isSent =
                msg.SenderId === user.user_id;

              return (

                <div
                  key={msg.id}
                  className={`msg-bubble-row${
                    isSent
                      ? ' msg-bubble-row--sent'
                      : ''
                  }`}
                >

                  <div
                    className={`msg-bubble${
                      isSent
                        ? ' msg-bubble--sent'
                        : ' msg-bubble--received'
                    }`}
                  >
                    {msg.txt}
                  </div>

                  <span className="msg-bubble-time">

                    {
                      new Date(msg.timestamp)
                        .toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                    }

                  </span>

                </div>

              );
            })}

            <div ref={bubblesEndRef} />

          </div>

          {/* Input */}
          <div className="msg-input-row">

            <textarea
              className="msg-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
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

          <p>
            Select a conversation.
          </p>

        </div>

      )}

    </div>

  </div>
);
}
export default MessagingUI;
