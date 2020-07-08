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

//handleDisconnect();
let sql0 = 'CREATE TABLE IF NOT EXISTS data (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, temp INT(10), gas INT(10), time varchar(50), date varchar(50)) ENGINE = InnoDB' ;

io.on('connection', function(socket){
	console.log('a user connected');

	io.sockets.emit('server-send-data', {content: 'This content'});


	conn.query(sql0, function (err) {
        conn.on('error',function(err){	
          console.log('mysql error',err);
        });       
        console.log('Tao bang thanh cong');
    });

	socket.on('disconnect', function(){
	  console.log('user disconnected');
	});
	socket.on('client-need-data', function(data){
		let sql = 'SELECT * FROM data';
		conn.query(sql, (err, results)=>{
			console.log(results.length)
		})
	});

	socket.on('client-send-data', function(data){
		var data_json = JSON.stringify(data)
		console.log('message: ' + data_json);
		var now= moment();
		let sql1 = `INSERT INTO data (temp, gas, time, date) values (?,?,?,?)` ;
		var time=now.tz('Asia/Ho_Chi_Minh').format('HH:mm:ss').toString();
		var date=now.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD').toString();
		console.log(time);
		let todo = [data_json, data_json, time, date];
		conn.query(sql1, todo, (err, results, fields) => {
			if (err) {
			  return console.error(err.message);
			}
			console.log('Todo Id:' + results.insertId);
		  });
		con.query('SELECT COUNT(*) AS so_luong FROM data', function(err,result, fields){
			con.on('error',function(err){
				console.log('mysql error 179',err);
			});
			if (result.so_luong > 50000){
				con.query('DELETE FROM data', function(err,result, fields){
					con.on('error',function(err){
							console.log('mysql error 184',err);
					});			
				});
			}
		});
		io.sockets.emit('server-send-data', {content: data});
	  });
});


app.get("/admin", function(req, res){
	res.render("trangchu");
})

// function handleDisconnect() {
// 	conn = mysql.createConnection({
// 		host    : 'bvfopzmpe3wvyhzvzip2-mysql.services.clever-cloud.com',
// 		user    : 'uo2i94d6ddzrqmqy',
// 		password: 'n4ZKdalk4QVP3KqgfdFc',
// 		database: 'bvfopzmpe3wvyhzvzip2',
//     });

//     conn.connect(function(err) {             
// 	   if(err) {                                     
// 		 console.log('error when connecting to db:', err);
// 		 setTimeout(handleDisconnect, 2000); 
// 	   }                                  
//     });                                     
//     conn.on('error', function(err) {
// 	   console.log('db error', err);
// 	   if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
// 		 handleDisconnect();
// 		 console.log("ket noi lai");                         
// 	   } else {                                     
// 		 throw err;                                  
// 	   }
//     });
// }