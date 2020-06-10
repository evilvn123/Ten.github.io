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
let sql0 = 'CREATE TABLE IF NOT EXISTS data (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, temp INT(10), gas INT(10), time TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE = InnoDB' ;

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

	socket.on('data', function(data){
		var data_json = JSON.stringify(data)
		console.log('message: ' + data_json);
		var now= moment();
		let sql1 = `INSERT INTO data (temp, gas) values (?,?)` ;
		
		//var date=now.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
		var time=now.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
		console.log(time);
		let todo = [data.temp, data.gas];
		conn.query(sql1, todo, (err, results, fields) => {
			if (err) {
			  return console.error(err.message);
			}
			// get inserted id
			console.log('Todo Id:' + results.insertId);
		  });
	  });
});


app.get("/admin", function(req, res){
	res.render("trangchu");
})
