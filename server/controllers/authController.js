const User = require('../models/User');
const OTP = require('../models/OTP'); // ✅ Add this
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // ✅ Add this

// ========== REGISTER ==========
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 0,
                message: 'User already exists with this email or phone'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            status: 1,
            message: 'Registration successful! Please login.',
            data: {
                userId: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== LOGIN ==========
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: 1,
            message: 'Login successful!',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    address: user.address,
                    city: user.city,
                    joinDate: user.createdAt,
                    status: user.status
                }
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== GET USER PROFILE ==========
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 1,
            data: user
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== UPDATE PROFILE ==========
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, city } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, phone, address, city },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 1,
            message: 'Profile updated successfully!',
            data: user
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== CHANGE PASSWORD ==========
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                status: 0,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 1,
            message: 'Password changed successfully!'
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== FORGOT PASSWORD - SEND OTP ==========
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 0,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'No account found with this email'
            });
        }

        // Delete old OTPs for this email
        await OTP.deleteMany({ email, purpose: 'forgot-password' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database
        const otpDoc = new OTP({
            email,
            otp,
            purpose: 'forgot-password',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await otpDoc.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">🔐 Password Reset</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested to reset your password. Use the OTP below:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #007bff; padding: 15px; background: #f0f8ff; border-radius: 5px; text-align: center; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #666;">This OTP expires in 5 minutes.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 1,
            message: 'OTP sent to your email!',
            data: { email }
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== VERIFY OTP ==========
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 0,
                message: 'Email and OTP are required'
            });
        }

        // Find OTP in database
        const otpDoc = await OTP.findOne({ email, otp, purpose: 'forgot-password' });

        if (!otpDoc) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP is expired
        if (otpDoc.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({
                status: 0,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // OTP is valid - generate a temporary token for password reset
        const resetToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // Delete OTP (already verified)
        await OTP.deleteOne({ _id: otpDoc._id });

        res.status(200).json({
            status: 1,
            message: 'OTP verified successfully!',
            data: {
                token: resetToken
            }
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== RESET PASSWORD ==========
const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({
                status: 0,
                message: 'Token, email, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 0,
                message: 'Password must be at least 6 characters'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid or expired token. Please request a new OTP.'
            });
        }

        // Check if email matches
        if (decoded.email !== email) {
            return res.status(400).json({
                status: 0,
                message: 'Invalid token for this email'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 1,
            message: 'Password reset successfully! You can now login.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

// ========== RESEND OTP ==========
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 0,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 0,
                message: 'No account found with this email'
            });
        }

        // Delete old OTPs
        await OTP.deleteMany({ email, purpose: 'forgot-password' });

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP
        const otpDoc = new OTP({
            email,
            otp,
            purpose: 'forgot-password',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await otpDoc.save();

        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔄 New Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">🔄 New OTP</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested a new OTP for password reset:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #007bff; padding: 15px; background: #f0f8ff; border-radius: 5px; text-align: center; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #666;">This OTP expires in 5 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 1,
            message: 'New OTP sent to your email!'
        });

    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Server error. Please try again.'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword,
    resendOTP
};