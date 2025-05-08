const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comments');
const subCommunityRoutes = require('./routes/subCommunities');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected:', mongoose.connection.host))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subcommunities', subCommunityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));