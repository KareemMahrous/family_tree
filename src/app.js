const express = require("express");

const i18nMiddleware = require("./middleware/i18nMiddleware");
const authRoutes = require("./routes/authRoutes");
const familyMemberRoutes = require("./routes/familyMemberRoutes");
const { sendSuccess, sendError } = require("./utils/response");

const app = express();

app.use(express.json());
app.use(i18nMiddleware);

app.get("/", (req, res) => {
  sendSuccess(res, {
    status: 200,
    message: req.t("appRunning"),
    data: null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/family-members", familyMemberRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  sendError(res, {
    status,
    message: err.message || req.t("internalServerError"),
  });
});

module.exports = app;
