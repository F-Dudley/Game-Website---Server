const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const mysql = require('mysql');

// ----- //

const ConnectionSettings = {
  "host": "51.140.115.88",
  "user": "19110370",
  "password": "YzYzpeRpBtKMY8Di",
  "database": "19110370"
}

const db = mysql.createConnection(ConnectionSettings);

db.connect((err) =>{
  if (err) throw err;
  else console.log("MySQL Database Connected");
});

// ----- // ----- //

const app = express();
app.use(express.static('static'));

app.get('/', (req, res) =>{
  res.status(200).send('index');
});

app.get('/users', (req, res) => {
  let sql = 'SELECT * FROM test';

  let query = db.query(sql, (err, results) =>{
    if (err) throw err;
    else res.status(200).send(results);
  });

});

app.get('/getuser-:id', (req, res) => {
  let sql = `SELECT * FROM test WHERE id = ${req.params.id}`;

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    else res.status(200).send(result);    
  });

});

app.get('/checkuser-:username/:password', (req, res) => {

  let sql = `SELECT id, username, password FROM test WHERE username='${req.params.username}' AND password='${req.params.password}'`;

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    if(result.length != null) res.status(200).send(result);
    else{
      res.status(200).send("Nothing Found");
      console.log("Nothing Found");    
    }

  });
});

app.get('/changescore-:id/:score', (req, res) => {
  let sql = "UPDATE test SET highscore ="+ db.escape(req.params.score) +"WHERE id ="+ db.escape(req.params.id);

  let query = db.query(sql, (err, result) =>{
    if (err) throw err;
    else res.status(200).send(`User ID: ${req.params.id}'s score is set to ${req.params.score}`);
  });

});

app.get('/adduser/:username-:email/:password', (req, res) =>{
  
  let post = {username: req.params.username, email: req.params.email, password: req.params.password, highscore: 0};
  let sql = 'INSERT INTO test SET ?';

  let query = db.query(sql, post, (err, result) =>{
    if(err) throw err;
    else res.status(200).send("User Added");
  });
  
  //res.send("Currently Disabled");
});

app.get('/createtable', (req,res) =>{
  /*
  let sql = 'CREATE TABLE test(id int AUTO_INCREMENT, username varchar(255), email varchar(255), password varchar(255), highscore int, PRIMARY KEY(id))'

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Table Created...");
  });
  */
  res.send("Currently Disabled");
});

app.get('/top3scores', (req, res) => {

  let sql = 'SELECT username, highscore FROM test ORDER BY `highscore` DESC LIMIT 3';

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    else res.send(result);    
  })

});

app.get('/admin', (req, res) =>{
  res.status(200).redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
});

// ----- //
app.get('*', (req, res, err)=>{
  res.status(404);

  if(req.accepts('html')){
    res.redirect('../404page.html');
  }
  else{
    window.alert("Page Not Found");
    res.send('404 Error');
  }

});

http.createServer(app).listen(3000, () =>{
  console.log('http - Server Initialized on Port: 3000.');
});
https.createServer(app).listen(5000, () =>{                 // Not Fully Working. Requires SSL Certificate.
  console.log('https - Server Initialized on Port: 5000.');
});