import mysql from "mysql";

export const conn = mysql.createPool({
    connectionLimit : 10,
    host : "202.28.34.197",
    user : "web65_64011212136",
    password : "64011212136@csmsu",
    database: "web65_64011212136"
})