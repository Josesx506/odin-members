const { body, validationResult } = require("express-validator");
const dbController = require('../controller/dbController');

const validateSignUp = [
    body("username")
      .trim()
      .matches(/^[a-zA-Z0-9\s]+$/).withMessage(`Username must contain only letters and numbers`)
      .isLength({ min: 5, max: 10 }).withMessage(`Username must be between 5 and 10 characters`)
      .escape(),
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage(`Invalid email value`)
        .custom(async (value) => {
          const isAvailable = await dbController.isUserAvail(value.toLowerCase());
          if (!isAvailable) {
            throw new Error('This email is unavailable, try signing up with a different email');
          }
          return true;
        }),
    body("password")
      .trim()
      .escape()
      .isLength({ min: 5, max: 9 }).withMessage('Password must be between 5-9 characters long.')
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w<>]).{5,9}$/)
      .withMessage('Password must include at least one uppercase letter, one number, and one special character (excluding < or >).'),
    body("confirmPassword")
      .trim()
      .escape()
      .custom((value, {req})=>{
        if (value != req.body.password) {
          throw new Error('Password mismatch!');
        }
        return true;
      })
];

const validateSignIn = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail(),
  body("password")
    .trim()
    .notEmpty().withMessage("Password cannot be empty.")
]

const validateJoin = [
  body("answer")
    .trim()
    .blacklist("<>")
    .isLength({ max: 10 }).withMessage("Answer must be at most 10 characters.")
]

const validatePosts = [
  body("title")
    .trim()
    .blacklist("<>")
    .isLength({ max: 128 }).withMessage("Title must be at most 128 characters long."),
  body("content")
    .trim()
    .blacklist("<>")
    .notEmpty().withMessage("Post body cannot be empty.")
    .isLength({ min: 10, max: 300 }).withMessage("Post body must be between 10 and 300 characters.")
]

module.exports = { validateSignUp, validateSignIn, validateJoin, validatePosts }