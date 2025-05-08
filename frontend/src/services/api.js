import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Save a new post
export async function savePost(post) {
  return await axios.post(`${API_URL}/posts`, post);
}

// Get all posts
export async function getPosts() {
  return (await axios.get(`${API_URL}/posts`)).data;
}

// Search posts
export async function searchPosts(query) {
  return (await axios.get(`${API_URL}/posts/search?q=${encodeURIComponent(query)}`)).data;
}

// Delete a post
export async function deletePost(postId) {
  return await axios.delete(`${API_URL}/posts/${postId}`);
}

// Save a new comment
export async function saveComment(comment) {
  return await axios.post(`${API_URL}/comments`, comment);
}

// Get comments for a post
export async function getComments(postId) {
  return (await axios.get(`${API_URL}/comments/post/${postId}`)).data;
}

// Update post likes
export async function updatePostLikes(data) {
  return await axios.put(`${API_URL}/posts/likes`, data);
}

// Update comment likes
export async function updateCommentLikes(data) {
  return await axios.put(`${API_URL}/comments/likes`, data);
}

// Save a new sub-community
export async function saveSubCommunity(subCommunity) {
  return await axios.post(`${API_URL}/subcommunities`, subCommunity);
}

// Get all sub-communities
export async function getSubCommunities() {
  return (await axios.get(`${API_URL}/subcommunities`)).data;
}

// Get a sub-community by ID
export async function getSubCommunityById(id) {
  return (await axios.get(`${API_URL}/subcommunities/${id}`)).data;
}

// Search sub-communities
export async function searchSubCommunities(query) {
  return (await axios.get(`${API_URL}/subcommunities/search?q=${encodeURIComponent(query)}`)).data;
}

// Save username
export async function saveUsername(user) {
  return await axios.post(`${API_URL}/users/username`, user);
}

// Get user by address
export async function getUser(address) {
  return (await axios.get(`${API_URL}/users/${address}`)).data;
}

// Save notification
export async function saveNotification(notification) {
  return await axios.post(`${API_URL}/notifications`, notification);
}

// Get notifications for a user
export async function getNotifications(userAddress) {
  return (await axios.get(`${API_URL}/notifications/${userAddress}`)).data;
}