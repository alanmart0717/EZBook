console.log('Controller loaded');
// const { conversations, messages, bookings } = require("../../backend/src/db/connection.js");
const conversations = [];
const messages = [];

// create conversation
exports.createConversation = (req, res) => {
    console.log('HIT createConversation', req.body);  
    try {
        const { BookingId, ClientID, ProviderID } = req.body;
             console.log({ BookingId, ClientID, ProviderID }); 
        if (!BookingId || !ClientID || !ProviderID) {
            return res.status(400).json({ error: "Missing Fields!" });
        }

        const existingC = conversations.find()(
            c => c.BookingId === BookingId
        );

        if (existingC) {
            return res.status(200).json({
                success: true,
                conversation: existingC
            });
        }

        const conversation = {
            id: Date.now().toString(),
            BookingId,
            ClientID,
            ProviderID,
            createdAt: new Date()
        };

        conversations.push(conversation);

        return res.status(201).json({
            success: true,
            conversation
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Failed to create conversation"
        });
    }
};


// send message
exports.sendMessage = (req, res) => {
    try {
        const { ConversationID, SenderID, txt } = req.body;

        if (!ConversationID || !SenderID || !txt) {
            return res.status(400).json({ error: "Missing Fields!" });
        }

        const conversation = conversations.find(
            c => c.id === ConversationID
        );

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const isParticipant =
            SenderID === conversation.ClientID ||
            SenderID === conversation.ProviderID;

        if (!isParticipant) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const message = {
            id: Date.now().toString(),
            conversationId: ConversationID,
            SenderID,
            txt,
            timestamp: new Date(),
            isRead: false
        };

        messages.push(message);

        return res.status(201).json({
            success: true,
            message
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Failed to send message"
        });
    }
};


// get conversations
exports.getUserConversations = (req, res) => {
    try {
        const { userId } = req.params;

        const userConversations = conversations.filter(
            c =>
                c.ClientID === userId ||
                c.ProviderID === userId
        );

        return res.status(200).json({
            success: true,
            conversations: userConversations
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch conversations"
        });
    }
};


// get messages
exports.getConversationMessages = (req, res) => {
    try {
        const { ConversationID } = req.params;

        const conversation = conversations.find(
            c => c.id === ConversationId
        );

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found"
            });
        }

        const conversationMessages = messages.filter(
            m => m.ConversationId === ConversationId
        );

        return res.status(200).json({
            success: true,
            messages: conversationMessages
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch messages"
        });
    }
};

exports.markAsRead = (req, res) => {
    try {
        const { MessageId } = req.params;

        const message = messages.find(m => m.id === MessageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        message.isRead = true;

        return res.status(200).json({
            success: true,
            message
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to mark message as read"
        });
    }
};