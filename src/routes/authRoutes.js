const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

function sanitizeCurrentUser(user) {
  return {
    id: user.id,
    name: user.name,
    mobile: user.phone,
    verified: user.verified,
    isFamily: user.isFamily,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req.t);
    sendSuccess(res, {
      status: 201,
      message: req.t("registerSuccessful"),
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body, req.t);
    sendSuccess(res, {
      status: 200,
      message: req.t("loginSuccessful"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body, req.t);
    sendSuccess(res, {
      status: 200,
      message: req.t("otpGeneratedSuccessful"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body, req.t);
    sendSuccess(res, {
      status: 200,
      message: req.t("passwordResetSuccessful"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    sendSuccess(res, {
      status: 200,
      message: req.t("loginSuccessful"),
      data: sanitizeCurrentUser(req.user),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
