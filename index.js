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

var now= moment();
var time=now.tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
var date=now.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

var conn = mysql.createConnection({
      host    : 'b6zr2pv6hb6js0e9tbrd-mysql.services.clever-cloud.com',
      user    : 'uaqscwtkqzmfltfb',
      password: 'aE2kTkEkHbsAIqq13Z8j',
      database: 'b6zr2pv6hb6js0e9tbrd',
});

handleDisconnect();
let sql0 = 'CREATE TABLE IF NOT EXISTS data (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, temp INT(10), gas INT(10), time TIME, date DATE) ENGINE = InnoDB' ;

io.on('connection', function(socket){
	console.log('a user connected');

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
		
		let sql1 = `INSERT INTO data (temp, gas, time, date) values (?,?,?,?)` ;
		
		console.log(time);
		let todo = [data.temp, data.gas, time, date];
		conn.query(sql1, todo, (err, result, fields) => {
			if (err) {
			  return console.error(err.message);
			}
			console.log('Todo Id:' + result.insertId);
		  });
		
	});
	socket.on('client-need-data', function(data){
		conn.query('SELECT * FROM data WHERE DATE = ?',[date], function(err,results, fields){
			conn.on('error',function(err){
				console.log('mysql error 179',err);
			});
			console.log(results)
			//io.sockets.emit('server-send-data', {content: data});
			if (results.so_luong > 50000){
				conn.query('DELETE FROM data', function(err,results, fields){
					conn.on('error',function(err){
							console.log('mysql error 184',err);
					});			
				});
			}
		});

	});
	
});


app.get("/admin", function(req, res){
	res.render("trangchu");
})

function handleDisconnect() {
	conn = mysql.createConnection({
		host    : 'b6zr2pv6hb6js0e9tbrd-mysql.services.clever-cloud.com',
		user    : 'uaqscwtkqzmfltfb',
		password: 'aE2kTkEkHbsAIqq13Z8j',
		database: 'b6zr2pv6hb6js0e9tbrd',
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
