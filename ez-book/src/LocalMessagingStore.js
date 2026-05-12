// localStorage-backed store — shared across all browser tabs on the same origin.
// The 2-second poll in MessagingUI reads from here, so both sides see new messages.
const CONV_KEY = 'ezbook_conversations';
const MSG_KEY  = 'ezbook_messages';

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(CONV_KEY)) || []; }
  catch { return []; }
}

function saveConversations(convs) {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs));
}

function loadMessages() {
  try { return JSON.parse(localStorage.getItem(MSG_KEY)) || []; }
  catch { return []; }
}

function saveMessages(msgs) {
  localStorage.setItem(MSG_KEY, JSON.stringify(msgs));
}

export function createOrGetConversation(bookingId, clientId, providerId, clientName = 'Client', providerName = 'Provider') {
  const conversations = loadConversations();
  const key = String(bookingId);
  const idx = conversations.findIndex(c => c.BookingId === key);

  if (idx !== -1) {
    const existing = conversations[idx];
    // Patch in names if this conversation was created before name fields were added
    if (!existing.clientName || !existing.providerName) {
      const patched = {
        ...existing,
        clientName: existing.clientName || clientName,
        providerName: existing.providerName || providerName,
      };
      const updated = [...conversations];
      updated[idx] = patched;
      saveConversations(updated);
      return patched;
    }
    return existing;
  }

  const conv = {
    id: Date.now().toString(),
    BookingId: key,
    ClientID: String(clientId),
    ProviderID: String(providerId),
    clientName,
    providerName,
    createdAt: new Date().toISOString(),
  };
  saveConversations([...conversations, conv]);
  return conv;
}

export function getConversationsForUser(userId) {
  const id = String(userId);
  return loadConversations().filter(c => c.ClientID === id || c.ProviderID === id);
}

export function getConversationMessages(conversationId) {
  return loadMessages().filter(m => m.conversationId === conversationId);
}

export function sendLocalMessage(conversationId, senderId, text) {
  const messages = loadMessages();
  const msg = {
    id: Date.now().toString(),
    conversationId,
    SenderID: String(senderId),
    txt: text,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  saveMessages([...messages, msg]);
  return msg;
}
