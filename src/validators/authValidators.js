const { body, param } = require('express-validator');

const passwordRule = body('password')
  .isString()
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be 8 to 128 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must include a number');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage('Phone is too long'),
  passwordRule
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required')
];

const emailRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail()
];

const tokenBodyRules = [
  body('token').trim().isLength({ min: 32 }).withMessage('A valid token is required')
];

const tokenParamRules = [
  param('token').trim().isLength({ min: 32 }).withMessage('A valid token is required')
];

const resetPasswordRules = [
  body('token').trim().isLength({ min: 32 }).withMessage('A valid token is required'),
  passwordRule
];

module.exports = {
  registerRules,
  loginRules,
  emailRules,
  tokenBodyRules,
  tokenParamRules,
  resetPasswordRules
};
