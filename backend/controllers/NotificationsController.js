const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
    try {
        const { userAddress, type, postId, commentId, actor, actorUsername, timestamp } = req.body;
        if (!userAddress || !type || !actor || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!['post_liked', 'comment_liked', 'comment_added'].includes(type)) {
            return res.status(400).json({ error: 'Invalid notification type' });
        }
        const notification = new Notification({
            userAddress,
            type,
            postId,
            commentId,
            actor,
            actorUsername,
            timestamp
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userAddress = req.params.userAddress;
        if (!userAddress) {
            return res.status(400).json({ error: 'User address is required' });
        }
        const notifications = await Notification.find({ userAddress }).sort({ timestamp: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markNotificationsRead = async (req, res) => {
    try {
        const userAddress = req.params.userAddress;
        if (!userAddress) {
            return res.status(400).json({ error: 'User address is required' });
        }
        await Notification.updateMany(
            { userAddress, read: false },
            { read: true }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};