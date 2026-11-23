const bcrypt = require('bcrypt');
const { User } = require('../models');

function showRegisterForm(req, res) {
    res.render('auth/register', { user: {}, errors: [] });
}

async function register(req, res, next) {
    const formData = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.errors.length > 0) {
        return res.status(400).render('auth/register', { user: formData, errors: req.errors });
    }

    try {
        const sameEmail = await User.findOne({ where: { email: formData.email } });
        if (sameEmail) {
            return res.status(409).render('auth/register', {
                user: formData,
                errors: ['Пользователь с таким email уже зарегистрирован']
            });
        }

        const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(req.body.password, rounds);

        await User.create({
            name: formData.name,
            email: formData.email,
            password: hashedPassword
        });

        res.redirect('/login?registered=1');
    } catch (error) {
        next(error);
    }
}

function showLoginForm(req, res) {
    let message = '';
    if (req.query.registered === '1') {
        message = 'Регистрация прошла успешно. Теперь можно войти.';
    }
    res.render('auth/login', { email: '', errors: [], message: message });
}

async function login(req, res, next) {
    const email = req.body.email;

    if (req.errors.length > 0) {
        return res.status(400).render('auth/login', { email: email, errors: req.errors, message: '' });
    }

    try {
        const user = await User.findOne({ where: { email: email } });

        let isPaswordCorrect = false;
        if (user) {
            isPaswordCorrect = await bcrypt.compare(req.body.password, user.password);
        }

        if (!user || !isPaswordCorrect) {
            return res.status(401).render('auth/login', {
                email: email,
                errors: ['Неверный email или пароль'],
                message: ''
            });
        }

        user.lastLogin = new Date();
        await user.save();

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
}

function logout(req, res, next) {
    req.session.destroy(function (error) {
        if (error) {
            return next(error);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
}

async function showProfile(req, res, next) {
    try {
        const user = await User.findByPk(req.session.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'lastLogin', 'createdAt']
        });

        if (!user) {
            return req.session.destroy(function () {
                res.redirect('/login');
            });
        }

        res.render('profile', {
            user: user,
            sessionUser: req.session.user,
            sessionId: req.sessionID,
            sessionExpires: req.session.cookie.expires
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    showRegisterForm,
    register,
    showLoginForm,
    login,
    logout,
    showProfile
};
