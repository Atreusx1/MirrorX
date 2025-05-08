const express = require('express');
const { setUsername, getUser } = require('../controllers/usersController');
const router = express.Router();

router.post('/username', setUsername);
router.get('/:address', getUser);

module.exports = router;