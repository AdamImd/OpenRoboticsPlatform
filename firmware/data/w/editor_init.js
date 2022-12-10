function $(doc) {
    return document.getElementById(doc);
}

window.onload = function () {
    document.getElementById("editor_code_doc_start").onclick = function () {
        button = this;
        button.onclick = null;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() { button.innerText += "." };
        req.onloadend = function () {
            if(this.status != 200){
                button.innerText = "ERROR: " + this.status + "(" + this.response.length + ")";
                this.open("GET", "./editor.js", true);
                this.send();
                return;
            }
            $("editor_code_doc").removeChild(button);
            eval(this.response);
        };
        button.innerText = "Loading";
        req.timeout = 0;
        req.open("GET", "./editor.js", true);
        req.send();
    };

    editor_nav_init();
};

function editor_nav_init() {
    nav = $("editor_nav_tree");
    tree = "";
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        if(this.status == 200){
            path = ["/u/"]
            this.response.split("\x1F").forEach(element => {
                if(element.length != 0) {
                    if(element[0] == "\x1D"){
                        console.log("Dir: " + element.substring(1));
                        tree += '<li> <span class="caret">'+
                        element.substring(1) + '/</span> <ul class="nested"> ';
                        path.push(path[path.length-1] + element.substring(1) + "/");
                    }
                    else if(element[0] == "\x1C"){
                        console.log("File: " + element.substring(1));
                        tree += '<li id="' + path[path.length-1] + element.substring(1) + 
                             '" class="nav_file">-' + element.substring(1) + '</li>';
                    }
                    else if(element[0] == "\x1E"){
                        console.log("End of Dir")
                        tree += '</ul></li>';
                        path.pop();
                    }        
                }
                nav.innerHTML = tree;
                folders = document.getElementsByClassName("caret")
                for(var i = 0; i < folders.length; i++){
                    folders.item(i).addEventListener("click", function() {
                        this.parentElement.querySelector(".nested").classList.toggle("active");
                        this.classList.toggle("caret-down");
                    });
                };
                files = document.getElementsByClassName("nav_file")
                for(var i = 0; i < files.length; i++){
                    files.item(i).addEventListener("click", function(event) {
                        if(!event.ctrlKey){
                            selected = document.getElementsByClassName("nav_selected")
                            len = selected.length;
                            for(var i = 0; i < len; i++){
                                selected.item(0).classList.remove("nav_selected");
                            }
                        }
                        this.classList.add("nav_selected");
                    });
                    files.item(i).addEventListener("dblclick", function() {
                        console.log(this.id);
                    });
                };
             });
        }

    }
    req.timeout = 0;
    req.open("GET", "./tree.bin", true);
    req.send();
}