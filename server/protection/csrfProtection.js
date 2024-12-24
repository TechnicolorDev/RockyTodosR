const csrf = require('csrf');
const csrfInstance = new csrf();
const jobQueue = require('../queue/exports/queue');
const chalk = require('chalk');
const moment = require('moment-timezone');
const path = require('path');

const CSRF_TOKEN_EXPIRY = 365 * 24 * 60 * 60;

const client = jobQueue.client;

const ensureRedisConnected = async () => {
    return new Promise((resolve, reject) => {
        if (client.status === 'ready') {
            console.log(chalk.green('Redis client is already connected.'));
            resolve();
        } else {
            client.once('ready', () => {
                console.log(chalk.green('Redis client connected successfully.'));
                resolve();
            });
            client.once('error', (err) => {
                console.error(chalk.red('Redis connection error:', err));
                reject(err);
            });
        }
    });
};
const storeCSRFTokenInRedis = (csrfToken) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.blue(`Storing CSRF token in Redis`));

        client.set(`csrfToken:${csrfToken}`, csrfToken, (err, reply) => {
            if (err) {
                console.error(chalk.red('Error storing CSRF token in Redis:', err));
                return reject(err);
            }
            console.log(chalk.green(`CSRF Token stored permanently in Redis`));
            resolve(reply);
        });
    });
};

const nonSessionCSRFToken = async (req, res, next) => {
    try {
        console.log(chalk.yellow('Generating non-session CSRF token...'));

        const secret = await csrfInstance.secret();
        const csrfToken = csrfInstance.create(secret);
        res.locals.csrfToken = csrfToken;
        console.log(chalk.green('Generated Non-Session CSRF Token:', csrfToken));
        await storeCSRFTokenInRedis(req.userID || req.sessionID, csrfToken, false);
        res.setHeader('X-CSRF-Token', csrfToken);
        next();
    } catch (error) {
        console.error(chalk.red('Error generating non-session CSRF token:', error));
        res.status(500).json({ error: 'Failed to generate non-session CSRF token' });
    }
};

const sessionCSRFToken = async (req, res, next) => {
    try {
        console.log(chalk.yellow('Generaing CSRF token...'));

        const secret = await csrfInstance.secret();
        const csrfToken = csrfInstance.create(secret);
        res.locals.csrfToken = csrfToken;

        console.log(chalk.green('Generated CSRF Token:', csrfToken));

        await ensureRedisConnected();

        await storeCSRFTokenInRedis(csrfToken);

        res.setHeader('X-CSRF-Token', csrfToken);

        console.log(chalk.green('CSRF Token set in response header.'));

        next();

    } catch (error) {
        console.error(chalk.red('Error generating CSRF token:', error));
        return res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
};

const getCSRFTokenFromRedis = async (csrfToken) => {
    return new Promise((resolve, reject) => {
        client.get(`csrfToken:${csrfToken}`, (err, result) => {
            if (err) {
                console.error(chalk.red('Error retrieving CSRF token from Redis:', err));
                return reject(err);
            }
            if (!result) {
                console.error(chalk.red('CSRF token not found in Redis.'));
            }
            resolve(result);
        });
    });
};
const verifyCSRFToken = async (req, res, next) => {
    try {
        console.log(chalk.yellow('Verifying CSRF token...'));
        const csrfToken = req.header('X-CSRF-Token');
        console.log(chalk.green('CSRF Token from headers:', csrfToken));
        if (!csrfToken) {
            console.error(chalk.red('CSRF token is missing.'));
            return res.status(403).json({ error: 'CSRF token is missing' });
        }
        const storedToken = await getCSRFTokenFromRedis(csrfToken);
        console.log(chalk.blue('Stored CSRF Token:', storedToken));
        if (storedToken !== csrfToken) {
            console.error(chalk.red('CSRF token mismatch.'));
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }

        console.log(chalk.green('CSRF token verified successfully.'));
        next();

    } catch (error) {
        console.error(chalk.red('Error verifying CSRF token:', error));
        return res.status(500).json({ error: 'Internal server error while verifying CSRF token' });
    }
};

module.exports = {
    sessionCSRFToken,
    verifyCSRFToken,
    csrfInstance,
    nonSessionCSRFToken
};
