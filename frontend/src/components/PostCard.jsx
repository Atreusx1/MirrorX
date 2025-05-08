import { updateLike } from '../services/api';
import styles from './PostCard.module.css';

function PostCard({ post, contract, account }) {
  const handleLike = async () => {
    try {
      const tx = await contract.methods.likePost(post.postId).send({ from: account });
      const likes = tx.events.PostLiked.returnValues.id
        ? (await contract.methods.posts(post.postId).call()).likes
        : post.likes;
      await updateLike(post.postId, likes);
      window.location.reload();
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post');
    }
  };

  return (
    <div className={styles.card}>
      <p className={styles.author}>
        {post.author.slice(0, 6)}...{post.author.slice(-4)}
      </p>
      <p className={styles.content}>{post.content}</p>
      <p className={styles.timestamp}>{new Date(post.timestamp).toLocaleString()}</p>
      <div className={styles.actions}>
        <button className={styles.likeButton} onClick={handleLike}>
          ❤️ {post.likes}
        </button>
      </div>
    </div>
  );
}

export default PostCard;