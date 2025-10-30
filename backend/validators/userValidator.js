import { body } from "express-validator";

// ---------------- Register Validator ----------------
export const userRegistorValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 5 })
      .withMessage("Username must be of at least 5 letters"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password can't be empty")
      .isLength({ min: 7 })
      .withMessage("Password must be at least 7 characters"),

    body("name").trim().notEmpty().withMessage("Enter valid name"),
  ];
};

// ---------------- Login Validator ----------------
export const userLoginValidator = () => {
  return [
    body("username").optional().notEmpty().withMessage("Incorrect username"),
    body("email").isEmail().withMessage("Incorrect Email"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

// ---------------- Change Password Validator ----------------
export const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

// ---------------- Forgot Password Validator ----------------
export const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

// ---------------- Reset Forgot Password Validator ----------------
export const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};
