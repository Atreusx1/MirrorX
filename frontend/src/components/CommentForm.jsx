import { useState } from 'react';
import styles from './CommentForm.module.css';

// CommentForm component for submitting new comments
function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Validate comment content
  const validateContent = () => {
    if (!content.trim() || content.length < 1 || content.length > 500) {
      setError('Comment must be 1-500 characters');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateContent()) return;
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Comment submission failed:', error);
      setError(error.reason || 'Failed to submit comment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a comment (1-500 characters)"
        className={styles.textarea}
      />
      <button type="submit" className={styles.submitButton}>
        Submit Comment
      </button>
    </form>
  );
}

export default CommentForm;