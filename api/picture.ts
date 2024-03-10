import express from "express";
import mysql from "mysql";
import { conn } from "../dbcon";
import { PicturePostRequest } from "../model/pic_post_req";

export const router = express.Router();

router.get('/', (req, res)=>{
    if (req.query.id) {
        conn.query('SELECT user.name,picture.*,1000+SUM(CASE WHEN v.winner = pid THEN v.scoreWin ELSE 0 END)+SUM(CASE WHEN v.loser = pid THEN v.scoreLose ELSE 0 END) as totalScore FROM ((picture LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid)) INNER JOIN user ON picture.user_id = user.uid) WHERE picture.pid = ? GROUP BY picture.pid',req.query.id, (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result[0])
            }else{
                res.status(204).json()
            }
        })
    }else if (req.query.uid) {
        conn.query('SELECT user.name,picture.*,1000+SUM(CASE WHEN v.winner = pid THEN v.scoreWin ELSE 0 END)+SUM(CASE WHEN v.loser = pid THEN v.scoreLose ELSE 0 END) as totalScore FROM ((picture LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid)) INNER JOIN user ON picture.user_id = user.uid) WHERE picture.user_id = ? GROUP BY picture.pid',req.query.uid, (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result)
            }else{
                res.status(204).json()
            }
        })
    }else{
        conn.query('SELECT user.name,picture.*,1000+SUM(CASE WHEN v.winner = pid THEN v.scoreWin ELSE 0 END)+SUM(CASE WHEN v.loser = pid THEN v.scoreLose ELSE 0 END) as totalScore FROM ((picture LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid)) INNER JOIN user ON picture.user_id = user.uid) GROUP BY picture.pid ORDER BY totalScore desc,created_at', (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result)
            }else{
                res.status(204).json()
            }
        })
    }
    
});

router.post("/", async (req, res) => {
  const pic: PicturePostRequest = req.body;
  conn.query(
    "SELECT * FROM picture WHERE user_id = ?",
    pic.user_id,
    (err, result) => {
      if (err) {
        res.status(500).json(err);
      }
      if (result.length >= 5) {
        res.status(403).json();
      } else {
        let sql = "INSERT INTO picture (user_id, img) VALUES (?,?)";
        sql = mysql.format(sql, [pic.user_id, pic.img]);
        conn.query(sql, (err, result) => {
          if (err) {
            res.status(400).json(err);
          } else {
            res.status(201).json({
              affected_row: result.affectedRows,
              last_idx: result.insertId,
            });
          }
        });
      }
    }
  );
});
