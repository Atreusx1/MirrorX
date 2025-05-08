const express = require('express');
const {
    createNotification,
    getNotifications,
    markNotificationsRead
} = require('../controllers/notificationsController');
const router = express.Router();

router.post('/', createNotification);
router.get('/:userAddress', getNotifications);
router.put('/:userAddress/read', markNotificationsRead);

module.exports = router;