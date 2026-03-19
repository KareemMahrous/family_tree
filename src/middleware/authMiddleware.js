const jwt = require("jsonwebtoken");

const config = require("../config");
const userRepository = require("../repositories/userRepository");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error(req.t("authorizationHeaderRequired"));
      error.status = 401;
      throw error;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error(req.t("invalidAuthorizationFormat"));
      error.status = 401;
      throw error;
    }

    let payload;

    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (verificationError) {
      const error = new Error(req.t("invalidOrExpiredToken"));
      error.status = 401;
      throw error;
    }

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      const error = new Error(req.t("userNotFound"));
      error.status = 401;
      throw error;
    }

    req.user = user;
    req.auth = payload;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
