const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Access denied. No token provided."
            });
        }

        // Expected format: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Invalid token format."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Normalize user object (IMPORTANT FIX)
        req.user = {
            userId: decoded.userId || decoded.user_id || decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
};

module.exports = authenticateUser;