const User = require('../models/User');

exports.setUsername = async (req, res) => {
    try {
        const { address, username } = req.body;
        if (!address || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be 3-20 characters' });
        }
        const existingUser = await User.findOne({ username, address: { $ne: address } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        const user = await User.findOneAndUpdate(
            { address },
            { username },
            { upsert: true, new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const address = req.params.address;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        const user = await User.findOne({ address });
        res.json(user || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};