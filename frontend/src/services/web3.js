import { ethers } from 'ethers';
import MirrorPostABI from '../abis/MirrorPost.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed address

let provider = null;
let signer = null;
let contract = null;

// Initialize provider, signer, and contract
export async function initializeContract() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed or not running in a browser');
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await connectWallet(); // Ensure wallet is connected
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, MirrorPostABI.abi, signer);
    console.log('Contract initialized at:', CONTRACT_ADDRESS);
    return contract;
  } catch (error) {
    console.error('Failed to initialize contract:', error);
    throw error;
  }
}

// Export contract instance for event parsing
export function getContract() {
  if (!contract) {
    throw new Error('Contract not initialized. Call initializeContract first.');
  }
  return contract;
}

// Connect to MetaMask wallet
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = await getCurrentAccount();
    console.log('Wallet connected:', account);
    return account;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}

// Get current connected account
export async function getCurrentAccount() {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0].address : '';
}

// Create a new post
export async function createPost(subCommunityId, content) {
  if (!contract) {
    await initializeContract();
  }
  try {
    console.log('Creating post with subCommunityId:', subCommunityId, 'content:', content);
    const tx = await contract.createPost(subCommunityId, content);
    console.log('Transaction hash:', tx.hash);
    return tx;
  } catch (error) {
    console.error('createPost error:', error);
    throw error;
  }
}

// Like a post
export async function likePost(postId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.likePost(postId);
}

// Create a new comment
export async function createComment(postId, content) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.createComment(postId, content);
}

// Like a comment
export async function likeComment(postId, commentId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.likeComment(postId, commentId);
}

// Create a new sub-community
export async function createSubCommunity(name, description) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.createSubCommunity(name, description);
}

// Set username
export async function setUsername(username) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.setUsername(username);
}

// Delete a post
export async function deletePost(postId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.deletePost(postId);
}

// Delete a comment
export async function deleteComment(postId, commentId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.deleteComment(postId, commentId);
}

// Get a single post
export async function getPost(postId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.getPost(postId);
}

// Get posts in a sub-community
export async function getPostsInSubCommunity(subCommunityId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.getPostsInSubCommunity(subCommunityId);
}

// Get comments for a post
export async function getComments(postId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.getComments(postId);
}

// Get a sub-community
export async function getSubCommunity(subCommunityId) {
  if (!contract) {
    await initializeContract();
  }
  return await contract.getSubCommunity(subCommunityId);
}

// Get all sub-communities
export async function getAllSubCommunities() {
  if (!contract) {
    await initializeContract();
  }
  return await contract.getAllSubCommunities();
}