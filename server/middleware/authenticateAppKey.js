require('dotenv').config();
const crypto = require('crypto');

const authenticateAppKey = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized access.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized access.' });
        }

        const appKey = process.env.APP_KEY;
        if (!appKey) {
            console.error('Application key is missing in the environment variables.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const appKeyBuffer = Buffer.from(appKey, 'utf-8');
        const tokenBuffer = Buffer.from(token, 'utf-8');

        if (appKeyBuffer.length !== tokenBuffer.length ||
            !crypto.timingSafeEqual(appKeyBuffer, tokenBuffer)) {
            return res.status(401).json({ error: 'Unauthorized access.' });
        }

        next();
    } catch (error) {
        console.error('Error in authentication middleware:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = authenticateAppKey;
