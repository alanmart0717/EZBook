const express = require("express");
const router = express.Router();

const MessageController = require("../controllers/message.controller");

router.post("/conversation", MessageController.createConversation);

router.post("/send", MessageController.sendMessage);

router.get(
    "/conversations/:userId",
    MessageController.getUserConversations
);

router.get(
    "/messages/:ConversationID",
    MessageController.getConversationMessages
);

router.patch(
    "/read/:MessageId",
    MessageController.markAsRead
);

module.exports = router;