const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // Make sure auth middleware ran first
        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized access."
            });
        }

        // Check if user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error:"FOrbiddend. You do not have permission."
            });
        }

        next();
    };
};

module.exports = authorizeRole;