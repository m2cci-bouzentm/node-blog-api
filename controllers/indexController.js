const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');


const validateUserSignUp = [
  body('username')
    .trim()
    .notEmpty().withMessage('Comment content cannot be empty')
    .isLength({ min: 1, max: 1500 }).withMessage('Comment content must be at least 1 characters long')
];



// TODO user validation && asyncHandler
const handleUserSignIn = (req, res, next) => {

}
const handleUserSignUp = (req, res, next) => {

}
const handleUserSignOut = (req, res, next) => {

}





module.exports = {
  handleUserSignIn,
  handleUserSignUp,
  handleUserSignOut,

};