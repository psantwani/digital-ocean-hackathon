var express			= require('express');
var app				= express();
var http			= require('http').Server(app);
var jsonfile 		= require('jsonfile');
var auth = require('http-auth');
var port;

/**Basic authentication**/
var basic = auth.basic({
  realm: "Digital Notion.",
  file: __dirname + "/users.htpasswd" 
});

app.use(auth.connect(basic));
jsonfile.readFile(__dirname + "/project_details.json", function(err, obj) {
port = obj.port;
console.log(port);
if(typeof port != "undefined"){
	http.listen(port, function(){
	console.log('Magic happens at port *' + port);
});
}
});

app.use(express.static(__dirname + "/"));
app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});

