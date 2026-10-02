const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// Get all users
const getAuth = (req, res) => {
  db.query("SELECT id, username, email, role FROM login", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(result);
  });
};

// Register user
const postAuth = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (!["User", "Employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    db.query(
      "SELECT * FROM login WHERE username=? OR email=?",
      [username, email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "Username or Email already exists",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO login(username,email,password,role) VALUES(?,?,?,?)",
          [username, email, hashedPassword, role],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                message: err.message,
              });
            }

            const token = jwt.sign(
              {
                id: result.insertId,
                username,
                role,
              },
              SECRET_KEY,
              {
                expiresIn: "1d",
              },
            );

            res.status(201).json({
              message: "User Registered Successfully",
              token,
              id: result.insertId,
              username,
              role,
            });
          },
        );
      },
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const checkLogin = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  db.query(
    "SELECT * FROM login WHERE username=?",
    [username],
    async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Wrong Username",
        });
      }

      const user = result[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Wrong Password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        SECRET_KEY,
        {
          expiresIn: "1d",
        },
      );

      res.json({
        message: "Login Successful",
        token,
        id: user.id,
        username: user.username,
        role: user.role,
      });
    },
  );
};

const getMe = (req, res) => {
  const userId = req.user.id; 

  db.query(
    "SELECT id, username, email, role FROM login WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result[0]); 
    }
  );
};

module.exports = {
  getAuth,
  postAuth,
  checkLogin,
  getMe,
};
