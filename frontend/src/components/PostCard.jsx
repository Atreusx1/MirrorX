import { useState, useEffect } from 'react';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { likePost, createComment, deletePost, getPost } from '../services/web3';
import { getComments, saveComment, deletePost as deletePostApi } from '../services/api';
import { getCurrentAccount } from '../services/web3';
import styles from './PostCard.module.css';

// PostCard component displaying a post, its comments, and actions
function PostCard({ post, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');
  const [isValidPost, setIsValidPost] = useState(true);

  // Load comments and check if user is sub-community creator
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`Loading post with postId: ${post.postId}`); // Debug log
        // Validate post exists on-chain
        const contractPost = await getPost(post.postId);
        if (!contractPost.author) {
          console.error(`Post ${post.postId} does not exist on blockchain`);
          setIsValidPost(false);
          setError('Post does not exist on blockchain');
          return;
        }

        const fetchedComments = await getComments(post.postId);
        setComments(fetchedComments.filter(comment => !comment.isDeleted));

        const account = await getCurrentAccount();
        if (account && post.subCommunityCreator === account) {
          setIsCreator(true);
        }
      } catch (error) {
        console.error(`Failed to load post data for postId ${post.postId}:`, error);
        setError(error.reason || 'Failed to load post data');
        setIsValidPost(false);
      }
    };
    loadData();
  }, [post.postId, post.subCommunityCreator]);

  // Handle post like
  const handleLike = async () => {
    if (!isValidPost) {
      setError('Cannot like: Post does not exist');
      return;
    }
    try {
      setError('');
      const tx = await likePost(post.postId);
      await tx.wait();
      onUpdate();
    } catch (error) {
      console.error('Like post failed:', error);
      setError(error.reason || 'Failed to like post');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (content) => {
    if (!isValidPost) {
      setError('Cannot comment: Post does not exist');
      return;
    }
    try {
      setError('');
      const account = await getCurrentAccount();
      if (!account) {
        setError('Please connect your wallet');
        return;
      }
      const tx = await createComment(post.postId, content);
      await tx.wait();
      await saveComment({
        commentId: Date.now(), // Temporary; sync with contract commentCount
        postId: post.postId,
        subCommunityId: post.subCommunityId,
        author: account,
        username: post.username,
        content,
        timestamp: Math.floor(Date.now() / 1000)
      });
      onUpdate();
    } catch (error) {
      console.error('Comment creation failed:', error);
      setError(error.reason || 'Failed to create comment');
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!isValidPost) {
      setError('Cannot delete: Post does not exist');
      return;
    }
    if (!isCreator) {
      setError('Only sub-community creator can delete posts');
      return;
    }
    try {
      setError('');
      const tx = await deletePost(post.postId);
      await tx.wait();
      await deletePostApi(post.postId);
      onUpdate();
    } catch (error) {
      console.error('Delete post failed:', error);
      setError(error.reason || 'Failed to delete post');
    }
  };

  if (!isValidPost && !error) {
    return null; // Don't render invalid posts
  }

  return (
    <div className={styles.card}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.header}>
        <h3 className={styles.title}>{post.content}</h3>
        <div className={styles.meta}>
          <span>Posted by {post.username}</span>
          <span> in Sub-Community #{post.subCommunityId}</span>
          <span> at {new Date(post.timestamp * 1000).toLocaleString()}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleLike} className={styles.actionButton}>
          Like ({post.likes})
        </button>
        {isCreator && (
          <button onClick={handleDeletePost} className={styles.deleteButton}>
            Delete Post
          </button>
        )}
      </div>
      <CommentForm onSubmit={handleCommentSubmit} />
      {comments.length === 0 && <p className={styles.noComments}>No comments yet.</p>}
      {comments.map(comment => (
        <CommentCard
          key={comment.commentId}
          comment={comment}
          postId={post.postId}
          isCreator={isCreator}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default PostCard;