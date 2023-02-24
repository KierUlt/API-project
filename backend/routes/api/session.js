const express = require('express');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { application } = require('express');

const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Please provide a valid email or username.'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a password.'),
    handleValidationErrors
];

router.post(
    '/',
    validateLogin,
    async (req, res, next) => {
      const { credential, password } = req.body;

      const user = await User.login({ credential, password });

      if (!user) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
      }

      // if(!credential || !password){
      //   const err = new Error('Validation error');
      //   err.status = 400;
      //   err.title = 'Login failed';
      //   err.errors = {};
      //   return next(err);
      // }

      await setTokenCookie(res, user);

      return res.json({
        user: user.toSafeObject()
      });
    }
  );

router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
);

router.get(
    '/',
    restoreUser,
    (req, res) => {
      const { user } = req;
      if (user) {
        return res.json({
          user: user.toSafeObject()
        });
      } else return res.json({ user: null });
    }
);

router.use((err, req, res, next) => {
  const errorMessage = {};
  if(err.status === 401){
    errorMessage.message = "Invalid credentials";
    errorMessage.statusCode = err.status
  }
  if(err.status === 400){
    errorMessage.message = "Validation error",
    errorMessage.statusCode = 400
    errorMessage.errors = err.errors;
  }
  res.status(err.status);
  return res.json(errorMessage)
});

module.exports = router;
