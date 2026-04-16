class Message {
  constructor({ id, senderId, receiverId, content, timestamp }) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = timestamp;
  }
}

module.exports = Message;