import Web3 from 'web3';
import MirrorPostABI from '../abis/MirrorPost.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed address

export const initWeb3 = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      return accounts;
    } catch (error) {
      throw new Error('Failed to connect to MetaMask');
    }
  } else {
    throw new Error('MetaMask not detected');
  }
};

export const getContract = async () => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(MirrorPostABI.abi, CONTRACT_ADDRESS);
};