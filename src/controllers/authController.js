const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validators = require('../utils/validators');
const environment = require('../config/environment');

exports.register = async (req, res) => {
    // Accept first_name, last_name, email, password
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'first_name, last_name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send('User already registered.');

    // Auto-generate username: first letter of first name + last name, max 8 chars, all lowercase
    let baseUsername = (first_name[0] + last_name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
        username = (baseUsername + counter).slice(0, 8);
        counter++;
    }

    const user = new User({
        username,
        email,
        password, // Password will be hashed by the pre-save hook
        first_name,
        last_name
    });

    try {
        await user.save();
        const token = jwt.sign({ _id: user._id }, environment.JWT_SECRET);
        res.status(201).json({ token, username });
    } catch (err) {
        res.status(500).send('Server error.');
    }
};

exports.login = async (req, res) => {
    const validation = validators.validateUserLogin(req.body);
    if (!validation.isValid) return res.status(400).json(validation.errors);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await user.comparePassword(req.body.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign({ _id: user._id }, environment.JWT_SECRET);
    res.header('x-auth-token', token).send({ token, username: user.username });
};