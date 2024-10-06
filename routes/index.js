const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');



router.post('/login', indexController.handleUserSignIn);
router.post('/signup', indexController.handleUserSignUp);
router.post('/verifyLogin', indexController.verifyUserLogIn);

router.put('/settings/username', indexController.handleUsernameChange);
router.put('/settings/email', indexController.handleEmailChange);
router.put('/settings/password', indexController.handlePasswordChange);
router.put('/settings/avatarUrl', indexController.handleAvatarChange);

module.exports = router;
