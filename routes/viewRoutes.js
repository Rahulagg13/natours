const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const router = express.Router();

router.get('/me', authController.protect, viewController.getMe);
router.use(authController.isLoggedIn);
router.get('/', viewController.getOverview);
router.get('/tour/:slug', authController.protect, viewController.getTour);
router.get('/login', viewController.loginForm);

module.exports = router;
