var express = require('express');
var app = express();
var serverIndex = require('serve-index');
var http = require('http');
var path = require('path');
var session =require('express-session');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://cmpt218:pass@ds061777.mlab.com:61777/cmpt218"
var bcrypt = require('bcryptjs');


var dbo;
var port = process.env.PORT || 3000;
var ssn;
var students;
// parsing body
app.use(express.json());
app.use(express.urlencoded( { extended:false} ));


app.use(express.static(path.join(__dirname,'/public/')));
app.use(session({secret:'PASWAG'}));

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");

  dbo = db.db("cmpt218");
  students = dbo.collection("students");
  console.log("Collection created");
  });

app.use('/', function(req,res,next){
  console.log(req.method, 'request:', req.url, JSON.stringify(req.body));
  next();
});

app.get('/', function(req,res,next){
  console.log("checking session");
  if(ssn == null)
  {
    console.log("setting session");
    ssn = req.session;
  }
  console.log("serving page");

  res.sendFile(__dirname + "/public/login.html");

});

app.post('/register', function(req,res){
    var newUser = {

    }
});
http.createServer(app).listen(port);
console.log("running on port ", port )
