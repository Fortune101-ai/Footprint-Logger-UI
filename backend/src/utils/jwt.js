import jwt from 'jsonwebtoken';
import logger from '#config/logger.js'

export function verifyToken(token) {
  if (!token) throw new Error('No token provided');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    logger.error(`Invalid token: ${err}`)
    throw new Error('Invalid token');
  }
}
