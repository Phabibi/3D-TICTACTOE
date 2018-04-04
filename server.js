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
  console.log("HuMONGOus database created!");

  dbo = db.db("cmpt218");
  students = dbo.collection("users");
  console.log("Collection connected!");
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

app.get('/registersuccess' , function(req,res){
  console.log("register success");
  return res.sendFile(__dirname + "/public/registersuccess.html");
});

app.post('/register', function(req,res){
    var newUser = {
      first_name : req.body.first_name,
      last_name : req.body.last_name,
      username : req.body.username,
      password : req.body.password,
      gender : req.body.gender,
      age : req.body.age,
      email : req.body.email,
    };
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          if(err) throw err;
          newUser.password = hash;
            dbo.collection("users").insertOne(newUser, function(err, res) {
              if (err) throw err;
              console.log("Inserted user: " + req.body.username + " with password "+ newUser.password);
            //  db.close();
            });
            res.redirect('/registersuccess');


        });
    });

    });
app.post('/registersuccess',function(req,res){
      console.log("checking username and pass")
      console.log("current email ", req.body.email)
      // students.findOne({email:req.body.email}, function(err,user){
      //   if(err) throw err;
      //   else {
      //     console.log("the user is" , user);
      //   }
      // })

      var user_exist;
      var user_check = dbo.collection("users").find({}).toArray(function(err, result){
        if(err) throw err;

        else{
          for(var i = 0 ; i < result.length ; i++)
          {
            if(result[i].email == req.body.email)
            {
              console.log("found my mans" , result[i].first_name);
              user_exist = result[i].email;
              break;
            }
            else{

              i++;
            }
          }
          if(user_exist === undefined)
          {
            console.log("mans not here");
          }
          else {
            console.log("heres the result ", user_exist  );

          }
        }
      });

});

      /*  dbo.collection("users").insertOne(newUser, function(err, res) {
              if (err) throw err;
              console.log("Inserted user: " + req.body.username);
            //  db.close();
          });*/

http.createServer(app).listen(port);
console.log("running on port ", port )
