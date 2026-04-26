const mongoose = require("mongoose");
const API_ENDPOINTS = require("../constants/route");
const Todo = require("../models/Todo");
const sendResponse = require("../utils/response");

async function createTodo(taskName) {
  const newTodo = new Todo({ taskName });
  return await newTodo.save();
}

async function getAllTodos() {
  return await Todo.find();
}

async function getTodoById(id) {
  return Todo.findById(id);
}

async function findTodoByIdAndUpdate(id, updates) {
  return Todo.findByIdAndUpdate(
    id,
    { $set: updates },
    { runValidators: true, returnDocument: "after" },
  );
}

async function findTodoByIdAndDelete(id) {
  return Todo.findByIdAndDelete(id);
}

function extractIdFromURL(req) {
  const parts = req.url?.split("/");
  const id = parts.length > 3 ? parts[3]?.split("?")[0] : null;

  return { id };
}

function handleInvalidId(req, res, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendResponse(req, res, 400, "Invalid todo id");
    return true;
  }
}

function handleNotFoundTodo(req, res, data) {
  if (!data) {
    sendResponse(req, res, 404, "Todo not found");
    return true;
  }
}

async function todo(req, res) {
  const { id } = extractIdFromURL(req);
  const routeMatched = req.url.startsWith(API_ENDPOINTS.TODO);

  if (req.method === "GET" && routeMatched && !id) {
    try {
      const response = await getAllTodos();
      sendResponse(req, res, 200, "Todo fetched successfully", response);
      return true;
    } catch (error) {
      console.error("Failed to fetch todos", error);
      sendResponse(req, res, 500, "Internal server error");
      return true;
    }
  }

  if (req.method === "GET" && routeMatched && id) {
    try {
      if (handleInvalidId(req, res, id)) return true;

      const todo = await getTodoById(id);
      if (handleNotFoundTodo(req, res, todo)) return true;

      sendResponse(req, res, 200, "Todo details fetched successfully", todo);
      return true;
    } catch (error) {
      console.error("Error finding todo by id", error);
      sendResponse(req, res, 500, "Internal server error");
      return true;
    }
  }

  if (req.method === "POST" && routeMatched) {
    return new Promise((resolve) => {
      const body = [];

      req.on("data", (chunks) => {
        body.push(chunks);
      });

      req.on("end", async () => {
        try {
          const parsedBody = JSON.parse(Buffer.concat(body).toString());
          const { taskName } = parsedBody;

          if (!taskName) {
            sendResponse(req, res, 400, "taskName is required", parsedBody);
            resolve(true);
          }

          const response = await createTodo(taskName);
          sendResponse(req, res, 201, "Todo created successfully", response);

          resolve(true);
        } catch (error) {
          console.error("Failed to parse JSON", error);
          sendResponse(req, res, 400, "Invalid JSON format");
          resolve(true);
        }
      });
    });

    return true;
  }

  if (req.method === "PATCH" && routeMatched && id) {
    if (handleInvalidId(req, res, id)) return true;

    return new Promise((resolve) => {
      const body = [];
      req.on("data", (chunks) => {
        body.push(chunks);
      });

      req.on("end", async () => {
        try {
          const updates = JSON.parse(Buffer.concat(body).toString());

          const updatedTodo = await findTodoByIdAndUpdate(id, updates);

          if (handleNotFoundTodo(req, res, updatedTodo)) return resolve(true);

          sendResponse(req, res, 200, "Todo updated successfully", updatedTodo);
          resolve(true);
        } catch (error) {
          console.error("Failed to parse body", error);
          sendResponse(req, res, 400, "Invalid JSON Format");
          resolve(true);
        }
      });
    });
  }

  if (req.method === "DELETE" && routeMatched && id) {
    if (handleInvalidId(req, res, id)) return true;

    try {
      const deletedTodo = await findTodoByIdAndDelete(id);
      if (handleNotFoundTodo(req, res, deletedTodo)) {
        return true;
      }

      sendResponse(req, res, 200, "Todo deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete todo", error);
      sendResponse(req, res, 500, "Internal server error");

      return true;
    }
  }

  return false;
}

module.exports = todo;
