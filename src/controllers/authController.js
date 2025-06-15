const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validators = require('../utils/validators');
const environment = require('../config/environment');

exports.register = async (req, res) => {
    const validation = validators.validateUserRegistration(req.body);
    if (!validation.isValid) return res.status(400).json(validation.errors);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).send('User already registered.');

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, // Password will be hashed by the pre-save hook
    });

    try {
        await user.save();
        res.status(201).send('User registered successfully.');
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
    res.header('x-auth-token', token).send({ token });
};