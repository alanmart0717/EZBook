const { v4: uuidv4 } = require("uuid");
const db = require("../data/db");

exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;

  const user = {
    id: uuidv4(),
    name,
    email,
    password,
    role
  };

  db.users.push(user);
  res.status(201).json(user);
};

exports.getUsers = (req, res) => {
  res.json(db.users);
};