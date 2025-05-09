const Post = require('../models/Post');
const { ethers } = require('ethers');
const MirrorPostABI = require('../../smart-contracts/artifacts/contracts/MirrorPost.sol/MirrorPost.json').abi;

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contract = new ethers.Contract(contractAddress, MirrorPostABI, provider);

// Listen for PostCreated events
contract.on('PostCreated', async (postId, subCommunityId, author, username, content, timestamp) => {
  for (let i = 0; i < 3; i++) {
    try {
      console.log('PostCreated event:', { postId: postId.toString(), subCommunityId, author, username, content, timestamp: timestamp.toString() });
      const post = new Post({
        postId: Number(postId),
        subCommunityId: Number(subCommunityId),
        author,
        username,
        content,
        timestamp: Number(timestamp),
        likes: 0,
        isDeleted: false
      });
      await post.save();
      console.log(`Post ${postId} saved to backend`);
      break;
    } catch (error) {
      console.error(`Retry ${i+1} failed for PostCreated ${postId}:`, error);
      if (i === 2) console.error('Failed to save post after retries:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

// Listen for PostDeleted events to update backend
contract.on('PostDeleted', async (postId, moderator) => {
  try {
    const post = await Post.findOneAndUpdate(
      { postId: Number(postId) }, // Convert BigInt to Number
      { isDeleted: true },
      { new: true }
    );
    if (post) {
      console.log(`Post ${postId} marked as deleted in backend`);
    }
  } catch (error) {
    console.error('Error updating post deletion:', error);
  }
});

exports.createPost = async (req, res) => {
  try {
    const { postId, subCommunityId, author, username, content, timestamp } = req.body;
    console.log(`Creating post with postId: ${postId}`); // Debug log
    // Validate post exists on-chain
    const contractPost = await contract.getPost(postId);
    if (contractPost.author === ethers.ZeroAddress) {
      console.error(`Post ${postId} does not exist on blockchain`);
      return res.status(400).json({ error: 'Post does not exist on blockchain' });
    }
    const post = new Post({
      postId,
      subCommunityId,
      author,
      username,
      content,
      timestamp,
      likes: 0,
      isDeleted: false
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false }).sort({ timestamp: -1 });
    // Validate posts exist on-chain
    const validPosts = [];
    for (const post of posts) {
      try {
        const contractPost = await contract.getPost(post.postId);
        if (contractPost.author && !contractPost.isDeleted) {
          validPosts.push(post);
        }
      } catch (error) {
        console.error(`Post ${post.postId} does not exist on-chain:`, error);
      }
    }
    res.json(validPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }
    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Validate post exists on-chain
    const contractPost = await contract.getPost(postId);
    if (contractPost.author === ethers.ZeroAddress || contractPost.isDeleted) {
      return res.status(404).json({ error: 'Post does not exist on blockchain' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }
    const post = await Post.findOneAndUpdate(
      { postId },
      { isDeleted: true },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q || '';
    const posts = await Post.find({
      content: { $regex: query, $options: 'i' },
      isDeleted: false
    }).sort({ timestamp: -1 });
    // Validate posts exist on-chain
    const validPosts = [];
    for (const post of posts) {
      try {
        const contractPost = await contract.getPost(post.postId);
        if (contractPost.author && !contractPost.isDeleted) {
          validPosts.push(post);
        }
      } catch (error) {
        console.error(`Post ${post.postId} does not exist on-chain:`, error);
      }
    }
    res.json(validPosts);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};