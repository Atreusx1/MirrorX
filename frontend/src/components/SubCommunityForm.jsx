import { useState } from 'react';
import { createSubCommunity, getCurrentAccount } from '../services/web3';
import { saveSubCommunity } from '../services/api';
import styles from './SubCommunityForm.module.css';

// SubCommunityForm component for creating new sub-communities
function SubCommunityForm({ onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Validate inputs
  const validateInputs = () => {
    if (!name.trim() || name.length < 3 || name.length > 50) {
      setError('Name must be 3-50 characters');
      return false;
    }
    if (!description.trim() || description.length < 10 || description.length > 200) {
      setError('Description must be 10-200 characters');
      return false;
    }
    return true;
  };

  // Handle sub-community creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateInputs()) return;
    try {
      const account = await getCurrentAccount();
      if (!account) {
        setError('Please connect your wallet');
        return;
      }
      // Call smart contract
      const tx = await createSubCommunity(name, description);
      await tx.wait(); // Wait for transaction confirmation
      // Save to backend
      await saveSubCommunity({
        subCommunityId: Date.now(), // Temporary; sync with contract subCommunityCount
        name,
        description,
        creator: account
      });
      setName('');
      setDescription('');
      onCreate();
      alert('Sub-community created successfully!');
    } catch (error) {
      console.error('Sub-community creation failed:', error);
      const errorMessage = error.reason || error.message || 'Failed to create sub-community';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Sub-Community Name (3-50 characters)"
        className={styles.input}
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (10-200 characters)"
        className={styles.textarea}
      />
      <button type="submit" className={styles.submitButton}>
        Create Sub-Community
      </button>
    </form>
  );
}

export default SubCommunityForm;