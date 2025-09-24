import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const clients = {
  user: aj.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 200,
      name: 'user-rate-limit',
    })
  ),
  guest: aj.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 100,
      name: 'guest-rate-limit',
    })
  ),
};

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    const client = clients[role] || clients.guest;

    const decision = await client.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        logger.warn('Request blocked: Bot detected', {
          ip: req.ip,
          path: req.path,
          userAgent: req.headers['user-agent'],
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: Bot detected',
        });
      }

      if (decision.reason.isShield()) {
        logger.warn('Shield blocked request', {
          ip: req.ip,
          path: req.path,
          userAgent: req.headers['user-agent'],
          method: req.method,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: Request blocked by security policy',
        });
      }

      if (decision.reason.isRateLimit()) {
        logger.warn('Request blocked: Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          userAgent: req.headers['user-agent'],
        });
        return res.status(429).json({
          error: 'Too Many Requests',
          message:
            role === 'user'
              ? 'User rate limit exceeded (10 per minute)'
              : 'Guest rate limit exceeded (5 per minute)',
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Security middleware error', error);
    res
      .status(500)
      .json({ error: 'Something went wrong with security middleware' });
  }
};

export default securityMiddleware;
