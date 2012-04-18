
/**
 * Module dependencies.
 */

var express = require('express')
  , socketio = require('socket.io')
  , RedisStore = require('connect-redis')(express)
    , redis = require("redis")
    , client = redis.createClient()
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ 
    secret: 'hayaoshi'
    , store: new RedisStore()
    , cookie: {maxAge: 7 * 24 * 6 * 60 * 60 * 1000 * 2} //2week
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

/*
client.set("sample KEY", "ABC 123");
client.get("sample KEY", function(err, replies){
    console.log('■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■');
    console.log(replies);
    console.log('■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■');
});
client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});
*/

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});





//socket
var io = socketio.listen(app);
var count = 0;
var joinList = [];
var questionList = [];
var pushList = [];
var userProfile;


//socket
io.sockets.on('connection', function(socket) {
  //connect
  count++;
  io.sockets.emit('count change', count);

  //参加者リスト
  var flgSanka = true;
  for (var i in joinList){
    if(joinList[i].name == userProfile){
      flgSanka = false;
      break;
    }
  }
  if(flgSanka){
    var join = {name:userProfile, plusOne:0, minusOne:0};
    joinList.push(join);
  }
  io.sockets.emit('joinList', joinList);
  
  //メッセージを送る
  var tt = new Date().getTime();
  var data = {name:userProfile , text: 'ようこそ', time: tt};
  io.sockets.emit('new message', data);


  //chat
  socket.on('new message', function(data){
    var tt = new Date().getTime();
    var text = data.text;
    //text = text.replace(/[!-\/:-@\[-`{-~]/g, "★");
    text = text.replace(/</g, "＜");
    text = text.replace(/>/g, "＞");
    text = text.replace(/"/g, "”");
    text = text.replace(/'/g, "’");
        console.log('★★★★★★text ' + text );
    var data = {name:data.name , text: text, time: tt};
    io.sockets.emit('new message', data);
  });


  //pushButton
  socket.on('pushButton', function(data){
    //押した人リスト
    var flgPush = true;
    for (var i in pushList){
      if(pushList[i] == data.name){
        flgPush = false;
        break;
      }
    }
    if(flgPush){
      pushList.push(data.name);
      io.sockets.emit('pushButton', data);
    }
  });


  //pushPlus1
  socket.on('pushPlusOne', function(data){

    for (var i  in joinList){
      if(pushList[0] == joinList[i].name){
        joinList[i].plusOne = joinList[i].plusOne + 1;
        break;
      }
    }
    
    io.sockets.emit('joinList', joinList);
    io.sockets.emit('pushList Clear');
    io.sockets.emit('pushPlusOne');
    pushList.length = 0;
  });

  //pushMinus1
  socket.on('pushMinusOne', function(data){
    for (var i  in joinList){
      if(pushList[0] == joinList[i].name){
        joinList[i].minusOne = joinList[i].minusOne + 1;
        break;
      }
    }
    io.sockets.emit('joinList', joinList);
    io.sockets.emit('pushList Clear');
    io.sockets.emit('pushMinusOne');
    pushList.length = 0;
  });


  //NoCount
  socket.on('pushNoCount', function(data){
    io.sockets.emit('pushList Clear');
    pushList.length = 0;
    io.sockets.emit('pushNoCount');
  });



  //pushReset
  //score clear
  socket.on('pushReset', function(data){
    for (var i  in joinList){
      joinList[i].plusOne = 0;
      joinList[i].minusOne = 0;
    }
    io.sockets.emit('joinList', joinList);
    io.sockets.emit('pushList Clear');
    io.sockets.emit('pushReset');
    pushList.length = 0;
  });


  //disconnect
  socket.on('disconnect', function() {
    count--;
    socket.broadcast.emit('count change', count);

    for (var i in joinList){
    if(joinList[i].name == userProfile){
      joinList.splice(i,1);
      break;
     }
    }
    io.sockets.emit('joinList', joinList);

    //メッセージを送る
    var tt = new Date().getTime();
    var data = {name:userProfile , text: 'さようなら', time: tt};
    io.sockets.emit('new message', data);
  });
});




// Routes
//app.get('/', routes.index);
app.get('/', function(req, res) {
  userProfile = req.session.twitID;
  var title = 'node de hayaoshi';
  res.render('index', { title:title, twitID: req.session.twitID });
});


app.post('/', function(req, res){
  //postで取得してsessionに入れるんだけど、socketでsessionの値を使う方法がわからないので、変数にも入れてる。
  req.session.twitID = req.body.name;
  userProfile = req.session.twitID;
  res.render('index', { title:'index', twitID: req.session.twitID });
});


app.get('/logout', function(req,res){
    delete req.session.twitID;
//    res.render('index', { title: req.session.twitID, test:'test' });
    res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
