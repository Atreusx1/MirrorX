import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getPosts = async () => {
  const response = await axios.get(`${API_URL}/posts`);
  return response.data;
};

export const createPost = async (post) => {
  const response = await axios.post(`${API_URL}/posts`, post);
  return response.data;
};

export const updateLike = async (postId, likes) => {
  const response = await axios.put(`${API_URL}/posts/like`, { postId, likes });
  return response.data;
};