const env = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");

const connectDB = require("./config/db");
const todo = require("./routes/todo");
const sendResponse = require("./utils/response");

env.config();
const PORT = process.env.PORT ?? 8000;
const HOSTNAME = process.env.HOSTNAME ?? "localhost";

connectDB();

const routes = [todo];

const server = http.createServer(async (req, res) => {
  let isHandled = false;

  for (const routeHandler of routes) {
    isHandled = await routeHandler(req, res);
    if (isHandled) break;
  }

  if (!isHandled) {
    sendResponse(req, res, 404, "Resource not found");
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server is listening on port: ${PORT} and hostname: ${HOSTNAME}`);
});
