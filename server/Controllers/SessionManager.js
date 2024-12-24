const { checkLogin } = require('./AdminController'); // Import checkLogin from your controller

const requireSession = async (req, res, next) => {
    try {
        const loginStatus = await checkLogin(req, res);

        if (loginStatus.isLoggedIn) {
            return next();
        } else {
            return res.status(loginStatus.status).json({
                status: loginStatus.status,
                message: loginStatus.message
            });
        }
    } catch (error) {
        console.error("Error in requireSession middleware:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error."
        });
    }
};

module.exports = { requireSession };
