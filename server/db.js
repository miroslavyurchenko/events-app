const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Qwerasdzx,123",
  database: "events_platform",
});

module.exports = pool.promise();