exports.lobby = function(people){
  console.log("making the lobby");

  var fss = people;
  var ss= JSON.stringify(fss);

  console.log(ss);

  var page = `
  <html>
     <head>
        <meta name="viewport" content="minimum-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no"/>
        <meta charset="utf-8">
        <title>Login</title>
     </head>
     <body>

     <div id ='box'>
     <table id= "top" border = "1">
                <tr>
                <td class ="head">Name</td>
                <td class ="head">Usetname</td>
                <td class ="head">Win</td>
                <td class ="head">Loss</td>
                </tr>
      </table>
      <table id= "tablu" class= "tbl" border= "1">

      </table>

      <center>
       <form id=gamebutton action="" method="post">
         <button class="btn waves-effect waves-light teal" type="submit" name="game">Start Game</button>
      </form>
      </center>
      </div>
     </body>
  <script>
    var the_table = document.getElementById("tablu");
    var arr = new Array;
    var students = `+ss+`;
    var swag = 0;
    for(var i = 0 ; i < students.length; i++)
        {

            if(students[i].first_name )
            {
              arr[swag] = the_table.insertRow(swag);
              arr[swag].insertCell(0);
              arr[swag].insertCell(1);
              arr[swag].insertCell(2);
              arr[swag].insertCell(3);
              swag++;
            }

        }
        console.log(students.length);
        swag = 0;
          for(var i =0; i < students.length; i++)
          {

              if(students[i].first_name != undefined)
                  {
                  the_table.rows[swag].cells[0].innerHTML = students[i].first_name
                  the_table.rows[swag].cells[1].innerHTML = students[i].username
                  the_table.rows[swag].cells[2].innerHTML = students[i].wins
                  the_table.rows[swag].cells[3].innerHTML = students[i].losses
                  swag++;
                  }
          }


    console.log(students[0].first_name);
  </script>
  <script> src = "./style.js/" </script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.5/js/materialize.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" >
  <link rel="stylesheet" href="/style.css"/> `;

 return page;
}
