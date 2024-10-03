const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');


router.post('/login', indexController.handleUserSignIn);
router.post('/verifyLogin', indexController.handleLoggedInVerification);
router.post('/signup', indexController.handleUserSignUp);
router.post('/logout', indexController.handleUserSignOut);


module.exports = router;
