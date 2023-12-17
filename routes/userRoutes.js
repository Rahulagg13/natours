const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.isLoggedOut);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateData', userController.updateUserData);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
