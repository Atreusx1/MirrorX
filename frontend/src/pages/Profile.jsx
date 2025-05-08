import { useState, useEffect } from 'react';
import { setUsername, getCurrentAccount } from '../services/web3';
import { saveUsername, getNotifications } from '../services/api';
import styles from './Profile.module.css';

// Profile page for setting username and viewing notifications
function Profile() {
  const [username, setUsernameInput] = useState('');
  const [account, setAccount] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Load account and notifications
  useEffect(() => {
    const loadData = async () => {
      const acc = await getCurrentAccount();
      setAccount(acc);
      if (acc) {
        const notifs = await getNotifications(acc);
        setNotifications(notifs);
      }
    };
    loadData();
  }, []);

  // Handle username submission
  const handleSetUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      await setUsername(username);
      await saveUsername({ address: account, username });
      setUsernameInput('');
      alert('Username set successfully!');
    } catch (error) {
      console.error('Set username failed:', error);
      alert('Failed to set username. It may be taken or invalid.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      <form onSubmit={handleSetUsername} className={styles.form}>
        <input
          type="text"
          value={username}
          onChange={e => setUsernameInput(e.target.value)}
          placeholder="Set your username (3-20 characters)"
          className={styles.input}
        />
        <button type="submit" className={styles.submitButton}>
          Set Username
        </button>
      </form>
      <h2 className={styles.subtitle}>Notifications</h2>
      {notifications.length === 0 && <p className={styles.noNotifications}>No notifications.</p>}
      <ul className={styles.notifications}>
        {notifications.map((notif, index) => (
          <li key={index} className={styles.notification}>
            <span>
              {notif.actorUsername || `${notif.actor.slice(0, 6)}...`} {notif.type.replace('_', ' ')} on{' '}
              {notif.commentId ? `comment #${notif.commentId}` : `post #${notif.postId}`}
            </span>
            <span className={styles.timestamp}>
              {new Date(notif.timestamp * 1000).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;