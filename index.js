const express = require('express');
const http = require('http');
const https = require('https');
const fSync = require('fs');
const app = express();

app.use(express.static('static'));

const bodyParser = require('body-parser'); // For JSON

// ----- //

app.get('/', (req, res) =>{
    res.status(200);
});

app.get('/admin', (req, res) =>{
  res.status(200).redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
});

// ----- //
app.get('*', (req, res, err)=>{
  res.status(404);

  if(req.accepts('html')){
    res.redirect('404page.html');
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