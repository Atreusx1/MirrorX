const Post = require('../models/Post');

// Create a new post (called after on-chain post creation)
const createPost = async (req, res) => {
  try {
    const { postId, author, content, timestamp } = req.body;
    const post = new Post({
      postId,
      author,
      content,
      timestamp: new Date(timestamp * 1000),
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single post by postId
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update like count (called after on-chain like)
const updateLike = async (req, res) => {
  try {
    const { postId, likes } = req.body;
    const post = await Post.findOneAndUpdate(
      { postId },
      { likes },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  updateLike,
};