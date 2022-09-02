const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "user already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todos)

  return response.status(201).json(todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const indexTodo = user.todos.findIndex((todos) => todos.id === id);

  if (indexTodo < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const todoInfoChange = user.todos[indexTodo];

  title ? todoInfoChange.title = title : false;
  deadline ? todoInfoChange.deadline = deadline : false;

  return response.status(201).json(todoInfoChange);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex((todos) => todos.id === id);

  if (indexTodo < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos[indexTodo].done = true;

  return response.status(201).json(user.todos[indexTodo]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex((todos) => todos.id === id);

  if (indexTodo < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;