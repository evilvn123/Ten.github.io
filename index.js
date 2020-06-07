var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();
var fs = require("fs");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require('socket.io')(server);
server.listen(8080);

var conn = mysql.createConnection({
      host    : 'bsywt8xxwecvkrkhr23n-mysql.services.clever-cloud.com',
      user    : 'usu17j382kwvccl2',
      password: 'cujVo7AgzcaJf671v3bc',
      database: 'bsywt8xxwecvkrkhr23n',
});

/*---------------------------------------------------------------------------*/
//Giang
var ketqua;
//password 
var getRandomString =function(length){
	return crypto.randomBytes(Math.ceil(length/2))
	.toString('hex') // convert to hexa
	.slice(0,length); // return required number of char
};

var sha512 = function(password,salt){
	var hash = crypto.createHmac('sha512',salt); 
	hash.update(password);
	var value = hash.digest('hex');
	return{
		salt:salt,
		passwordHash:value
	};
};

function saltHashPassword(userPassword){
var salt = getRandomString(16);
var passwordData = sha512(userPassword,salt);
return passwordData;
};

function checkHashPassword(userPassword,salt){

	var passwordData = sha512(userPassword,salt);
	return passwordData;

};


io.sockets.on('connection', function(socket){

console.log("co nguoi ket noi ");
// dang ki tai khoan
socket.on('client-dang-ki-user', function(data){
	//var ketqua;
	var name     		= data.name;
	var email    		= data.email;
	var password 		= data.password;
	var uid 			= uuid.v4();
	var plaint_password = password;
	var hash_data 		= saltHashPassword(plaint_password);
	var password  		= hash_data.passwordHash;
	var salt 			= hash_data.salt;
	
  
 conn.query('SELECT * FROM user where email=?',[email], function(err,result, fields){
		conn.on('error',function(err){
			console.log('mysql error',err);
		});

		if (result && result.length){
			ketqua = false;
		
		console.log("tai khoan da ton tai ");
	}
	else{
		ketqua = true;
		conn.query('INSERT INTO `user`(`unique_id`, `name`, `email`, `encrypted_password`, `salt`, `create_at`, `updated_at`) VALUES (?,?,?,?,?,NOW(),NOW())',[uid,name,email,password,salt],function(err,result, fields){
		conn.on('error',function(err){
			console.log('mysql error',err);
			console.log('khong thanh cong');
			
		});
		console.log('thanh cong');
		//socket.emit('ket-qua-dang-ki',{noidung: ketqua});
	});
	}
	 socket.emit('ket-qua-dang-ki',{noidung: ketqua});
	});	

});
// dang nhap
socket.on('client-dang-nhap-user', function(data){
	var email    	  = data.email;
	var user_password = data.password;
	
 conn.query('SELECT * FROM user where email=?',[email], function(err,result, fields){
		conn.on('error',function(err){
			console.log('mysql error',err);
		});
		if (result && result.length)
		{
			var salt = result[0].salt;
			var encrypted_password = result[0].encrypted_password;
			var hashed_password = checkHashPassword(user_password,salt).passwordHash.slice(0,16);
			if (encrypted_password == hashed_password) {
				ketqua = true;
				//res.end(JSON.stringify(result[0]));
				console.log('dang nhap thanh cong');
				console.log(result[0]);
				socket.join(result[0].unique_id);
			}
			else{
				ketqua = false;
				console.log('dang nhap k thanh cong');
			}
			
		 }
		
	else
	{
		ketqua = false;
	console.log('dang nhap k thanh cong');
	}
	socket.emit('ket-qua-dang-nhap',{noidung: ketqua});
	});
});
//gui du lieu device
// socket.on('client-gui-device', function(data){
// 	device_id = data.device_id;
// 	unique_id = data.unique_id;
//   	name      = data.name;
//   	mode      = data.mode;
//   	speed     = data.speed;
//   	rotation  = data.rotation;
  
//   con.query('UPDATE `devices` SET `device_id`=?,`unique_id`=?,`name`=?,`mode`=?,`speed`=?,`rotation`=? WHERE 1',[device_id,unique_id,name,mode,speed,rotation], function(err,result, fields){
// 		con.on('error',function(err){
// 			console.log('mysql error',err);
// 		});

	
// 	});	



// });


});
//end Giang
/*-------------------------------------------------------------------------------*/
io.on('connection', function (socket) { //Bắt sự kiện một client kết nối đến server
  console.log(socket.id + " connected");


  //device
  socket.join("control");
  conn.connect(function (err){
    //if (err) throw err.stack;
    console.log("ket noi thanh cong");
    let sql0 = `CREATE TABLE IF NOT EXISTS device1_log (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, chieuquay VARCHAR(255), tocdo INT(10)) ENGINE = InnoDB` ;
      //console.log(sql0);
    conn.query(sql0, function (err) {
        //if (err) throw err;
        conn.on('error',function(err){
          console.log('mysql error',err);
        });       
        console.log('Tao bang thanh cong');
    });
  });
  socket.on('mode', function(data){
  	console.log("nhan mode");
  	io.sockets.in('control').emit('control_mode', data);
  });
  socket.on('client-gui-user', function(data){
  	console.log("nhan client-gui-user");
  });  
  socket.on('update_data', function (data) { //thông số động cơ
    //socket.broadcast.emit('news', data); 
    console.log("nhan update");
    var data_json = JSON.stringify(data)
    console.log(".");
    console.log(data);
    console.log("devide id: " + data.device_id);
    console.log("tocdo: " + data.tocdo);
    console.log("chieuquay: " + data.chieuquay);
    conn.connect(function (err){
    //if (err) throw err.stack;
      //nếu thành công
      let sql0 = `CREATE TABLE IF NOT EXISTS device${data.device_id}_log (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,ThoiGian DATETIME DEFAULT CURTIME(), chieuquay VARCHAR(255), tocdo INT(10)) ENGINE = InnoDB` ;
      //console.log(sql0);
      conn.query(sql0, function (err) {
          //if (err) throw err;
          //console.log('Tao bang thanh cong');
      });
      let sql1 = `INSERT INTO device${data.device_id}_log(chieuquay, tocdo) values (  \'${data.chieuquay}\', \'${data.tocdo}\')` ;
      //console.log(sql1);
      conn.query(sql1, function (err) {
          //if (err) throw err;
          //console.log('Thay doi thanh cong');
      });
    });
  });

  //app

});

app.get("/admin", function(req, res){
	res.render("trangchu");
})
