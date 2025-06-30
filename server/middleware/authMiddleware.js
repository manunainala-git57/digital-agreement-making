
// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Fetch full user (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user; //  Attach user with email, fullName, etc.

    next();
  } catch (err) {
    console.error(" Token error:", err);
    res.status(401).json({ error: 'Token invalid' });
  }
}


