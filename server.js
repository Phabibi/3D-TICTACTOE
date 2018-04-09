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
var port = process.env.PORT || 3000;
var Bigres;
var server = http.createServer(app).listen(port);
var io = require('socket.io')(server);
var dbo;
var ssn;
var students;
var turn;
var room;

var current_user;

var clients = 0;

var socket_glob;


var test_clients = new Array;
var sockets = new Array;
var clientsockets = new Array;
var dynamic = require ('./public/dynamic.js');
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
app.post('/login',function(req,res){
      console.log("checking username and pass")
      console.log("current email ", req.body.email)
      Bigres = res;
      ssn = req.session;
      var user_exist = false;
      var user_check = dbo.collection("users").find({}).toArray(function(err, result){
        if(result === undefined){
          Bigres.redirect('/');
        }
          if (err) throw err;
          for(var i = 0 ; i < result.length ; i++){
            if(result[i].email === req.body.email){
              console.log("found my mans" , result[i].username);
              console.log("ok checking pass now...");
              // test_clients.push(result[i].username);
              ssn.username = result[i].username;
              bcrypt.compare(req.body.password, result[i].password, function(err, res) {
                user_exist = res;
                console.log(user_exist + "you entered ");
                // current_user = result[i].username;
                res? Bigres.redirect('/lobby') : Bigres.redirect('/');
              });
            }
          }
        });
      });
app.get("/lobby", function(req,res){
  console.log("serving page")
  var result;
  var lobby = dynamic.lobby(result);
  ssn = req.ssn;
  fs.writeFile("./lobby.html",lobby,function(err,data){

      if(err)
      {
        console.log(err);
      }

      else{
        console.log("file write success")
        res.sendFile(__dirname + "/lobby.html");
      }

  });



});
app.post("/lobby" , function(req,res){


  console.log("serving game page");
  console.log('please work ', test_clients[clients]);

  console.log('big picture ', test_clients);


  for(var i = 0 ; i < clients; i++)
  {
    clientsockets[i] = {username:test_clients[i], socketid:sockets[i]};
  }

  console.log(clientsockets)

  io.on('connection', function(socket){
      console.log('new connection');
      clients++;
      socket_glob = socket.id;

      // for(var i = 0 ; i < clients; i++)
      // {
      //   if(clientsocket[i].sockets === socket.id)
      //   {
      //     current_user =
      //   }
      // }

      console.log('clients' , clients);

      // sockets.push(socket.id);

      console.log('their socket id ',socket.id)







       console.log("current_user= " ,current_user);

       // current_user = ssn.username;

      // socket.on('joinroom', function(data){
      //   console.log('joined the room' , data);
      //   room = data;
      //   socket.join(data);
      // })

      socket.emit('users',{current_user:current_user,clients:clients} );

      socket.on('chat', function(message){
        message.username = current_user;
        socket.broadcast.emit('message',message);
      });




      socket.on('themove', function(move){
        console.log("broadcasting the move" , move);

        if(move.current === 1)
        {
          move.current= 2;
        }

        else if(move.current === 2) {
          move.current = 1;
        }

        console.log(move.current);



        socket.broadcast.emit('the_move', move);
      });

    socket.on('disconnect', function(){
      console.log('Disconnect event');
      clients--;
    });

  });
  // current_user = test_clients[clients]



  //everyone can see this, need to fix


  res.redirect('/gamepage');
});





app.get("/gamepage" , function(req,res){

  ssn = req.session;
  console.log('the ssn usre',ssn.username);

  console.log("serving game page");
  //everyone can see this, need to fix



  return res.sendFile(__dirname + "/gamepage.html");
});




console.log("running on port ", port );
