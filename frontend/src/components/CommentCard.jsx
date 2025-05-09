import { useState } from 'react';
import { likeComment, deleteComment } from '../services/web3';
import { updateCommentLikes } from '../services/api';
import { getCurrentAccount } from '../services/web3';
import styles from './CommentCard.module.css';

function CommentCard({ comment, postId, isCreator, onUpdate }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLike = async () => {
    setError('');
    setLoading(true);
    try {
      const account = await getCurrentAccount();
      if (!account) {
        throw new Error('Please connect your wallet');
      }
      console.log('Liking comment:', { postId, commentId: comment.commentId });
      const tx = await likeComment(postId, comment.commentId);
      console.log('Like comment transaction sent:', tx.hash);
      const receipt = await tx.wait(2);
      console.log('Like comment transaction receipt:', receipt);
      if (receipt.status !== 1) {
        throw new Error('Like comment transaction failed');
      }

      await updateCommentLikes({
        postId,
        commentId: comment.commentId,
        likes: comment.likes + 1,
        actor: account,
        actorUsername: comment.username
      });
      console.log('Comment likes updated:', comment.commentId);
      onUpdate();
    } catch (error) {
      console.error('Like comment failed:', error);
      setError(error.reason || error.message || 'Failed to like comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isCreator) {
      setError('Only sub-community creator can delete comments');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const tx = await deleteComment(postId, comment.commentId);
      console.log('Delete comment transaction sent:', tx.hash);
      await tx.wait();
      onUpdate();
    } catch (error) {
      console.error('Delete comment failed:', error);
      setError(error.reason || 'Failed to delete comment');
    } finally {
      setLoading(false);
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
        <button onClick={handleLike} disabled={loading} className={styles.actionButton}>
          Like ({comment.likes})
        </button>
        {isCreator && (
          <button onClick={handleDelete} disabled={loading} className={styles.deleteButton}>
            Delete Comment
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentCard;