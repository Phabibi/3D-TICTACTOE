
var socket = io("http://localhost:3000");

var move;
var obj;
var objj;
var current = 1;
var old_current;
var username;
var room_name;
var clientid =0;

$(document).ready(function() {
  // socket.emit('joinroom', room_name);


    socket.on('connect', function(data){
      socket.emit('joinroom' , "");

      // console.log('username ', data.current_user );
      console.log('connected now joining room');
  });

  socket.on('users', function(data){
    username = data.current_user;
    room_name = data.room_name;
    console.log('room si ', room_name)
    console.log(username + ' has connected')
    $('#chat').text('Chat '+username);
    socket.emit('chat',{username:username});
  });


  socket.on('disconnect', function(data){
    console.log("disconnected");
  })
  // socket.emit('joinroom', room_name);



  randomize();

  socket.on('message',function(message){
    if(message.msg === undefined)
    {
      //do nothing
    }
    else {
      printMessage(message.msg)
    }

});

socket.on('winnerwinnerchickendinner', function(stats){
	console.log( username + "has won" );
  if(username == stats.winner){
    alert("You won! \n Here are the game's stats: \n Winner: " + stats.winner +
          " \n Moves Played: "+ stats.moves + " \n Time elapsed (in ms): "+ stats.time +
            "\n To view further stats, you must log out and log back in to view \n "+
            "the leaderboard. This is for security reasons... trust me. \n Click ok to LOG OUT ");
            window.location.href = "login.html";
  }
  else{
    alert("You lost \n Here are the game's stats: \n Winner: " + stats.winner +
          " \n Moves Played: "+ stats.moves + " \n Time elapsed (in ms): "+ stats.time +
            "\n To view further stats, you must log out and log back in to view \n "+
            "the leaderboard. This is for security reasons... trust me. \n Click ok to LOG OUT ");
            window.location.href = "login.html";
    socket.emit('wholost', username);
  }
});

socket.on('winnerwinnerchickendinnerREVERSED', function(stats){
	console.log( username + "has won" );
  if(username == stats.winner){
    alert("You Resigned! \n Here are the game's stats: \n Loser: " + stats.winner +
          " \n Moves Played: "+ stats.moves + " \n Time elapsed (in ms): "+ stats.time +
            "\n To view further stats, you must log out and log back in to view \n "+
            "the leaderboard. This is for security reasons... trust me. \n Click ok to LOG OUT ");
            window.location.href = "login.html";
  }
  else{
    alert("You Won from resignation \n Here are the game's stats: \n Loser: " + stats.winner +
          " \n Moves Played: "+ stats.moves + " \n Time elapsed (in ms): "+ stats.time +
            "\n To view further stats, you must log out and log back in to view \n "+
            "the leaderboard. This is for security reasons... trust me. \n Click ok to LOG OUT ");
            window.location.href = "login.html";
    socket.emit('wholost', username);
  }
  window.location.href = "login.html";
});

socket.on('stats', function(stats){
	console.log( name + "has won" );

});
document.forms[0].onsubmit = function () {
  console.log("im here");
    var input = document.getElementById("messager");
    var msg = username + ": " + input.value
    printMessage(msg);
    socket.emit('chat',{msg:msg , username:username});
    input.value = '';

};

document.forms[1].onsubmit = function () {
  console.log("im here");
    var notMe = 0;
    objj == 'O' ? notMe = 1 : notMe = 0;
//    socket.emit('winnerwinnerchickendinner',);
    socket.emit("themove" , {move:notMe, obj:'RESIGNATION', current:current, user:username} );

    //input.value = '';

};

  function printMessage(message) {
      var p = document.createElement("h2");
      p.innerText = message;
      document.getElementById('message').appendChild(p);
  }




$('.btn_3d').click(function() {
    $(this).toggleClass('active');
    console.log(current);
    console.log("old current" , old_current);

    if(current === old_current)
     {
      console.log("not your turn")
    }
    else  {
      $(this).children().css("text-align", "center");
      $(this).children().css("text-align", "center");
      $(this).children().css("font-size", "50px");



      move = $(this).attr('id')

      if(repeat(move) === false){
        $(this).children().text(obj)
        objj = $(this).children().text();

        old_current = current;

        socket.emit("themove" , {move:move, obj:objj, current:current, user:username} )
      }


    }


})

  socket.on("the_move" , function(data){


    $("#"+data.move).children().css("text-align", "center");
    $("#"+data.move).children().css("text-align", "center");
    $("#"+data.move).children().css("font-size", "50px");
    $("#"+data.move).children().text(data.obj);


    if(data.obj == 'X')
    {
      obj = 'O'
    }

    else {

      obj = 'X'
    }
    old_current = data.current;



  });



  function randomize()
  {
    console.log("im here randoming")
      var rand= Math.floor((Math.random()*2));
      if(rand === 1)
      {
        obj = 'X'
      }

      else {
        obj = 'O'
      }
  }

  function repeat(cell){
    if(cell > 0 && cell < 10){
      if($("#"+cell).children().text() == 'X' ||$("#"+cell).children().text() =='O')
      {
        console.log("we here")
        return true;
      }
      else{
        return false;
      }

    }
    if(cell > 9 && cell < 19){
      if($("#"+cell).children().text() === 'X' ||$("#"+cell).children().text() ==='O')
      {
        return true;
      }
      else{
        return false;
      }

    }

    if(cell > 18 && cell < 28){
      if($("#"+cell).children().text() === 'X' ||$("#"+cell).children().text() ==='O')
      {
        return true;
      }
      else{
        return false;
      }

    }
  }


});
