import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fleetflow_super_secret';
const EMAIL_USER = process.env.EMAIL_USER || 'kavishvachheta11@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate reset token string
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save hashed token and expiration (1 hour) to user
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour buffer

        await user.save();

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <h2>FleetFlow Password Reset Request</h2>
            <p>You requested a password reset. Please make a PUT request to the link below to reset your password:</p>
            <a href="${resetUrl}" target="_blank">Click here to securely reset your password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        await transporter.sendMail({
            from: `"FleetFlow Security" <${EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: message
        });

        res.status(200).json({ message: 'Password reset link sent securely to your email.' });

    } catch (error) {
        // Clear token safely if email failed to send
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        console.error('Email error:', error);
        res.status(500).json({ message: 'Email could not be sent', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the URL token to match against the DB record
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() } // Ensure token hasn't expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Apply new hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Flush reset tokens
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been updated successfully. Please log in.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset', error: error.message });
    }
};
