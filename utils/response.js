function sendResponse(req, res, statusCode, message, response) {
  res.statusCode = statusCode;

  res.setHeader("Content-Type", "application/json");

  const responsePayload = {
    statusCode,
    message,
  };

  if (response) {
    responsePayload.response = response;
  }

  res.end(JSON.stringify(responsePayload));
}

module.exports = sendResponse;
