import { verifyToken } from '#utils/jwt.js';

export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));

  try {
    const payload = verifyToken(token);
    socket.userId = payload.id;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
};
