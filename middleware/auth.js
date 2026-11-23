function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }

    if (req.method === 'GET') {
        return res.redirect('/login');
    }

    const error = new Error('Чтобы выполнить это действие, нужно войти в систему');
    error.status = 401;
    next(error);
}

function isAdmin(req, res, next) {
    if (!req.session.user) {
        return isAuthenticated(req, res, next);
    }

    if (req.session.user.role !== 'admin') {
        const error = new Error('У вас нет прав для выполнения этого действия');
        error.status = 403;
        return next(error);
    }

    next();
}

function isGuest(req, res, next) {
    if (req.session.user) {
        return res.redirect('/profile');
    }
    next();
}

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest
};
