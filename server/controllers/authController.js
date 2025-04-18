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

    } catch (err) {
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
