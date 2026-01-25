const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Access denied. No role found.' });
        }

        // Admin role has all privileges - can access any route
        if (req.user.role === 'admin') {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = checkRole;
