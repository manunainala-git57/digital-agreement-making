import { hash, compare } from 'bcryptjs';
import pkg from 'jsonwebtoken';
import User from '../models/Users.js';

const { sign } = pkg;

export async function register(req, res) {
    const { fullName, email, password } = req.body;
    try {
        const hashedPassword = await hash(password, 10);
        const newUser = await User.create({ fullName, email, password: hashedPassword });

        // Send user data without password
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        const token = sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'User registered', user: userWithoutPassword, token });
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: 'User already exists' });
        }


    } catch (err) {
        console.error(err); 
        res.status(400).json({ error: 'User registration failed' });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    console.log('Login payload:', req.body);
    try {
        const user = await User.findOne({ email });
       
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        
        if (!user || !(await compare(password, user.password)))
            return res.status(401).json({ error: 'Invalid credentials' });

        const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Login failed' });
    }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Provided by protect middleware
    const { fullName } = req.body;

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    ).select('-password'); // Don't return password

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
