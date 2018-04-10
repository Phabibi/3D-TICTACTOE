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
var room = 'marvins';
var flag = 0;
var clients;
var boardHelpers = require("./public/boardHelpers.js");
var ticTac = boardHelpers.createArray(3,3,3);
boardHelpers.initArray(ticTac);
var current_user;
var username1 = "";
var test_clients = new Array;
var sockets = new Array;
var clientsockets = new Array;
var dynamic = require ('./public/dynamic.js');
var moves = 0;
var date;
var time;
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


  io.on('connection', function(socket){
      console.log('new connection');
      clients++;
      console.log("current_user= " ,current_user);

       // current_user = ssn.username

      socket.on('joinroom', function(data){
        console.log('joined the room' , room);
      });
      socket.join(room);
      time =  new Date().getTime();
      socket.emit('users',{current_user:current_user , clients:clients, roomname:room} );


      socket.on('chat', function(message){
        message.username = current_user;
        socket.broadcast.to(room).emit('message',message);
      });
      socket.on('themove', function(move){
        moves++;
        console.log("broadcasting the move" , move);
        var resignFlag = false;
        if(move.obj == 'RESIGNATION'){
          resignFlag = true;
        }
        if(move.current === 1)
        {
          move.current= 2;
        }
        else if(move.current === 2) {
          move.current = 1;
        }
        console.log(move.current);

    	var indexes = boardHelpers.numberToIndex(move.move);
     	move.obj == 'X'? ticTac[indexes[0]][indexes[1]][indexes[2]] = 1 : ticTac[indexes[0]][indexes[1]][indexes[2]] = 0;
    	console.log(ticTac);

    	var win = boardHelpers.check3Dboard(ticTac);
      if(resignFlag){
        win = move.move;
      }
      console.log("HELLO THIS IS THE WIN NUMBER : " + win);
    	if(win!=-1){
    		if(win == 1 || win == 3){
          username1 = move.user;
          console.log('user1', username1);
    			console.log("X has wooooooooooooooooooon");
    		}
    		if(win == 0){
          username1 = move.user;
          console.log('user2', username1);
    			console.log("OOOOOO zero has WON");
    		}
        username1 = move.user;
        console.log('user1', username1);
        time = new Date().getTime() - time;
        var newGame = {
          moves: moves,
          time: time,
          winner: username1
        };
        dbo.collection("users").insertOne(newGame, function(err, res) {
          if (err) throw err;
          console.log("Inserted game");
        });

        if(resignFlag){
          io.in(room).emit('winnerwinnerchickendinnerREVERSED',newGame);
        }
        else {
          io.in(room).emit('winnerwinnerchickendinner',newGame);
        }
        // io.in(room).emit('stats', newGame);
        console.log("resetting array ... ");
        boardHelpers.initArray(ticTac);
        var myquery = { username: username1 };
        var newvalues = { $inc: {wins:1}};
        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 wins");
        });
        //time = time - Date.now();
      }
        socket.broadcast.to(room).emit('the_move', move);
      });
      socket.on('wholost', function(name){
        var myquery = { username: name};
        var newvalues = { $inc: {losses:1}};
        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 loss added ");
        });
      });

      socket.on('disconnect', function(){
      console.log('Disconnect event');
      clients--;
    });

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
      wins : 0,
      losses: 0
    };
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          if(err) throw err;
          newUser.password = hash;
            dbo.collection("users").insertOne(newUser, function(err, res) {
              if (err) throw err;
              console.log("Inserted user: " + req.body.username + " with password "+ newUser.password);
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
              current_user = ssn.username;
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
  ssn = req.session

  console.log("serving page")
  var lobby;
  if(clients > 2)
  {
    console.log('too many people');
  }
  else if(clients == 2 || clients === 1)
  {
    dbo.collection("users").find({}).toArray(function(err, result){
      if(err) throw err;

      lobby = dynamic.lobby(result);
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
  }
  dbo.collection("users").find({}).toArray(function(err, result){
    if(err) throw err;

    lobby = dynamic.lobby(result);
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
});
app.post("/lobby" , function(req,res){
  ssn = req.session

  console.log("serving game page");
  console.log('please work ', test_clients[clients]);
  console.log('big picture ', test_clients);
  console.log(clientsockets);
  //everyone can see this, need to fix
  res.redirect('/gamepage');
});

app.get("/gamepage" , function(req,res){
  ssn = req.session


  flag =1;
  console.log('the ssn usre',ssn.username);
  console.log("serving game page");
  //everyone can see this, need to fix
   return res.sendFile(__dirname + "/gamepage.html");
});
console.log("running on port ", port );
