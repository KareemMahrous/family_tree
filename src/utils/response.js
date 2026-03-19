function buildResponse({ success, status, message, data = null }) {
  return {
    success,
    status,
    message,
    data,
    timestamp: new Date().toISOString().substring(0, 10),
  };
}

function sendSuccess(res, { status = 200, message, data = null }) {
  return res.status(status).json(
    buildResponse({
      success: true,
      status,
      message,
      data,
    }),
  );
}

function sendError(res, { status = 500, message = "internal server error", data = null }) {
  return res.status(status).json(
    buildResponse({
      success: false,
      status,
      message,
      data,
    }),
  );
}

module.exports = {
  sendSuccess,
  sendError,
};
