const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentId: { type: Number, required: true },
    postId: { type: Number, required: true },
    subCommunityId: { type: Number, required: true },
    author: { type: String, required: true },
    username: { type: String },
    content: { type: String, required: true },
    timestamp: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);