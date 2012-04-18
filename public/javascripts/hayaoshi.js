//    script(type='text/javascript')
      var socket = io.connect();

      socket.on('count change', function(count) {
        // event
        $('#count').text(count);
        //$('#count').text('test');
      });

/*
      //sankaList
      socket.on('sankaList', function(sanka) {
        // event
        $('#sankaList').html('');
        for (var i in sanka){
          //if(sanka[i] != null)
          //  $('#sankaList').append('<td><table><tr><td>' + '<img src="https://api.twitter.com/1/users/profile_image?screen_name=' + sanka[i] + '" title="'+ sanka[i] + '"/> ' + 
          //  '<tr><td>' + sanka[i] +'</td></tr>' +
          //  '<tr><td><div class="plus1">+1</div></td></tr>' +
          //  '<tr><td><div class="minus1">-1</div></td></tr>' +
          //  '</td></tr></table></td>');
        }
      });
*/
      //joinList
      socket.on('joinList', function(joinList) {
        // event
        $('#joinList').html('');
        for (var i in joinList){
          if(joinList[i].name != null)
            $('#joinList').append('<td><table><tr><td colspan=2>' + '<img src="https://api.twitter.com/1/users/profile_image?screen_name=' + joinList[i].name + '" title="'+ joinList[i].name + '"/> ' + 
            '<tr><td  colspan=2>' + joinList[i].name +'</td></tr>' +
            '<tr><td><div class="plus1">+1</div></td><td><div class="Score">' + 
            joinList[i].plusOne +'</div></td></tr>' +
            '<tr><td><div class="minus1">-1</div></td><td><div class="Score">' + 
            joinList[i].minusOne + '</div></td></tr>' +
            '</td></tr></table></td>');
        }
      });



      //chat
      socket.on('new message', function(data){
       var dTime = new Date();
       dTime.setTime(data.time);
       //$('#chat').append('<div>' + data.name + ':' + data.text + ':' + dTime + '</div>');
       //$('#chat').append('<div>' + '<img src="https://api.twitter.com/1/users/profile_image?screen_name=' + data.name + '&size=mini" title="'+ data.name + '"/>' + ':' + data.text + ':' + dTime + '</div>');
       
       $('#chat').prepend('<div>' + '<img src="https://api.twitter.com/1/users/profile_image?screen_name=' + data.name + '&size=mini" title="'+ data.name + '"/>' + ':' + data.text + ':' + dTime + '</div>');
      });

      //早押し機を押したとき
      socket.on('pushButton', function(data){

        $('#pushList').append('<td>' + '<img src="https://api.twitter.com/1/users/profile_image?screen_name=' + data.name + '" title="' + data.name + '" /></td>');
        $('#push').get(0).play();

        //$('#test').html('socket.on pushButton');
      });

      //pushList Clear
      socket.on('pushList Clear', function(){
        $('#pushList').html('');
      });

      //+1 Plus1
      socket.on('pushPlusOne', function(){
        $('#correct').get(0).play();
      });

      //-1 Minus1
      socket.on('pushMinusOne', function(){
        $('#wrong').get(0).play();
      });

      //NoCount
      socket.on('pushNoCount', function(){
        $('#whistle').get(0).play();
      });

      //Reset
      socket.on('pushReset', function(){
        $('#claps').get(0).play();
      });


      //chat
      function send(){
       var name = $('#username').val();
       var text = $('#text').val();
       if(text && name && name != "Twitter ID"){
        var time = new Date().getTime();
        socket.emit('new message', { name: name, text:text, time:time});
        $('#text').val('');
       }
      };


      //早押し機
      function sendPush(){
       var name = $('#username').val();
       var time = new Date().getTime();
       socket.emit('pushButton', { name: name, time: time});

      };

      //+1 Plus1
      function sendPlusOne(){
      //  $('#test').html('かきかえ');
       //var time = new Date().getTime();
       var name = $('#username').val();
       socket.emit('pushPlusOne', { name: 'name', time: 'time'});
      };

      //-1 Munus1
      function sendMinusOne(){
      //  $('#test').html('MINUS ONE');
       var name = $('#username').val();
       socket.emit('pushMinusOne', { name: 'name', time: 'time'});
      };

      //NoCount
      function sendNoCount(){
      //  $('#test').html('NoCount');
       var name = $('#username').val();
       socket.emit('pushNoCount', { name: 'name', time: 'time'});
      };

      //Reset
      function sendReset(){
      //  $('#test').html('Reset');
       var name = $('#username').val();
       socket.emit('pushReset', { name: 'name', time: 'time'});
      };
