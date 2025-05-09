import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // ethers v6
import { createPost, getCurrentAccount, getContract, initializeContract } from '../services/web3';
import { savePost } from '../services/api';
import MirrorPostABI from '../abis/MirrorPost.json';
import styles from './PostForm.module.css';

function PostForm({ subCommunityId, onPost }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeContract();
        console.log('Contract initialized successfully');
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError('Failed to connect to blockchain. Please ensure MetaMask is installed.');
      }
    }
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!content.trim()) {
        throw new Error('Post content cannot be empty');
      }
      if (content.length > 1000) {
        throw new Error('Content must be 1-1000 characters');
      }

      const account = await getCurrentAccount();
      if (!account) {
        throw new Error('Please connect your wallet');
      }

      const contract = getContract();

      // Check username
      let user;
      try {
        user = await contract.getUser(account);
        console.log('User:', user);
      } catch (err) {
        console.error('getUser error:', err);
        throw new Error(err.reason || 'Failed to fetch user data.');
      }
      if (!user.exists || !user.username) {
        throw new Error('Please set a username before posting');
      }

      // Verify sub-community
      let subCommunity;
      try {
        subCommunity = await contract.getSubCommunity(subCommunityId);
        console.log('SubCommunity:', subCommunity);
      } catch (err) {
        console.error('getSubCommunity error:', err);
        throw new Error(err.reason || 'Failed to fetch sub-community.');
      }
      if (subCommunity.creator === ethers.ZeroAddress) {
        throw new Error('Sub-community does not exist');
      }

      console.log('Creating post with subCommunityId:', subCommunityId, 'content:', content);
      let tx;
      try {
        // Simulate transaction
        await contract.callStatic.createPost(subCommunityId, content);
        tx = await createPost(subCommunityId, content);
        console.log('Transaction sent:', tx.hash);
      } catch (err) {
        console.error('createPost error:', err);
        throw new Error(err.reason || 'Failed to send transaction.');
      }

      const receipt = await tx.wait(2);
      console.log('Transaction receipt:', receipt);
      if (receipt.status !== 1) {
        throw new Error('Transaction reverted');
      }

      console.log('Raw logs:', receipt.logs);
      const postCreatedEvent = receipt.logs
        .map((log, index) => {
          try {
            console.log(`Parsing log ${index}:`, log);
            const parsed = contract.interface.parseLog(log);
            console.log(`Parsed log ${index}:`, parsed);
            return parsed;
          } catch (err) {
            console.error(`Log parsing error for log ${index}:`, err);
            return null;
          }
        })
        .find(event => event && event.name === 'PostCreated');

      let postId;
      if (!postCreatedEvent) {
        console.warn('PostCreated event not found, attempting fallback');
        const postCount = await contract.postCount();
        postId = Number(postCount);
        const post = await contract.getPost(postId);
        if (post.author.toLowerCase() === account.toLowerCase() && post.content === content) {
          console.log('Post found via postCount:', postId);
        } else {
          throw new Error('PostCreated event not found and post not found on-chain.');
        }
      } else {
        postId = Number(postCreatedEvent.args.postId);
        console.log('PostCreated event found with postId:', postId);
      }

      try {
        await savePost({
          postId,
          subCommunityId,
          author: account,
          username: user.username,
          content,
          timestamp: postCreatedEvent ? Number(postCreatedEvent.args.timestamp) : Math.floor(Date.now() / 1000),
          likes: 0,
          isDeleted: false
        });
        console.log('Post saved to backend:', postId);
      } catch (err) {
        console.error('savePost error:', err.response?.data || err.message);
        throw new Error('Failed to save post to backend.');
      }

      setContent('');
      onPost();
    } catch (error) {
      console.error('Post creation failed:', error);
      const errorMessages = {
        'Sub-community does not exist': 'The specified sub-community does not exist.',
        'Content must be 1-1000 characters': 'Post content must be between 1 and 1000 characters.',
        'User must set a username': 'Please set a username before posting.'
      };
      setError(errorMessages[error.reason] || error.reason || error.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className={styles.textarea}
        disabled={loading}
      />
      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default PostForm;