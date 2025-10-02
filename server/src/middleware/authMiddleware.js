// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

module.exports = function(req, res, next) {
    // 1. Get token from header
    const authHeader = req.header('Authorization');

    // 2. Check if no token
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // The token is expected in the format "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Token format is invalid, authorization denied' });
    }

    try {
        //console.log('SECRET USED FOR VERIFYING:', process.env.JWT_SECRET);
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Add user from payload to the request object
        req.user = decoded.user;
        next(); // Move on to the next piece of middleware or the route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};