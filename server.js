/*
Autores:
 Carlos Martin-Cleto Jimenez (DNI: 50777523-D)
 Antonio Prada Blanco (DNI: 05303654-S)
*/
var HTTP = require('http');
var URL  = require('url');
var QS   = require('querystring');
var FS   = require('fs');
var MIME = require('mime');

HTTP.createServer(function(request, response) {

//MODEL

var VIEW = {
    render: function (file) {
      FS.readFile('app.html', 'utf-8', function(err, app) {
        if (!err) {
          FS.readFile(file, 'utf-8', function(err, view) {
            if (!err) {
              var data = app.replace(/<%view%>/, view);
              response.writeHead(200, {
                'Content-Type': 'text/html', 
                'Content-Length': data.length 
              }); 
              response.end(data);
            } else { VIEW.error(500, "Server operation Error_r1"); };
          });
        } else { VIEW.error(500, "Server operation Error_r2"); };
      });
    },

    error: function(code,msg) { response.writeHead(code); response.end(msg);},

    file: function(file) {
      FS.readFile(file, function(err, data) {
        if (!err) {
          response.writeHead(200, { 
            'Content-Type': MIME.lookup(file), 
            'Content-Length': data.length 
          }); 
          response.end(data);
        } else { VIEW.error (500, file + " not found"); };
      });
    }
  }


  var CONTROLLER = {

    index: function () { 
        VIEW.render('index.html');
    },
    
    show: function () { 
        VIEW.render('video.html');
    },

    about: function () { 
        VIEW.render('about.html');
    },


    file: function() { VIEW.file(url.pathname.slice(1)); 
    }
  }


  var url       = URL.parse(request.url, true);
  var post_data = "";
  request.on('data', function (chunk) { post_data += chunk; });
  request.on('end', function() {

    post_data = QS.parse(post_data);
    var route = (post_data._method || request.method) + ' ' + url.pathname;

    switch (route) {
      case 'GET /geolocation/index'     : CONTROLLER.index()   ; break;
      case 'GET /geolocation/video'      : CONTROLLER.show()    ; break;
      case 'GET /geolocation/about'     : CONTROLLER.about()   ; break;
      default: {
        if (request.method == 'GET') CONTROLLER.file() ;
        else VIEW.error(400, "Unsupported request");
      }
    }
  });
}).listen(3000);