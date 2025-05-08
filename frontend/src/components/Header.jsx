import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connectWallet, getCurrentAccount } from '../services/web3';
import { getUser } from '../services/api';

// Header component with wallet connection, navigation, and search
function Header() {
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Load account and username on mount
  useEffect(() => {
    const loadAccount = async () => {
      const acc = await getCurrentAccount();
      if (acc) {
        setAccount(acc);
        const user = await getUser(acc);
        setUsername(user.username || '');
      }
    };
    loadAccount();
  }, []);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      if (acc) {
        setAccount(acc);
        const user = await getUser(acc);
        setUsername(user.username || '');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="bg-card p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary">MirrorClone</Link>
      <form onSubmit={handleSearch} className="flex">
        <input
          name="search"
          type="text"
          placeholder="Search posts or sub-communities"
          className="p-2 bg-input text-white border-none rounded-l-md focus:outline-none"
        />
        <button type="submit" className="p-2 bg-primary text-white rounded-r-md">🔍</button>
      </form>
      <nav className="flex items-center gap-4">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        <Link to="/profile" className="text-primary hover:underline">Profile</Link>
        {account ? (
          <span className="text-white">{username || `${account.slice(0, 6)}...`}</span>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
}

export default Header;