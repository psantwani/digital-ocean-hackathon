var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
app.use(express.static('public'));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});