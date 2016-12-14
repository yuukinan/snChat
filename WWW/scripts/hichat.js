window.onload = function(){
	var hichat = new Hichat();
	hichat.init();
};

var Hichat = function(){
	this.socket = null;
}

Hichat.prototype = {
	init:function(){
		var that = this;
		this.socket = io.connect();
		this.socket.on('connect',function(){
			document.getElementById("info").textContent = 'get youself a nickname :)';
		    document.getElementById("nickWrapper").style.display="block";
		    document.getElementById('nicknameInput').focus();
		});

		document.getElementById("loginBtn").addEventListener("click",function(){
			var nickName = document.getElementById("nicknameInput").value;
			if(nickName.trim().length != 0){
				that.socket.emit('login',nickName);
			}else{
				document.getElementById("nicknameInput").focus();
			}
		},false);
	
		this.socket.on('nickExisted',function(){
			document.getElementById('info').textContent = '!nickname is taken, please choose another one';
		});

		this.socket.on('loginSuccess',function(){
			document.title = 'hichat|' + document.getElementById("nicknameInput").value;
			document.getElementById("loginWrapper").style.display="none";
			document.getElementById('messageInput').focus();
		});
	

		this.socket.on('system',function(nickName,userCount,type,users){
			var msg = nickName + " " + (type=='login'?'joined':'left');
			that._displayNewMsg('system',msg,'red');
	//		var p = document.createElement("p");
	//		p.textContent = msg;
	//		document.getElementById("historyMsg").appendChild(p);
			document.getElementById("status").textContent = userCount+" "+(userCount>1?'users':'user')+" "+'online';
			
			//显示当前在线用户名单
			document.getElementById("users").innerHTML = "";
			for(var i=0;i<userCount;i++){
				document.getElementById("users").innerHTML =document.getElementById("users").innerHTML+ " "+ '<span id='+i+'>' + users[i] + '</span>';
			}
				
		});

		document.getElementById("sendBtn").addEventListener('click',function(){
			var messageInput = document.getElementById("messageInput"),
			    msg = messageInput.value;
			messageInput.value = "";
			messageInput.focus();
			if(msg.trim().length != 0){
				that.socket.emit('postMsg',msg);
				that._displayNewMsg('me',msg);
			}
		},false);

		this.socket.on('newMsg',function(user,msg){
			that._displayNewMsg(user,msg);
		});
        
        //指定对象单播通信
        var people = document.getElementById("users");
        people.addEventListener('click',function(event){
        	var receiverId = event.target.id;
        	var receiverName = document.getElementById(receiverId).innerHTML;
        	var messageInput = document.getElementById("messageInput"),
			    msg = messageInput.value;
			messageInput.value = "";
			messageInput.focus();
			if(msg.trim().length != 0){
				that.socket.emit('postMsgTo_single',receiverName,msg);
				that._displayNewMsg('me to'+" "+receiverName,msg);
			}
        },false);

        this.socket.on('newMsgTo_single',function(user,msg){
        	that._displayNewMsg(user,msg);
        });

		document.getElementById("sendImage").addEventListener('change',function(){
			if(this.files.length != 0){
				var file = this.files[0],
				    reader = new FileReader();
				if(!reader){
					that._displayNewMsg('system','!your browser does not support fileReader','red');
					this.value = '';
					return;
				}else{
					reader.onload = function(e){
						this.value = '';
						that.socket.emit('img',e.target.result);
						that._displayImage('me',e.target.result);
					}
					reader.readAsDataURL(file);
				}
			}
		},false);

		this.socket.on('newImg',function(user,img){
			that._displayImage(user,img);
		})
	},

	_displayNewMsg:function(user, msg, color){
		var container = document.getElementById("historyMsg"),
		    msgToDisplay = document.createElement("p"),
		    date = new Date().toTimeString().substr(0,8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + ":(" + date + "):" + msg;
		container.appendChild(msgToDisplay); 
		container.scrollTop = container.scrollHeight;
	},

	_displayImage:function(user,imgData,color){
		var container = document.getElementById("historyMsg"),
		    msgToDisplay = document.createElement("p"),
		    date = new Date().toTimeString().substr(0,8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + ":(" + date + "):" + '<br/>' + '<a href="' + imgData + '"target="_blank"><img src="'+imgData+'"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	}
};
