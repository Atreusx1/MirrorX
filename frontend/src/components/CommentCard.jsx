import { useState } from 'react';
import { likeComment, deleteComment } from '../services/web3';
import styles from './CommentCard.module.css';

// CommentCard component displaying a single comment and its actions
function CommentCard({ comment, postId, isCreator, onUpdate }) {
  const [error, setError] = useState('');

  // Handle comment like
  const handleLike = async () => {
    try {
      setError('');
      const tx = await likeComment(postId, comment.commentId);
      await tx.wait();
      onUpdate();
    } catch (error) {
      console.error('Like comment failed:', error);
      setError(error.reason || 'Failed to like comment');
    }
  };

  // Handle comment deletion
  const handleDelete = async () => {
    if (!isCreator) {
      setError('Only sub-community creator can delete comments');
      return;
    }
    try {
      setError('');
      const tx = await deleteComment(postId, comment.commentId);
      await tx.wait();
      onUpdate();
    } catch (error) {
      console.error('Delete comment failed:', error);
      setError(error.reason || 'Failed to delete comment');
    }
  };

  return (
    <div className={styles.card}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.header}>
        <p className={styles.content}>{comment.content}</p>
        <div className={styles.meta}>
          <span>Commented by {comment.username}</span>
          <span> at {new Date(comment.timestamp * 1000).toLocaleString()}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleLike} className={styles.actionButton}>
          Like ({comment.likes})
        </button>
        {isCreator && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete Comment
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentCard;