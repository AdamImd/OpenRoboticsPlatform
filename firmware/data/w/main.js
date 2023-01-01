function $(doc) {
    return document.getElementById(doc);
}

function editor_nav_init(event_fun, event_funct) {
    var nav = $("editor_nav_tree");
    var tree = "";
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        if(this.status == 200){
            //var path = ["/u/"]
            var path = ["/"]
            this.response.split("\x1F").forEach(element => {
                if(element.length != 0) {
                    if(element[0] == "\x1D"){
                        //console.log("Dir: " + element.substring(1));
                        tree += '<li> <span class="caret">'+
                        element.substring(1) + '/</span> <ul class="nested"> ';
                        path.push(path[path.length-1] + element.substring(1) + "/");
                    }
                    else if(element[0] == "\x1C"){
                        //console.log("File: " + element.substring(1));
                        tree += '<li id="' + path[path.length-1] + element.substring(1) + 
                             '" class="nav_file">-' + element.substring(1) + '</li>';
                    }
                    else if(element[0] == "\x1E"){
                        //console.log("End of Dir")
                        tree += '</ul></li>';
                        path.pop();
                    }        
                }
                nav.innerHTML = tree;
                var folders = document.getElementsByClassName("caret")
                for(var i = 0; i < folders.length; i++){
                    folders.item(i).addEventListener("click", function() {
                        this.parentElement.querySelector(".nested").classList.toggle("active");
                        this.classList.toggle("caret-down");
                    });
                };
                var files = document.getElementsByClassName("nav_file")
                for(var i = 0; i < files.length; i++){
                    files.item(i).addEventListener("click", function(event) {
                        if(!event.ctrlKey){
                            var selected = document.getElementsByClassName("nav_selected")
                            var len = selected.length;
                            for(var i = 0; i < len; i++){
                                selected.item(0).classList.remove("nav_selected");
                            }
                        }
                        this.classList.add("nav_selected");
                    });
                    files.item(i).addEventListener("dblclick", function() {
                      event_fun(this.id, event_funct);
                    });
                };
             });
        }
    }
    req.timeout = 0;
    req.open("GET", "./s/tree.bin", true);
    req.send();
}

function open_file(file_path, callback){
    var decoder = new TextDecoder();
    var data;
    console.log(file_path);
    var socket = new WebSocket("ws://" + location.hostname + ":81/");
    socket.binaryType = "arraybuffer";
  
    socket.addEventListener("message", function(event){
        //console.log(event.data);
        if(event.data == ""){
            //console.log("Done");
            //console.log(data);
            socket.close();
            return callback(file_path, data);
        } else  {
            data+= (decoder.decode(event.data, {stream:true}));
        }
    });
  
    socket.addEventListener("error", function(event){
        console.log(event);
        socket.close();
    });
  
    var buffer = new ArrayBuffer(128)
    var buffer_num = new Uint16Array(buffer);
    var buffer_chr = new Uint8Array(buffer);
    buffer_num[0] = 1;
    for (let i = 0; i  < file_path.length; i++)
        buffer_chr[2+i] = Math.min(file_path.charCodeAt(i), 255);
        // TODO: UTF-8
  
    socket.addEventListener("open", function(event){
        data = ""
        socket.send(buffer);
    });
}
  
