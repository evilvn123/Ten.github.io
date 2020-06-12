var express = require('express');
var mysql = require('mysql');
var app = express();
var moment = require('moment-timezone');

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require('socket.io')(server);
server.listen(8080);

var conn = mysql.createConnection({
      host    : 'bvfopzmpe3wvyhzvzip2-mysql.services.clever-cloud.com',
      user    : 'uo2i94d6ddzrqmqy',
      password: 'n4ZKdalk4QVP3KqgfdFc',
      database: 'bvfopzmpe3wvyhzvzip2',
});

handleDisconnect();
let sql0 = 'CREATE TABLE IF NOT EXISTS data (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, temp INT(10), gas INT(10), time TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE = InnoDB' ;

io.on('connection', function(socket){
	console.log('a user connected');

	io.sockets.emit('server-send-data', {content: 'This content'});
	// socket.on('client-send-data', function(data){
	// 	console.log(data);
	// 	io.sockets.emit('server-send-data', {content: data});
	// });


	conn.query(sql0, function (err) {
        conn.on('error',function(err){	
          console.log('mysql error',err);
        });       
        console.log('Tao bang thanh cong');
    });

	socket.on('disconnect', function(){
	  console.log('user disconnected');
	});

	socket.on('client-send-data', function(data){
		var data_json = JSON.stringify(data)
		console.log('message: ' + data_json);
		var now= moment();
		let sql1 = `INSERT INTO data (temp, gas, time) values (?,?,?)` ;
		var time=now.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
		console.log(time);
		let todo = [data_json.temp, data_json.gas, time];
		conn.query(sql1, todo, (err, results, fields) => {
			if (err) {
			  return console.error(err.message);
			}
			console.log('Todo Id:' + results.insertId);
		  });
		io.sockets.emit('server-send-data', {content: data});
	  });
});


app.get("/admin", function(req, res){
	res.render("trangchu");
})

function handleDisconnect() {
	conn = mysql.createConnection({
		host    : 'bvfopzmpe3wvyhzvzip2-mysql.services.clever-cloud.com',
		user    : 'uo2i94d6ddzrqmqy',
		password: 'n4ZKdalk4QVP3KqgfdFc',
		database: 'bvfopzmpe3wvyhzvzip2',
   });

   conn.connect(function(err) {             
	   if(err) {                                     
		 console.log('error when connecting to db:', err);
		 setTimeout(handleDisconnect, 2000); 
	   }                                  
   });                                     
   conn.on('error', function(err) {
	   console.log('db error', err);
	   if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
		 handleDisconnect();
		 console.log("ket noi lai");                         
	   } else {                                     
		 throw err;                                  
	   }
   });
}
