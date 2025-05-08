const express = require('express');
const {
    createSubCommunity,
    getSubCommunities,
    getSubCommunityById,
    searchSubCommunities
} = require('../controllers/subCommunitiesController');
const router = express.Router();

router.post('/', createSubCommunity);
router.get('/', getSubCommunities);
router.get('/:subCommunityId', getSubCommunityById);
router.get('/search', searchSubCommunities);

module.exports = router;