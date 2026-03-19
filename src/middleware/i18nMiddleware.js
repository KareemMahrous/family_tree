const { getLocaleFromHeader, createTranslator } = require("../utils/i18n");

function i18nMiddleware(req, res, next) {
  const locale = getLocaleFromHeader(req.headers["accept-language"]);

  req.locale = locale;
  req.t = createTranslator(locale);

  next();
}

module.exports = i18nMiddleware;
