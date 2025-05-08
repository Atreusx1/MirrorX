const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);