const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');
const env = require('../../config/env');

async function register(email, password) {
    const existing = await authModel.findByEmail(email);
    if (existing) {
        throw new Error('Email already in use');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await authModel.createUser(email, hashedPassword);
    return { id: newUser.id, email: newUser.email };
}

async function login(email, password) {
    const user = await authModel.findByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, env.JWT_SECRET, {
        expiresIn: '1h',
    });

    return { token };
}


module.exports = { register, login };