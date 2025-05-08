import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import { getSubCommunity } from '../services/web3';
import { getSubCommunityById, getPosts } from '../services/api';
import styles from './SubCommunity.module.css';

// SubCommunity page displaying sub-community details and posts
function SubCommunity() {
  const { id } = useParams();
  const [subCommunity, setSubCommunity] = useState({});
  const [posts, setPosts] = useState([]);

  // Load sub-community and posts
  useEffect(() => {
    const loadData = async () => {
      try {
        const sub = await getSubCommunityById(id);
        setSubCommunity(sub);
        const apiPosts = await getPosts();
        setPosts(apiPosts.filter(post => post.subCommunityId === Number(id) && !post.isDeleted));
      } catch (error) {
        console.error('Failed to load sub-community:', error);
      }
    };
    loadData();
  }, [id]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{subCommunity.name || 'Loading...'}</h1>
      <p className={styles.description}>{subCommunity.description}</p>
      <PostForm subCommunityId={Number(id)} onPost={() => loadData()} />
      {posts.length === 0 && <p className={styles.noPosts}>No posts in this sub-community.</p>}
      {posts.map(post => (
        <PostCard
          key={post.postId}
          post={post}
          onUpdate={() => loadData()}
        />
      ))}
    </div>
  );
}

export default SubCommunity;