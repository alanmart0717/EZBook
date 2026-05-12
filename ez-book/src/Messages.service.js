const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function createConversation(payload) {
    const res = await fetch(`${API_BASE_URL}/api/messages/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return await res.json();
}

export async function getConversations(userId) {

    const res = await fetch(
        `${API_BASE_URL}/api/messages/conversations/${userId}`
    );

    return await res.json();
}

export async function getMessages(ConversationID) {

    const res = await fetch(
        `${API_BASE_URL}/api/messages/messages/${ConversationID}`
    );

    return await res.json();
}

export async function sendMessage(payload) {

    const res = await fetch(
        `${API_BASE_URL}/api/messages/send`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    return await res.json();
}