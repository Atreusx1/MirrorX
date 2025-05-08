import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import SubCommunityForm from '../components/SubCommunityForm';
import { getAllSubCommunities, getPost } from '../services/web3';
import { getPosts, searchPosts, getSubCommunities } from '../services/api';
import styles from './Home.module.css';

// Home page displaying posts and sub-community selector
function Home() {
  const [posts, setPosts] = useState([]);
  const [subCommunities, setSubCommunities] = useState([]);
  const [selectedSubCommunity, setSelectedSubCommunity] = useState(1);
  const location = useLocation();

  // Load posts and sub-communities
  const loadData = useCallback(async () => {
    try {
      const query = new URLSearchParams(location.search).get('search');
      let fetchedPosts = [];
      if (query) {
        fetchedPosts = await searchPosts(query);
      } else {
        fetchedPosts = await getPosts();
      }

      // Validate posts exist on-chain
      const validPosts = [];
      for (const post of fetchedPosts) {
        try {
          const contractPost = await getPost(post.postId);
          if (contractPost.author && !contractPost.isDeleted && post.subCommunityId === selectedSubCommunity) {
            validPosts.push(post);
          }
        } catch (error) {
          console.error(`Post ${post.postId} does not exist on-chain:`, error);
        }
      }
      setPosts(validPosts);

      const subs = await getSubCommunities();
      if (subs.length === 0) {
        const contractSubs = await getAllSubCommunities();
        setSubCommunities(contractSubs);
      } else {
        setSubCommunities(subs);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [location.search, selectedSubCommunity]);

  // Trigger loadData on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle sub-community selection
  const handleSubCommunityChange = (e) => {
    setSelectedSubCommunity(Number(e.target.value));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MirrorClone Feed</h1>
      <SubCommunityForm onCreate={loadData} />
      <div className={styles.subCommunitySelector}>
        <label htmlFor="subCommunity" className="mr-2">Select Sub-Community:</label>
        <select
          id="subCommunity"
          value={selectedSubCommunity}
          onChange={handleSubCommunityChange}
          className={styles.select}
        >
          {subCommunities.map(sub => (
            <option key={sub.subCommunityId} value={sub.subCommunityId}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>
      <PostForm subCommunityId={selectedSubCommunity} onPost={loadData} />
      {posts.length === 0 && <p className={styles.noPosts}>No posts found.</p>}
      {posts.map(post => (
        <PostCard
          key={post.postId}
          post={post}
          onUpdate={loadData}
        />
      ))}
    </div>
  );
}

export default Home;