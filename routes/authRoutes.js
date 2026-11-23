const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validation');

router.get('/register', isGuest, controller.showRegisterForm);
router.post('/register', isGuest, registerRules, controller.register);
router.get('/login', isGuest, controller.showLoginForm);
router.post('/login', isGuest, loginRules, controller.login);
router.post('/logout', controller.logout);
router.get('/profile', isAuthenticated, controller.showProfile);

module.exports = router;
