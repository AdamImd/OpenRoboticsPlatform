function $(doc) {
    return document.getElementById(doc);
}

async function editor_nav_init(callback, data = null) {
    var nav = $("editor_nav_tree");
    var tree = "";
    var path = ["/"];

    var selected_id = [];
    var old_selected = document.getElementsByClassName("caret-down");
    for(var i = 0; i < old_selected.length; i++)
        selected_id.push(old_selected[i].id);

    if(!data){
        var data = await read_file_HTTP("/s/tree.bin");
        localStorage.setItem("tree_data", data);
    }

    data.split("\x1F").forEach(element => {
        if(element.length != 0) {
            if(element[0] == "\x1D"){ // Folder Start
                var local_path = path[path.length-1] + element.substring(1) + "/";
                var selected = selected_id.includes(local_path) ? [" caret-down", " active"] : ["", ""];
                tree += '<li> <span id="' + local_path + '" class="caret' + selected[0] + '">'+ 
                        element.substring(1) + '/</span> <ul class="nested' + selected[1] + '"> ';
                path.push(local_path);
            }
            else if(element[0] == "\x1C"){ // File
                tree += '<li id="' + path[path.length-1] + element.substring(1) + 
                     '" class="nav_file">-' + element.substring(1) + '</li>';
            }
            else if(element[0] == "\x1E"){ // Folder End
                tree += '</ul></li>';
                path.pop();
            }        
        }
    });


    nav.innerHTML = tree;

    var folders = document.getElementsByClassName("caret");
    for(var i = 0; i < folders.length; i++){
        folders.item(i).addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        });
    };

    var files = document.getElementsByClassName("nav_file");
    for(var i = 0; i < files.length; i++){
        files.item(i).addEventListener("click", function(event) {
            if(!event.ctrlKey){
                var selected = document.getElementsByClassName("nav_selected");
                var len = selected.length;
                for(var i = 0; i < len; i++){
                    selected.item(0).classList.remove("nav_selected");
                }
            }
            this.classList.add("nav_selected");
        });
        files.item(i).addEventListener("dblclick", async function() {
            callback(this.id);
        });
    };
}

