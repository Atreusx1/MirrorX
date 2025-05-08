import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { getPosts } from '../services/api';
import styles from './Home.module.css';

function Home({ contract }) {
  const [posts, setPosts] = useState([]);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className={styles.container}>
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} contract={contract} account={account} />
      ))}
    </div>
  );
}

export default Home;