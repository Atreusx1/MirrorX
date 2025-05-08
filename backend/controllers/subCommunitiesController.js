const SubCommunity = require('../models/SubCommunity');

exports.createSubCommunity = async (req, res) => {
  try {
    const { subCommunityId, name, description, creator } = req.body;
    // Validate inputs
    if (!subCommunityId || isNaN(subCommunityId)) {
      return res.status(400).json({ error: 'Invalid or missing subCommunityId' });
    }
    if (!name || name.length < 3 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be 3-50 characters' });
    }
    if (!description || description.length < 10 || description.length > 200) {
      return res.status(400).json({ error: 'Description must be 10-200 characters' });
    }
    if (!creator || !/^0x[a-fA-F0-9]{40}$/.test(creator)) {
      return res.status(400).json({ error: 'Invalid or missing creator address' });
    }
    // Check for duplicate subCommunityId
    const existing = await SubCommunity.findOne({ subCommunityId });
    if (existing) {
      return res.status(400).json({ error: 'SubCommunityId already exists' });
    }
    const subCommunity = new SubCommunity({
      subCommunityId,
      name,
      description,
      creator
    });
    await subCommunity.save();
    res.status(201).json(subCommunity);
  } catch (error) {
    console.error('Create sub-community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSubCommunities = async (req, res) => {
  try {
    const subCommunities = await SubCommunity.find().sort({ createdAt: -1 });
    res.json(subCommunities);
  } catch (error) {
    console.error('Get sub-communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSubCommunityById = async (req, res) => {
  try {
    const subCommunityId = parseInt(req.params.subCommunityId);
    if (isNaN(subCommunityId)) {
      return res.status(400).json({ error: 'Invalid subCommunityId' });
    }
    const subCommunity = await SubCommunity.findOne({ subCommunityId });
    if (!subCommunity) {
      return res.status(404).json({ error: 'SubCommunity not found' });
    }
    res.json(subCommunity);
  } catch (error) {
    console.error('Get sub-community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchSubCommunities = async (req, res) => {
  try {
    const query = req.query.q || '';
    const subCommunities = await SubCommunity.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(subCommunities);
  } catch (error) {
    console.error('Search sub-communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};