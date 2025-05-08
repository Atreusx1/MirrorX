import { ethers } from 'ethers';
import MirrorPostABI from '../abis/MirrorPost.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed address
let provider;
let signer;
let contract;

// Initialize Web3 provider and contract
if (typeof window !== 'undefined' && window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, MirrorPostABI.abi, signer);
}

// Connect to MetaMask wallet
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return await getCurrentAccount();
}

// Get current connected account
export async function getCurrentAccount() {
  if (!provider) return '';
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0].address : '';
}

// Create a new post
export async function createPost(subCommunityId, content) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.createPost(subCommunityId, content);
}

// Like a post
export async function likePost(postId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.likePost(postId);
}

// Create a new comment
export async function createComment(postId, content) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.createComment(postId, content);
}

// Like a comment
export async function likeComment(postId, commentId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.likeComment(postId, commentId);
}

// Create a new sub-community
export async function createSubCommunity(name, description) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.createSubCommunity(name, description);
}

// Set username
export async function setUsername(username) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.setUsername(username);
}

// Delete a post
export async function deletePost(postId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.deletePost(postId);
}

// Delete a comment
export async function deleteComment(postId, commentId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.deleteComment(postId, commentId);
}

// Get a single post
export async function getPost(postId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.getPost(postId);
}

// Get posts in a sub-community
export async function getPostsInSubCommunity(subCommunityId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.getPostsInSubCommunity(subCommunityId);
}

// Get comments for a post
export async function getComments(postId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.getComments(postId);
}

// Get a sub-community
export async function getSubCommunity(subCommunityId) {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.getSubCommunity(subCommunityId);
}

// Get all sub-communities
export async function getAllSubCommunities() {
  if (!contract) throw new Error('Contract not initialized');
  return await contract.getAllSubCommunities();
}