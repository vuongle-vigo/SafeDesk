const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');
const env = require('../../config/env');

exports.login = async (email, password) => {
    const user = await authModel.findByEmail(email);
    console.log(user);
}