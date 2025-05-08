import { useState } from 'react';
import { createPost, getCurrentAccount } from '../services/web3';
import { savePost, getUser } from '../services/api';
import styles from './PostForm.module.css';

// PostForm component for creating new posts
function PostForm({ subCommunityId, onPost }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    try {
      setError('');
      const account = await getCurrentAccount();
      if (!account) {
        setError('Please connect your wallet');
        return;
      }
      const user = await getUser(account).catch(() => ({ username: 'Anonymous' }));
      const tx = await createPost(subCommunityId, content);
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }
      // Extract postId from PostCreated event
      const postCreatedEvent = receipt.logs
        .map(log => {
          try {
            console.log('Parsing log:', log);
            return contract.interface.parseLog(log);
          } catch (err) {
            console.error('Log parsing error:', err);
            return null;
          }
        })
        .find(event => event && event.name === 'PostCreated');
      if (!postCreatedEvent) {
        console.error('Logs:', receipt.logs);
        throw new Error('PostCreated event not found');
      }
      const postId = Number(postCreatedEvent.args.postId);
      console.log('PostCreated event found with postId:', postId);
      await savePost({
        postId,
        subCommunityId,
        author: account,
        username: user.username || 'Anonymous',
        content,
        timestamp: Number(postCreatedEvent.args.timestamp),
        likes: 0,
        isDeleted: false
      });
      setContent('');
      onPost();
    } catch (error) {
      console.error('Post creation failed:', error);
      setError(error.message || error.reason || 'Failed to create post');
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
      />
      <button type="submit" className={styles.submitButton}>
        Post
      </button>
    </form>
  );
}

export default PostForm;