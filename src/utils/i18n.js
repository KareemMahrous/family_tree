const messages = require("../i18n/messages");

function getLocaleFromHeader(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return "en";
  }

  const [primaryLanguage] = headerValue.split(",");
  const normalizedLanguage = primaryLanguage.trim().toLowerCase();

  if (normalizedLanguage.startsWith("ar")) {
    return "ar";
  }

  return "en";
}

function translate(locale, key) {
  const dictionary = messages[locale] || messages.en;
  return dictionary[key] || messages.en[key] || key;
}

function createTranslator(locale) {
  return (key) => translate(locale, key);
}

module.exports = {
  getLocaleFromHeader,
  createTranslator,
};
