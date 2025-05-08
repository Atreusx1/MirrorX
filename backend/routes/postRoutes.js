const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/posts', postController.createPost);
router.get('/posts', postController.getAllPosts);
router.get('/posts/:postId', postController.getPost);
router.put('/posts/like', postController.updateLike);

module.exports = router;