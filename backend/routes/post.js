const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

router.post('/', postsController.createPost);
router.get('/', postsController.getPosts);
router.get('/:postId', postsController.getPost);
router.delete('/:postId', postsController.deletePost);
router.get('/search', postsController.searchPosts);

module.exports = router;