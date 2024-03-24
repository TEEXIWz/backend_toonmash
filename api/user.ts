import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";
import util from "util";
import { conn } from "../dbcon";
import { UserPostRequest } from "../model/user_post_req";

export const router = express.Router();

router.get("/", (req, res) => {
  if (req.query.id) {
    conn.query(
      "SELECT * FROM user WHERE uid = ?",
      req.query.id,
      (err, result) => {
        if (err) {
          res.status(500).json(err);
        }
        if (result.length) {
          res.json(result[0]);
        } else {
          res.status(204).json();
        }
      }
    );
  } else if (req.query.username) {
    conn.query(
      "SELECT * FROM user WHERE username LIKE ?",
      "%" + req.query.username + "%",
      (err, result) => {
        if (err) {
          res.status(500).json(err);
        }
        if (result.length) {
          res.json(result[0]);
        } else {
          res.status(204).json();
        }
      }
    );
  } else {
    conn.query("SELECT * FROM user WHERE type = 0", (err, result) => {
      if (err) {
        res.status(500).json(err);
      }
      if (result.length) {
        res.json(result);
      } else {
        res.status(204).json();
      }
    });
  }
});

router.post("/", async (req, res) => {
  const user: UserPostRequest = req.body;
  conn.query(
    "SELECT * FROM user WHERE username = ?",
    user.username,
    async (err, result) => {
      if (err) {
        res.status(500).json(err);
      }
      if (result.length) {
        res.status(409).json();
      } else {
        const hashPwd = await bcrypt.hash(user.password, 10);
        let sql =
          "INSERT INTO user (username, name, password, img, type) VALUES (?,?,?,?,?)";
        sql = mysql.format(sql, [
          user.username,
          user.name,
          hashPwd,
          user.img,
          user.type,
        ]);
        conn.query(sql, (err, result) => {
          if (err) {
            res.status(400).json(err);
          } else {
            conn.query(
              "SELECT * FROM user WHERE uid = ?",
              result.insertId,
              (err, result) => {
                if (err) {
                  res.status(500).json(err);
                }
                if (result.length) {
                  res.status(201).json(result[0]);
                } else {
                  res.status(204).json();
                }
              }
            );
          }
        });
      }
    }
  );
});

router.put("/:id", async (req, res) => {
  let id = +req.params.id;
  let user: UserPostRequest = req.body;
  let userOriginal: UserPostRequest | undefined;
  const queryAsync = util.promisify(conn.query).bind(conn);
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  let sql = mysql.format("select * from user where uid = ?", [id]);
  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  userOriginal = rawData[0] as UserPostRequest;

  let updateUser = { ...userOriginal, ...user };
  // const hashPwd = await bcrypt.hash(updateUser.password, 10);

  sql = "update user set username=?, name=?, password=?, img=? where uid=?";
  sql = mysql.format(sql, [
    updateUser.username,
    updateUser.name,
    updateUser.password,
    updateUser.img,
    id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows });
  });
});

router.post("/login", (req, res) => {
  const user: UserPostRequest = req.body;
  conn.query(
    "SELECT * FROM user WHERE username = ?",
    user.username,
    async (err, result) => {
      if (err) {
        res.status(500).json(err);
      }
      if (result.length) {
        const userRes: UserPostRequest = result[0];
        try {
          const resLogin = await bcrypt.compare(
            user.password,
            userRes.password
          );
          if (resLogin) {
            res.status(200).json(userRes);
          } else {
            res.status(204).json(err);
          }
        } catch (error) {
          res.status(500).json(error);
        }
      } else {
        res.status(204).json(err);
      }
    }
  );
});
