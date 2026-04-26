const env = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");

const connectDB = require("./config/db");
const todo = require("./routes/todo");
const sendResponse = require("./utils/response");
const handleCORS = require("./utils/handleCORS");

env.config();
const PORT = process.env.PORT ?? 8000;

connectDB();

const routes = [todo];

const server = http.createServer(async (req, res) => {
  const isPreflight = handleCORS(req, res);
  if (isPreflight) return;

  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
    return;
  }

  let isHandled = false;

  for (const routeHandler of routes) {
    isHandled = await routeHandler(req, res);
    if (isHandled) break;
  }

  if (!isHandled) {
    sendResponse(req, res, 404, "Resource not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
