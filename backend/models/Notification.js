const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userAddress: { type: String, required: true },
    type: { type: String, enum: ['post_liked', 'comment_liked', 'comment_added'], required: true },
    postId: { type: Number },
    commentId: { type: Number },
    actor: { type: String, required: true },
    actorUsername: { type: String },
    timestamp: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);