var plan = require('flightplan');

var myDir = __dirname.split("/");
var appName = myDir[myDir.length - 1];
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


plan.local(function(local) {
  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('find . -type f', {silent: true});
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  remote.exec('forever start ~/'+appName+'/'+startFile);
});