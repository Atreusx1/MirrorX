import { initWeb3 } from '../services/web3';
import styles from './WalletButton.module.css';

function WalletButton({ account }) {
  const connectWallet = async () => {
    try {
      const accounts = await initWeb3();
      if (accounts) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Ensure MetaMask is installed.');
    }
  };

  return (
    <div className={styles.container}>
      {account ? (
        <p className={styles.account}>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletButton;