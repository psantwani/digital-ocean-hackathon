var express			= require('express');
var app				= express();
var http			= require('http').Server(app);
var port			= process.env.PORT || 9089;

app.use(express.static(__dirname + "/"));
app.get('/', function(req,res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
	console.log('Magic happens at port *' + port);
});