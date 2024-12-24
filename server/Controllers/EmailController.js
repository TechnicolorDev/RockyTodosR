const { Admin, sequelize } = require('../database/database');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../Services/emailService');
const jobQueue = require('../queue/exports/queue');
const bcrypt = require('bcrypt');
const chalk = require('chalk');
require('dotenv').config();
const { csrfInstance } = require('../protection/csrfProtection');
const { User } = require("../Controllers/admin/user");
const crypto = require('crypto');
const validator = require('validator');
class EmailController {
    static csrfStore = new Map();

    static async saveCSRFToken(token, expirationInSeconds) {
        const expirationTime = Date.now() + expirationInSeconds * 1000;
        EmailController.csrfStore.set(token, expirationTime);

        setTimeout(() => {
            EmailController.csrfStore.delete(token);
            console.log(`CSRF token ${token} expired and removed from memory.`);
        }, expirationInSeconds * 1000);
    }

    static async validateAndRemoveCSRFToken(token) {
        const expirationTime = EmailController.csrfStore.get(token);
        if (!expirationTime || Date.now() > expirationTime) {
            EmailController.csrfStore.delete(token);
            return false;
        }
        EmailController.csrfStore.delete(token);
        return true;
    }

    static async sendForgotPasswordEmail(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: "Email is required." });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }

            console.log(`Received email: ${email}`);

            const admin = await User.findOne({
                where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('email')),
                    sequelize.fn('lower', email)
                )
            });

            if (admin) {

                const tokenLength = Math.floor(Math.random() * (48 - 24 + 1)) + 24;
                const resetToken = crypto.randomBytes(Math.ceil(tokenLength / 2)).toString('hex').slice(0, tokenLength);

                admin.resetToken = resetToken;
                admin.resetTokenExpires = new Date(Date.now() + 3600 * 1000);
                await admin.save();

                const encodedEmail = encodeURIComponent(email);
                const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}&email=${encodedEmail}`;

                console.log("Generated reset link:", resetLink);

                const csrfToken = await csrfInstance.secret();
                console.log("Generated raw CSRF Token:", csrfToken);

                await EmailController.saveCSRFToken(csrfToken, 3600);
                res.setHeader('X-CSRF-Token', csrfToken);

                try {
                    await emailService.transporter.verify();
                    console.log(chalk.green('SMTP connection successful. Proceeding with sending email.'));
                } catch (smtpError) {
                    console.error(chalk.red('SMTP Error:', smtpError));
                    return res.status(500).json({ error: "SMTP configuration is invalid or connection failed." });
                }
                const job = await jobQueue.add('sendEmail', {
                    to: email,
                    subject: "Password Reset Request",
                    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
                    html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
                });

                console.log(chalk.yellow(`Job #${job.id} started for sending password reset email to: ${email}`));
            } else {
                console.log(`No user found with email: ${email}`);
            }

            res.status(202).json({ message: "If this email exists, a password reset link has been sent." });

        } catch (error) {
            console.error("Error sending password reset email:", error);
            res.status(500).json({ error: "Failed to send password reset email." });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ error: "Token and new password are required." });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters long." });
            }

            if (!validator.isLength(newPassword, { min: 8, max: 20 })) {
                return res.status(400).json({ error: "Password must be between 8 and 20 characters long." });
            }

            const admin = await User.findOne({
                where: { resetToken: token },
            });

            if (!admin) {
                return res.status(404).json({ error: "Invalid or expired token." });
            }

            if (admin.resetTokenExpires < Date.now()) {
                return res.status(400).json({ error: "Reset token has expired." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            admin.password = hashedPassword;
            admin.resetToken = null;
            admin.resetTokenExpires = null;
            await admin.save();

            res.status(200).json({ message: "Password reset successfully." });
        } catch (error) {
            console.error("Error in password reset:", error);
            res.status(500).json({ error: "An error occurred while resetting the password." });
        }
    }
}

module.exports = EmailController;
