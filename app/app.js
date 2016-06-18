
import os from 'os'; // native node.js module
import { remote } from 'electron';
const {Menu, MenuItem} = remote;
import { dialog } from 'electron';
import { menu } from 'electron';
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';

var frontEndFiles = ["style.css", "client.js", "index.html"];
var backEndFiles = ["package.json", "server.js"];

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

console.log('The author of this app is:', appDir.read('package.json', 'json').author);

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
            topOffset = 100; // 2-row-menu
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
  dialog.showOpenDialog(function (filenames) {
    console.log(filenames);
    var filename = filenames[0];
    if (filename) {
      fs.readFile(filename, "utf8", function (err, data) {
        if (err) { throw err; }
        editor.$data.filename = filename;
        editor.$data.input = data;
      });
    }
  });
}

function saveFileDialog() {
  function save(filename) {
    fs.writeFile(filename, editor.$data.input, function (err) {
      if (err) { throw err; }
      alert("Saved!");
    });
  }

  if (editor.$data.filename) {
    save(editor.$data.filename);
  } else {
    dialog.showSaveDialog(function (filename) {
      if (filename) {
        save(filename);
        editor.$data.filename = filename;
      }
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


var fs = require('fs');
var fsExtra = require('fs-extra')

/**Get list of files**/
function readFilesInDir(dirPath){
	fs.realpath(dirPath, function(err, path) {
    if (err) {
        console.log(err);
     return;
    }
    console.log('Path is : ' + path);
	});
	fs.readdir(dirPath, function(err, files) {
    if (err) return;
    files.forEach(function(f) {
        console.log('Files: ' + f);
        if(frontEndFiles.indexOf(f.toString()) > -1){
        	$("#frontend_files > ul").append($('<li>').html("<a href='#'>" + f + "</a>"));        	
        }
        else if(backEndFiles.indexOf(f.toString()) > -1){
        	$("#backend_files > ul").append($('<li>').html("<a href='#'>" + f + "</a>"));
        }
    });
	});
}

/**Creating New Project**/
var project_name;
var folder_name;
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
		if (!fs.existsSync(dir)){
    		fsExtra.mkdirs(dir,function(err){
    			if (err) return console.error(err);
    			fsExtra.copy(dirname + '/DOHACK2016/package.json', dir + '/package.json', function (err) {
  					if (err) return console.error(err)
  					console.log("package.json created!")
				});    		
				fsExtra.copy(dirname + '/DOHACK2016/server.js', dir + '/server.js', function (err) {
  					if (err) return console.error(err)
  					console.log("server.js created!")
				});    		
				fsExtra.copy(dirname + '/DOHACK2016/index.html', dir + '/index.html', function (err) {
  					if (err) return console.error(err)
  					console.log("index.html created!")
				});    		
				fsExtra.copy(dirname + '/DOHACK2016/client.js', dir + '/client.js', function (err) {
  					if (err) return console.error(err)
  					console.log("client.js created!")
				});    	
				fsExtra.copy(dirname + '/DOHACK2016/style.css', dir + '/style.css', function (err) {
  					if (err) return console.error(err)
  					console.log("style.css created!")
  					readFilesInDir(dir);
				});   
				console.log("New project folder ready!")

    		});    		
		}
    });  
});
