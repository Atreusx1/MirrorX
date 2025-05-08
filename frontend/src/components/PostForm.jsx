import { useState } from 'react';
import { createPost } from '../services/api';
import styles from './PostForm.module.css';

function PostForm({ account, contract }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      alert('Content cannot be empty');
      return;
    }
    try {
      const tx = await contract.methods.createPost(content).send({ from: account });
      const postId = tx.events.PostCreated.returnValues.id;
      const timestamp = tx.events.PostCreated.returnValues.timestamp;
      await createPost({ postId, author: account, content, timestamp });
      setContent('');
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        rows="4"
        placeholder="Write a post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" className={styles.button}>
        Post
      </button>
    </form>
  );
}

export default PostForm;