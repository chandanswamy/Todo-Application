const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dataBasePath = path.join(__dirname, "todoApplication.db");

let dataBase = null;

const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status = "%__%", priority = "%__%", search_q = "" } = request.query;
  const getTodosQuery = `
  SELECT 
    * 
  FROM
    todo
  WHERE
    status LIKE '${status}'
    AND priority LIKE '${priority}'
    AND todo LIKE '%${search_q}%';`;

  const todosArray = await dataBase.all(getTodosQuery);
  response.send(todosArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT 
    * 
  FROM
    todo
  WHERE
    id LIKE ${todoId};`;

  const todo = await dataBase.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const postTodoQuery = `
  INSERT INTO 
    todo (id,todo,priority,status)
  VALUES
    (
        ${id},
       "${todo}",
       "${priority}",
       "${status}"
    );`;

  await dataBase.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { status, priority, todo } = todoDetails;
  if (priority === undefined && todo === undefined) {
    const updateTodoQuery = `
    UPDATE
        todo
    SET
        status="${status}"
    WHERE id = ${todoId};`;

    await dataBase.run(updateTodoQuery);
    response.send("Status Updated");
  }
  if (status === undefined && todo === undefined) {
    const updateTodoQuery = `
    UPDATE
        todo
    SET
        priority="${priority}"
    WHERE id = ${todoId};`;

    await dataBase.run(updateTodoQuery);
    response.send("Priority Updated");
  }
  if (status === undefined && priority === undefined) {
    const updateTodoQuery = `
    UPDATE
        todo
    SET
        todo="${todo}"
    WHERE id = ${todoId};`;

    await dataBase.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM todo
  WHERE id=${todoId};`;

  await dataBase.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
