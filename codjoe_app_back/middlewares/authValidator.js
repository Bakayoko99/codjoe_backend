
const { body } = require('express-validator');

const signUpValidator = [
    body('firstName').notEmpty().trim().escape().withMessage('First name is required'),
    body('lastName').notEmpty().trim().escape().withMessage('Last name is required'),
    body('address').optional().trim().escape().isLength({ min: 4, max: 75 }).withMessage('Address is required'),
    // body('telephone').optional().trim().escape().isInt().isLength({ min: 9 }).withMessage('Telephone is required'),
    body('email').isEmail().withMessage('Email is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('birthday').notEmpty().isDate().withMessage('Must be a valid date'),
    body('password').notEmpty().trim().isLength({ min: 6, max: 15 }).withMessage('Password is required')
];

const loginValidator = [
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6, max: 15 }).withMessage('Password is required')
];

module.exports = { signUpValidator, loginValidator };