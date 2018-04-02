var express = require('express');
var app = express();
var serverIndex = require('serve-index');
var http = require('http');
var path = require('path');
var session =require('express-session');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://cmpt218:pass@ds061777.mlab.com:61777/cmpt218"
// {
//
//   poolSize: 20,
//   {socketTimeoutMS:480000},
//   {keepAlive: 300000},
//   {ssl: true},
//   {sslValidate: false}
//
// };

var username;
var pass;
var dbo;
var students;
var users;
var student_table;
var date;

var port = process.env.PORT || 3000;
var users = [];
var ssn;

var current_course;
var name;

// parsing body
app.use(express.json());
app.use(express.urlencoded( { extended:false} ));


app.use(express.static(path.join(__dirname,'/public/')));
app.use(session({secret:'PASWAG'}));

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm','html'],
  index: "login.html"
}

var admin_option= {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm','html'],
  index: "admin.html"
}


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
