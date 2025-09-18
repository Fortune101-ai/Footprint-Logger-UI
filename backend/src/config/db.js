import mongoose from 'mongoose';
import logger from '#config/logger.js';

const connectToDatabase = async () => {
  const dbURI = process.env.MONGODB_URI;
  if (!dbURI) {
    logger.error('MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(dbURI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    throw new Error('Error connecting to MongoDB');
  }
};

export default connectToDatabase;
