/*
var http = require("http");
server = http.createServer(function(req,res){
	res.writeHead(200,{
		'Content-Type':'text/plain'
	});
	res.write('Hello World');
	res.end();
});
server.listen(80);
console.log('server started');
*/

/*var http = require('http');
server = http.createServer(function(req,res){
	res.writeHead(200,{
		'Content-Type':'text/html'
	});
	res.write('<h1>hello world</h1>');
	res.end();
});
*/

//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users=[],  //保存在线用户的昵称
    people={}; //保存单播对象id
    x=0;

app.use('/',express.static("F:/snChat"+'/WWW'));
server.listen(80);
console.log('server started')

//socket部分
/*
io.on('connection',function(socket){
	socket.on('foo',function(data){
		console.log(data);
	})
});
*/
 io.on('connection',function(socket){
 	socket.on('login',function(nickname){
 		if(users.indexOf(nickname) > -1){
 			socket.emit('nickExisted');
 		}else{
 			socket.userIndex = users.length;
 			socket.nickname = nickname;
 			users.push(nickname);
 			var nm = nickname;
 			people[nm] = socket;   //单播对象保存为socket实例
 			socket.emit('loginSuccess');
 			io.sockets.emit('system',nickname,users.length,'login',users);
 		}
 	});

 	socket.on('disconnect',function(){
 		users.splice(socket.userIndex,1);
 	    socket.broadcast.emit('system',socket.nickname,users.length,'logout',users);
 	});

 	socket.on('postMsg',function(msg){
 		socket.broadcast.emit('newMsg',socket.nickname,msg);
 	});

 	socket.on('img',function(imgData){
 		socket.broadcast.emit('newImg',socket.nickname,imgData);
 	});
    
    //指定对象单播通信
 	socket.on('postMsgTo_single',function(receiverName,msg){
 		people[receiverName].emit('newMsgTo_single',socket.nickname,msg)
 	});

 })

