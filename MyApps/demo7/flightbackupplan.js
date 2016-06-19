var plan = require('flightplan');
var jsonfile = require('jsonfile');
var Fiber = require('fibers');
var myDir = __dirname.split("/");
var appName = myDir[myDir.length - 1];
console.log(appName);
var username = 'master';
var startFile = 'server.js';

//var tmpDir = appName+'-' + new Date().getTime();
var tmpDir = appName;


// configuration
plan.target('staging', [
  {
    host: '139.59.9.43',
    username: username,
    password : 'master',
    agent: process.env.SSH_AUTH_SOCK
  }
]);

plan.target('production', [
  {
    host: '139.59.9.43',
    username: username,
    password : 'master',
    agent: process.env.SSH_AUTH_SOCK
  },
]);

// run commands on localhost
plan.local(function(local) {
  local.log('Copy files to remote hosts');
  var file = __dirname + "/project_details.json";
  console.log(file);
  var lastDeployedAt;
  var currentTime;
  var differenceInTime;
  
  jsonfile.readFile(file, function(err, obj) {
    console.log('json object');
    console.log(obj);    
    lastDeployedAt = obj.lastDeployedAt;
    if(lastDeployedAt == "Not deployed yet."){
      var fiber = Fiber(function() {
      var filesToCopy = local.exec('find . -type f', {silent: true});
      console.log("files to copy");
      console.log(filesToCopy);
      local.transfer(filesToCopy, "/tmp/" + tmpDir);
    });      
    fiber.run();      
    }
    else{
      currentTime = Date.now();
    differenceInTime = Math.ceil((currentTime - lastDeployedAt)/1000);      
    var fiber = Fiber(function() {
      var filesToCopy = local.exec("find . -newermt '-" + differenceInTime + " seconds'", {silent: true});  
      console.log("files to copy");
      console.log(filesToCopy);
      local.transfer(filesToCopy, "/tmp/" + tmpDir);
    });      
    fiber.run();    
    }    
  });  
      
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  // remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});
  //remote.sudo('npm install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  remote.exec('forever start ~/'+appName+'/'+startFile);
});