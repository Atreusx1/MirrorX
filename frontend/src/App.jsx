import { useState, useEffect } from 'react';
import Header from './components/Header';
import WalletButton from './components/WalletButton';
import PostForm from './components/PostForm';
import Home from './pages/Home';
import { initWeb3, getContract } from './services/web3';
import styles from './App.module.css';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        const accounts = await initWeb3();
        if (accounts) {
          setAccount(accounts[0]);
          const contractInstance = await getContract();
          setContract(contractInstance);
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
        alert('Please ensure MetaMask is installed and connected.');
      }
    };
    loadWeb3();
  }, []);

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {account ? (
          <>
            <WalletButton account={account} />
            <PostForm account={account} contract={contract} />
            <Home contract={contract} account={account} />
          </>
        ) : (
          <WalletButton account={null} />
        )}
      </main>
    </div>
  );
}

export default App;