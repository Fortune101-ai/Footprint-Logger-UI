import { verifyToken } from "#utils/jwt.js";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(403).json({message:"Invalid token"})
  }
  
};

export default authenticateToken;
