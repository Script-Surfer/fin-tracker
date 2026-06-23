const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

// helpers
const signToken = (user) => {
    return jwt.sign(
        {id: user._id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
}

const userPayLoad = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency
});


const registerUser = async (req,res) => {
    try {
        const {name, email, password, confirmPassword} = req.body;

        if(!name || !email || !password || !confirmPassword){
            return res.status(400).json({
                message: "All the fields are required."
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase()});

        if(existing){
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
        const token = signToken(user);

        res.status(201).json({ token, user: userPayLoad(user)});
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message});
    }
};


const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase()});
        if(!user){
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = signToken(user);
        res.json({ token, user: userPayLoad(user) });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message});
    }
};

const getMe = async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if(!user){
            return res.status(404).json({
                message: "User not found."
            });
        }
        res.json(userPayLoad(user));
    } catch (err) {
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// PUT /api/auth/password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/auth/settings
const updateSettings = async (req, res) => {
    try {
        const { currency } = req.body;

        if (!['INR', 'USD'].includes(currency)) {
            return res.status(400).json({ message: 'Currency must be INR or USD.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { currency },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json({ user: userPayLoad(user) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    changePassword,
    updateSettings,
}