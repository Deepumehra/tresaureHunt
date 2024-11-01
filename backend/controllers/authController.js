const { oauth2client } = require("../config/googleConfig");
const User = require('../models/userModel');
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateToken } = require('../config/jwtProvider.js');
const { sendOTPEmail } = require('../utils/sendOTPEmail');
const PasswordResetToken = require("../models/passwordResetToken.js");

const register = async (req, res) => {
    try {
        let { fullName, email, password, image } = req.body;
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            throw new Error(`User already exists with email: ${email}`);
        }
        password = await bcryptjs.hash(password, 8);
        const user = await User.create({
            fullName, email, password, image
        });
        const token = generateToken(user._id);
        return res.status(200).json({
            message: "Success",
            token
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

const login = async (req, res) => {
    const { password, email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: `User not found with email: ${email}`
            });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const jwt = generateToken(user._id);
        return res.status(200).json({
            message: "Login Success",
            jwt
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
        const obj = userRes.data;
        return res.status(200).json({
            message: 'Success',
            obj
        });
    } catch (e) {
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const generateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await sendOTPEmail(email);
        res.status(200).json({
            message: `OTP sent to email: ${email}`
        });
    } catch (err) {
        res.status(500).json({ message: 'Error sending OTP' });
    }
}

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (Date.now() > user.otpExpiresAt) return res.status(400).json({ message: 'OTP expired' });

    const isMatch = await bcryptjs.compare(otp, user.otp);
    if (isMatch) {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const resetToken = await PasswordResetToken.findOne({ token }).populate('user');
        if (!resetToken) {
            throw new Error("Reset Token is required");
        }
        if (resetToken.isExpired()) {
            await PasswordResetToken.deleteOne({ _id: resetToken._id });
            throw new Error("Token is expired");
        }
        const user = resetToken.user;
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        await PasswordResetToken.findByIdAndDelete(resetToken._id);
        res.status(200).json({ message: "Password updated successfully", status: true });
    } catch (err) {
        res.status(err instanceof Error ? 400 : 500).json({ error: err.message });
    }
}

const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const resetToken = crypto.randomUUID();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);

        await PasswordResetToken.create({
            token: resetToken,
            user,
            expiryDate
        });

        let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Password Reset",
            text: `Click the following link to reset your password: http://localhost:5173/account/reset-password?token=${resetToken}`,
        });

        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: `Error sending password reset email: ${err.message}` });
    }
}

module.exports = { googleLogin, register, login,generateOTP, verifyOTP, resetPasswordRequest, resetPassword };
