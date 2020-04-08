/**
 * Author: Alex Huang (alexh95@mit.edu)
 * Created: 4/4/2020
 */

const express = require('express'),
      app = express(),
      fs = require('fs'),
      http = require('http').Server(app),
      morgan = require('morgan');
      bodyParser = require('body-parser'),
      sql = require('mysql');

const config = JSON.parse(fs.readFileSync('config.json', "utf8"));

const con = sql.createConnection({
  host     : config.SQL_HOST,
  user     : config.SQL_USER_TEST,
  password : config.SQL_PASSWORD_TEST,
  database : config.SQL_DB_NAME_TEST
});

// Users route, interface for all user DB interactions
const users = require('./users.js')(con);

app.use(morgan(config.LOG_LEVEL));
// serve HTML from views directory
app.use(express.static('views'));
app.use(bodyParser.json());
// all client calls to /user will go to users module
app.use('/users', users); 

con.connect(function(err){
  if (err) throw err;
  console.log("Connected to DB");
});
// Ugly but keeps the connection persistent by avoiding idle
setInterval(function(){
  con.query('SELECT 1');
}, 10000);

con.on('error', function(err){
  console.log("Error is:", err);
  throw err;
});

http.listen(
  config.PORT, 
  console.log("Server started, accepting requests on port:", 
  config.PORT)
);