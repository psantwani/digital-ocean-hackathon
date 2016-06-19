import os from 'os';
import { remote } from 'electron';
const {Menu, MenuItem} = remote;
const {dialog} = remote;
import { menu } from 'electron';
import jetpack from 'fs-jetpack';
import env from './env';
var fs = require('fs');
var fsExtra = require('fs-extra');
var jsonfile = require('jsonfile');
var frontEndFiles;
var backEndFiles;
var project_name;
var folder_name;
var project_dir;
var fileOpen = "";
var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var project_port;
console.log('I am ', appDir.read('package.json', 'json').author);


/**SB-ADMIN-2.JS**/
$(function() {
    $('#side-menu').metisMenu();
});

$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100;
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
});


/**My Editor**/

var Vue = require("vue");
var marked = require("marked");
var fs = require("fs");

var openFile = null;

var editor = new Vue({
  el: '#editor',
  data: {
    input: '',
    filename: null
  },
  filters: {
    marked: marked
  }
});

function openFileDialog() {  
}

function saveFileDialog() {
  if(fileOpen !== ""){
    fs.writeFile(fileOpen, editor.$data.input, function (err) {      
      if (err) { throw err; }
      $("#deployProject").click();
      //alert("Saved!");
    });
  }
}

var template = [
  {
    label: 'Markdown Editor',
    submenu: [
      {
        label: "Quit",
        accelerator: "Command+Q",
        selector: 'terminate:'
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: "Open",
        accelerator: "Command+O",
        click: openFileDialog
      },
      {
        label: "Save",
        accelerator: "Command+S",
        click: saveFileDialog
      },
    ]
  }
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

var projectCreated = false;

/**Get list of files**/
function readFilesInDir(dirPath, callback){
  fs.realpath(dirPath, function(err, path) {
    if (err) {
      console.log(err);
      return;
    }
  });
  fs.readdir(dirPath, function(err, files) {
    if (err) return;
    files.forEach(function(f) {
      if(f == "project_structure.json"){
        var file = dirPath + "/" + f;
        jsonfile.readFile(file, function(err, obj) {            
          frontEndFiles = obj.front_end;
          backEndFiles = obj.back_end;  
          if(!projectCreated){
            files.forEach(function(f) {
            if(f == "project_details.json"){
              var file = dirPath + "/" + f;
              jsonfile.readFile(file, function(err, obj) {  

                if(typeof obj.port === "undefined"){
                    $.ajax({
                  type: "GET",
                  dataType: "html",
                  url:'http://139.59.9.43:3000/getFreePort',
                success: function(data){  
                  project_port = data;                  
                  updateProjectDetails(false);
                    }
                  });  
                }                

                var url = obj.url;            
                var lastDeployedAt = obj.lastDeployedAt;
                if(lastDeployedAt != "Not deployed yet." && typeof lastDeployedAt != "undefined"){
                  $("#lastDeployedAt").html(new Date(lastDeployedAt));  
                }else{
                  $("#lastDeployedAt").html(lastDeployedAt);  
                }            
                $("#projectUrl").html(url);
              });
            }

            if(frontEndFiles.indexOf(f.toString()) > -1){
              $("#frontend_files > ul").append($('<li>').html("<a class = 'projectFile' href='#editor'><span class='fileNameInList'>" + f + "</span><span class='rename_file fa fa-pencil' id='"+ dirPath + "/" + f +"_rename_file'></span><span class='remove_file remove_frontend_file fa fa-minus' id='"+ dirPath + "/" + f +"_remove_file'></span></a>"));          
            }
            else if(backEndFiles.indexOf(f.toString()) > -1){
              $("#backend_files > ul").append($('<li>').html("<a class = 'projectFile' href='#editor'><span class='fileNameInList'>" + f + "</span><span class='rename_file fa fa-pencil' id='"+ dirPath + "/" + f +"_rename_file'></span><span class='remove_file remove_backend_file fa fa-minus' id='"+ dirPath + "/" +  f +"_remove_file'></span></a>"));
            }
            projectCreated = true;
            $("#editor").focus();
          });
          }                    
        });
      }
    });
  });
callback(true);
}


/**Creating New Project**/
$("#newProject").on("click", function(){
  swal({
      title: "DO HACK 2016", 
      text: "Enter your project name:", 
      type: "input",
      inputType: "text",
      showCancelButton: true,
      closeOnConfirm: true
    }, function(name) { 
      project_name = name;   
      folder_name = project_name.replace(/ /g,'');
      var dirname = __dirname.toString();
      dirname = dirname.replace("/build","");
      var dir = dirname + "/MyApps/" + folder_name;
      project_dir = dir;
    if (!fs.existsSync(dir)){
        fsExtra.mkdirs(dir,function(err){
          if (err) return console.error(err);
          fsExtra.copy(dirname + '/DOHACK2016/', dir + '/', function (err) {
            if (err) return console.error(err)
            console.log("files copied!");
            readFilesInDir(project_dir, function(data){
              if(data){
                  console.log("deploying");
                  $("#deployProject").click();
              }
            });
          });       
        //   fsExtra.copy(dirname + '/DOHACK2016/package.json', dir + '/package.json', function (err) {
        //     if (err) return console.error(err)
        //     console.log("package.json created!")            
        //     exec("cd " + project_dir + " && npm install", function (error, stdout, stderr) {            
        //     alert("Modules installed");          
        //     if(error != null){
        //       console.log('exec error : ' + error);
        //     }
        //   });
        // });       
        // fsExtra.copy(dirname + '/DOHACK2016/server.js', dir + '/server.js', function (err) {
        //     if (err) return console.error(err)
        //     console.log("server.js created!")
        // });       
        // fsExtra.copy(dirname + '/DOHACK2016/project_details.json', dir + '/project_details.json', function (err) {
        //     if (err) return console.error(err)
        //     console.log("server.js created!")
        // });       
        // fsExtra.copy(dirname + '/DOHACK2016/project_structure.json', dir + '/project_structure.json', function (err) {
        //     if (err) return console.error(err)
        //     console.log("server.js created!")
        // });       
        // fsExtra.copy(dirname + '/DOHACK2016/index.html', dir + '/index.html', function (err) {
        //     if (err) return console.error(err)
        //     console.log("index.html created!")
        // });       
        // fsExtra.copy(dirname + '/DOHACK2016/client.js', dir + '/client.js', function (err) {
        //     if (err) return console.error(err)
        //     console.log("client.js created!")
        // });     
        // fsExtra.copy(dirname + '/DOHACK2016/style.css', dir + '/style.css', function (err) {
        //     if (err) return console.error(err)
        //     console.log("style.css created!")
        //     readFilesInDir(project_dir);
        // });   
        // fsExtra.copy(dirname + '/DOHACK2016/flightplan.js', dir + '/flightplan.js', function (err) {
        //     if (err) return console.error(err)
        //     console.log("style.css created!")
        //     readFilesInDir(project_dir);
        // });   
        console.log("New project folder ready!")

        });       
      }      
  });  
});


$(document).click(function(event) {    
    var ele = $(event.target);
    var className = ele[0].className;
    console.log(className);
    if(className.indexOf("remove_backend_file") > -1){      
      var ele = $(event.target);  
      var filePath = ele[0].id.toString().split("_remove_file")[0];    
      var eleToBeDestroyed = ele[0].parentNode.parentNode;      
      $(eleToBeDestroyed).remove();
      deleteFile(filePath);        
      var arr = filePath.split("/");
      var index = arr.length - 1;
      var indexInFiles = backEndFiles.indexOf(arr[index]);
      if(indexInFiles > -1){
        backEndFiles.splice(indexInFiles,1);
        updateProjectStructure();
      }
    }
    else if(className.indexOf("remove_frontend_file") > -1){
      var ele = $(event.target);  
      var filePath = ele[0].id.toString().split("_remove_file")[0];    
      var eleToBeDestroyed = ele[0].parentNode.parentNode;      
      $(eleToBeDestroyed).remove();
      deleteFile(filePath);      
      var arr = filePath.split("/");
      var index = arr.length - 1;
      var indexInFiles = frontEndFiles.indexOf(arr[index]);
      if(indexInFiles > -1){
        backEndFiles.splice(indexInFiles,1);
        updateProjectStructure();
      }  
    }
    else if(className.indexOf("rename_file") > -1){
      var ele = $(event.target);  
      var filePath = ele[0].id.toString().split("_rename_file")[0];    
      var eleToBeRenamed = ele[0].parentNode.firstChild;            
      renameFile(eleToBeRenamed, filePath);
    }
    else if(className == "projectFile"){
      var name = $(event.target).text();
      var file = project_dir + "/" + name;
      console.log(file);      
      fs.readFile(file, 'utf8', function(err, data) {
          fileOpen = file;
          console.log("#codeEditor");
          // $("#codeEditor").val(data);
          editor.$data.filename = name;
          editor.$data.input = data;
          $("#codeEditor").focus();
      });
    }    
});

function deleteFile(filePath){
  fsExtra.remove(filePath, function (err) {
    if (err) return console.error(err) 
    console.log('success!')
  });
}

function renameFile(ele, filePath){
  var oldName = ele.innerHTML;  
  swal({
      title: "DO HACK 2016", 
      text: "Rename file to:", 
      type: "input",
      inputType: "text",
      showCancelButton: true,
      closeOnConfirm: true
    }, function(name) {       
      var newName = name;
      var newFilePath = filePath.replace(oldName, newName);
      console.log("old : " + oldName);
      console.log("new  : " + newName);
      console.log("old path : " + filePath);
      console.log("new path : " + newFilePath);
      fsExtra.move(filePath, newFilePath, function (err) {
        ele.innerHTML = name;
        if (err) {
          throw err;
        } 
        console.log("Rename success.");
      });
  });
}


var exec = require('child_process').exec;
var child;

$("#deployProject").on("click", function(){    
  exec("fly production -f " + project_dir + "/flightplan.js", function (error, stdout, stderr) {
    console.log(stdout.toString('utf8'));
    alert("Deployed");
    updateProjectDetails();
    if(error != null){
      console.log('exec error : ' + error);
    }
  });

});

function updateProjectStructure(){
  var file = project_dir + "/project_structure.json";
  console.log(file);
  
  var data = {
    "front_end" : frontEndFiles,
    "back_end" : backEndFiles
  }
  data = JSON.stringify(data);
  console.log(data)
  fsExtra.outputFile(file,data, function (err) {
    console.log(err) // => null       
  });
}


function updateProjectDetails(show){
  var file = project_dir + "/project_details.json";
  console.log(file);
  var deployTime = Date.now();
  var data = {
    "url" : "http://139.59.9.43:" + project_port + "/",
    "lastDeployedAt" : deployTime,
    "port" : parseInt(project_port)
  }
  data = JSON.stringify(data);
  console.log(data)
  fsExtra.outputFile(file,data, function (err) {
    console.log(err) // => null  
    if(show !== false){
      $("#lastDeployedAt").html(new Date(deployTime));
      $("#projectUrl").html("http://139.59.9.43:" + project_port + "/");
    }     
  });
}

$("#openProject").on("click", function(){

  dialog.showOpenDialog({properties: ['openDirectory']},
    function (folder) {
    console.log(folder);
    if(typeof folder != "undefined"){
      var folderPath = folder[0];
    project_dir = folderPath;
    if (folderPath) {

      jsonfile.readFile(project_dir + "/project_details.json", function(err, obj) {  
        project_port = obj.port;
      });

      readFilesInDir(folderPath, function(data){        
      });
    }
    }    
  });
});

//Add file.
$(".add_new_file").on("click", function(event){
  var element = $(event.target)[0];
  var id = element.id;
  swal({
      title: "DO HACK 2016", 
      text: "Enter new file name:", 
      type: "input",
      inputType: "text",
      showCancelButton: true,
      closeOnConfirm: true
    }, function(name) { 
      if(id == "frontend_add_file"){
        $("#frontend_files > ul").append($('<li>').html("<a class = 'projectFile' href='#editor'><span class='fileNameInList'>" + name + "</span><span class='rename_file fa fa-pencil' id='"+ project_dir + "/" + name +"_rename_file'></span><span class='remove_file remove_frontend_file fa fa-minus' id='"+ project_dir + "/" + name +"_remove_file'></span></a>"));         
        createFile(project_dir + "/" + name);
        frontEndFiles.push(name);
        updateProjectStructure();
      }      
      else if(id == "backend_add_file"){
        $("#backend_files > ul").append($('<li>').html("<a class = 'projectFile' href='#editor'><span class='fileNameInList'>" + name + "</span><span class='rename_file fa fa-pencil' id='"+ project_dir + "/" + name +"_rename_file'></span><span class='remove_file remove_backend_file fa fa-minus' id='"+ project_dir + "/" +  name +"_remove_file'></span></a>"));
        createFile(project_dir + "/" + name);
        backEndFiles.push(name);
        updateProjectStructure();
      }
  });
});

function createFile(filePath){
  fsExtra.ensureFile(filePath, function (err) {
    if (err) return console.error(err) 
    console.log('success!')
  });
}


