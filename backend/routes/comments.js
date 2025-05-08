const express = require('express');
const {
    createComment,
    getCommentsByPost,
    updateCommentLikes,
    deleteComment
} = require('../controllers/commentsController');
const router = express.Router();

router.post('/', createComment);
router.get('/post/:postId', getCommentsByPost);
router.put('/likes', updateCommentLikes);
router.put('/delete/:postId/:commentId', deleteComment);

module.exports = router;