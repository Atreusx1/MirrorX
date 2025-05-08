const mongoose = require('mongoose');

const subCommunitySchema = new mongoose.Schema({
    subCommunityId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SubCommunity', subCommunitySchema);