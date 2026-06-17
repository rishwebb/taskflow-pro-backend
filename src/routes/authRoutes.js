const express = require('express');

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const {
  emailRules,
  loginRules,
  registerRules,
  resetPasswordRules,
  tokenBodyRules,
  tokenParamRules
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

router.post('/verify-email', authLimiter, tokenBodyRules, validate, authController.verifyEmail);
router.get('/verify-email/:token', authLimiter, tokenParamRules, validate, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authenticate, authController.resendVerification);

router.post('/forgot-password', authLimiter, emailRules, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, authController.resetPassword);

module.exports = router;
