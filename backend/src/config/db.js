const mongoose = require('mongoose');

const connectToDatabase = async () => {
    const dbURI = process.env.MONGODB_URI
    if (!dbURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(dbURI)
    console.log('Connected to MongoDB');
}

module.exports = connectToDatabase;
