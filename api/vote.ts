import express from "express";
import mysql from "mysql";
import { conn } from "../dbcon"
import { VotePostRequest } from "../model/vote_post_req";

export const router = express.Router();

router.get('/', (req, res)=>{
    conn.query('SELECT * FROM vote', (err,result)=>{
        if (err) {
            res.status(500).json(err)
        }
        if (result.length) {
            res.json(result)
        }else{
            res.status(204).json()
        }
    })
});

router.get('/total', (req, res)=>{
    if (req.query.id) {
        conn.query(`SELECT pid,
                        1000+SUM(CASE WHEN v.winner = pid THEN v.scoreWin ELSE 0 END)+SUM(CASE WHEN v.loser = pid THEN v.scoreLose ELSE 0 END) as totalScore 
                    FROM picture 
                    LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid) 
                    WHERE pid = ? 
                    GROUP BY pid`,req.query.id, (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result[0])
            }else{
                res.status(204).json()
            }
        })
    }
});

router.get('/count', (req, res)=>{
    if (req.query.id) {
        conn.query(`SELECT COUNT(pid) as amount,
                        COUNT(CASE WHEN v.winner = pid THEN 1 END) as win,
                        COUNT(CASE WHEN v.loser = pid THEN 1 END) as lose
                    FROM picture 
                    LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid) 
                    WHERE pid = ? 
                    GROUP BY pid`,req.query.id, (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result[0])
            }else{
                res.status(204).json()
            }
        })
    }
});

router.get('/totalagos', (req, res)=>{
    // let day = +req.params.day;
    if (req.query.id) {
        conn.query(`SELECT pid,
                        1000+SUM(CASE WHEN v.winner = pid THEN v.scoreWin ELSE 0 END)+SUM(CASE WHEN v.loser = pid THEN v.scoreLose ELSE 0 END) as totalScore 
                    FROM picture 
                    LEFT JOIN vote v ON (v.winner = pid OR v.loser = pid) 
                    WHERE pid = ? 
                    AND DATE(voted_at) <    (CASE WHEN DATEDIFF(NOW(),DATE(created_at)) >= 6 
                                                THEN DATE_SUB(NOW(),INTERVAL 6 DAY) 
                                                ELSE DATE_SUB(NOW(),INTERVAL DATEDIFF(NOW(),DATE(created_at)) DAY)
                                            END) 
                    GROUP BY pid`,req.query.id, (err,result)=>{
            if (err) {
                res.status(500).json(err)
            }
            if (result.length) {
                res.json(result[0])
            }else{
                res.status(204).json()
            }
        })
    }
});

router.get('/date', (req, res)=>{
    if (req.query.id) {
        // conn.query('SELECT pid,SUM(score) as totalScore,dates.fulldate FROM dates LEFT JOIN vote ON dates.fulldate = vote.voted_at WHERE pid = ? and dates.fulldate BETWEEN adddate(now(),-7) and now() GROUP BY DATE(voted_at) ORDER BY DATE(voted_at) desc',req.query.id, (err,result)=>{
        conn.query(
            `SELECT pid,
                SUM(CASE WHEN winner = pid THEN scoreWin ELSE 0 END) as scoreWin,
                SUM(CASE WHEN loser = pid THEN scoreLose ELSE 0 END) as scoreLose,
                SUM(CASE WHEN winner = pid THEN scoreWin ELSE 0 END)+SUM(CASE WHEN loser = pid THEN scoreLose ELSE 0 END) as totalScore,
                DATE(voted_at) as date
            FROM picture
            LEFT JOIN vote ON (winner = pid OR loser = pid) 
            WHERE pid = ? 
            AND voted_at BETWEEN DATE_SUB(NOW(),INTERVAL 6 DAY) 
            AND NOW()
            GROUP BY DATE(voted_at) 
            ORDER BY DATE(voted_at)`,req.query.id, (err,result)=>{
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

// router.get('/scoredate', (req, res)=>{
//     if (req.query.id) {
//         // conn.query('SELECT pid,SUM(score) as totalScore,dates.fulldate FROM dates LEFT JOIN vote ON dates.fulldate = vote.voted_at WHERE pid = ? and dates.fulldate BETWEEN adddate(now(),-7) and now() GROUP BY DATE(voted_at) ORDER BY DATE(voted_at) desc',req.query.id, (err,result)=>{
//         conn.query('SELECT pid,SUM(CASE WHEN winner = pid THEN scoreWin ELSE 0 END) as scoreWin,SUM(CASE WHEN loser = pid THEN scoreLose ELSE 0 END) as scoreLose,DATE(voted_at) as date'+
//         ' FROM picture LEFT JOIN vote ON (winner = pid OR loser = pid) WHERE pid = ? AND '+
//         'voted_at BETWEEN DATE_SUB(NOW(),INTERVAL 7 DAY) and now() GROUP BY DATE(voted_at) ORDER BY DATE(voted_at)',[req.query.id,req.query.id], (err,result)=>{
//             if (err) {
//                 res.status(500).json(err)
//             }
//             if (result.length) {
//                 res.json(result)
//             }else{
//                 res.status(204).json()
//             }
//         })
//     }
// });

router.post('/', (req, res)=>{
    const vote : VotePostRequest = req.body
    let sql = "INSERT INTO vote (winner, loser, scoreWin, scoreLose, fgPrint) VALUES (?,?,?,?,?)"
    sql = mysql.format(sql,[
        vote.winner,
        vote.loser,
        vote.scoreWin,
        vote.scoreLose,
        vote.fgPrint
    ])
    conn.query(sql, (err,result)=>{
        if (err) {
            res.status(400).json(err)
        }else{
            res.status(201).json({ affected_row: result.affectedRows })
        }
    })
});

router.get("/cd", (req, res) => {
    conn.query(
      "SELECT * FROM rule",
      (err, result) => {
        if (err) {
          res.status(500).json(err);
        }else{
          res.status(200).json(result[0]);
        }
      }
    );
  });

router.put("/cd/:cooldown", (req, res) => {
    let cooldown = +req.params.cooldown;
    conn.query(
      "UPDATE rule SET cooldown = ? WHERE rid = 1",
      [cooldown],
      (err, result) => {
        if (err) {
          res.status(500).json(err);
        }else{
          res.status(200).json({
            affected_row: result.affectedRows,
          });
        }
      }
    );
  });