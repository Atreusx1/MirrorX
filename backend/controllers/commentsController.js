const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
    try {
        const { commentId, postId, subCommunityId, author, username, content, timestamp } = req.body;
        if (!commentId || !postId || !subCommunityId || !author || !content || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const comment = new Comment({
            commentId,
            postId,
            subCommunityId,
            author,
            username,
            content,
            timestamp,
            likes: 0,
            isDeleted: false
        });
        await comment.save();
        // Create notification for post author
        const post = await Post.findOne({ postId });
        if (post && post.author !== author) {
            const notification = new Notification({
                userAddress: post.author,
                type: 'comment_added',
                postId,
                commentId,
                actor: author,
                actorUsername: username,
                timestamp
            });
            await notification.save();
        }
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid postId' });
        }
        const comments = await Comment.find({ postId, isDeleted: false }).sort({ timestamp: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCommentLikes = async (req, res) => {
    try {
        const { postId, commentId, likes, actor, actorUsername } = req.body;
        if (!postId || !commentId || likes === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const comment = await Comment.findOneAndUpdate(
            { postId, commentId },
            { likes },
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        // Create notification for comment author
        if (comment.author !== actor) {
            const notification = new Notification({
                userAddress: comment.author,
                type: 'comment_liked',
                postId,
                commentId,
                actor,
                actorUsername,
                timestamp: Math.floor(Date.now() / 1000)
            });
            await notification.save();
        }
        res.json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const postIdNum = parseInt(postId);
        const commentIdNum = parseInt(commentId);
        if (isNaN(postIdNum) || isNaN(commentIdNum)) {
            return res.status(400).json({ error: 'Invalid postId or commentId' });
        }
        const comment = await Comment.findOneAndUpdate(
            { postId: postIdNum, commentId: commentIdNum },
            { isDeleted: true },
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};