const bcrypt = require('bcrypt');
const { User } = require('./admin/user');
const { Role } = require('./admin/roles');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const { jobQueue} = require("../queue/exports/queue")
const crypto = require('crypto');

class AdminController {
    static async install(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: "All fields are required." });
            }

            const existingAdmin = await User.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(400).json({ error: "Admin already exists" });
            }
            res.status(202).json({ message: "Admin account creation is in progress." });

        } catch (error) {
            console.error("Error setting up admin:", error);
            res.status(500).json({ error: "Failed to setup admin." });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required!" });
            }

            const user = await User.findOne({
                where: { email: email.trim() },
                include: {
                    model: Role,
                    as: 'Role',
                },
            });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials!" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid credentials!" });
            }

            const payload = {
                userId: user.userId,
                role: user.Role.name,
                username: user.name,
                email: user.email,
            };

            const token = jwt.sign(payload, process.env.APP_KEY, { expiresIn: '24h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
            });
            const emailHash = crypto.createHash('md5').update(user.email.trim().toLowerCase()).digest('hex');

            const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=80&d=identicon`;

            return res.status(200).json({
                message: "Login successful",
                userId: user.userId,
                role: user.Role.name,
                username: user.name,
                email: user.email,
                gravatarUrl,
            });

            } catch (error) {
            console.error(chalk.red("Error during login", error));
            return res.status(500).json({ error: "Login failed" });
        }
    }

    static async checkLogin(req, res, next) {
        try {
            const token = req.cookies?.token;
            if (!token) {
                return res.status(401).json({
                    status: 401,
                    message: "No valid session, please log in.",
                    isLoggedOutOrNeverLoggedIn: true,
                });
            }
            const decoded = await jwt.verify(token, process.env.APP_KEY);

            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                username: decoded.username,
                email: decoded.email,
            };

            console.log(`User successfully authenticated: ${decoded.username} (${decoded.email}) (${decoded.role}) (${decoded.userId})`);

            const gravatarHash = crypto.createHash('md5').update(decoded.email.trim().toLowerCase()).digest('hex');
            const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}?s=80&d=identicon`;

            return res.status(200).json({
                status: 200,
                message: "Session is valid.",
                isLoggedIn: true,
                userId: decoded.userId,
                role: decoded.role,
                username: decoded.username,
                email: decoded.email,
                gravatarUrl: gravatarUrl,
            });

        } catch (error) {
            const handle401Error = (message) => {
                return res.status(401).json({
                    status: 401,
                    message,
                    isLoggedIn: false,
                });
            };
            if (error.name === "JsonWebTokenError") {
                console.log("Invalid token error:", error);
                return handle401Error("Invalid token. Please log in again.");
            }
            if (error.name === "TokenExpiredError") {
                console.log("Expired token error:", error);
                return handle401Error("Token expired. Please log in again.");
            }

            console.error("Unexpected error in checkLogin:", error);
            return res.status(500).json({
                status: 500,
                message: "An error occurred while checking login status. Please try again later.",
            });
        }
    }
    static async logOut(req, res) {
        try {
            res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

            res.cookie('loggedOutAt', new Date().toISOString(), { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

            const { csrfTokens } = req.body;

            if (csrfTokens && csrfTokens.length > 0) {
                csrfTokens.forEach(token => {
                    jobQueue.add('delete-csrf-token', { token });
                });
                console.log(chalk.blue(`Enqueued ${csrfTokens.length} CSRF token deletion jobs.`));
            } else {
                console.log(chalk.yellow('No CSRF tokens received to delete.'));
            }

            jobQueue.process('delete-csrf-token', async (job) => {
                try {
                    const { token } = job.data;

                    jobQueue.client.del(`csrfToken:${token}`, (err, result) => {
                        if (err) {
                            console.error(chalk.red(`Error deleting CSRF token from Redis: ${token}`, err));
                        } else {
                            if (result === 1) {
                                console.log(chalk.green(`CSRF token ${token} deleted from Redis successfully.`));
                            } else {
                                console.log(chalk.yellow(`CSRF token ${token} not found in Redis.`));
                            }
                        }
                    });
                } catch (error) {
                    console.error(chalk.red('Error processing job:', error));
                }
            });

            res.json({ message: 'Logged out successfully' });

        } catch (error) {
            console.error(chalk.red("Error during logout", error));
            res.status(500).json({ message: 'Logout failed' });
        }
    }

}

module.exports = AdminController;
