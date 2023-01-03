function $(doc) {
    return document.getElementById(doc);
}

window.onload = function () {
    editor_nav_init(function(path){ $("run_file_path").value = path; });

    $("run_file_path").value = localStorage.getItem("exe_file_name");

    addEventListener("storage", function(ev){
        if (ev.key == 'exe_file_name')
            $("run_file_path").value = ev.newValue;
        if (ev.key == 'tree_data')
            editor_nav_init(function(path){ $("run_file_path").value = path; }, ev.newValue);
    });

    $("run_file_execute").onclick = function (event) { 
        file_execute($("run_file_path").value);
    }
    
    document.onkeydown = function (event) {
        if (event.ctrlKey || event.altKey){
            if(event.key == "Enter"){
                window.open("", "editor").focus()
            }
        }
        if(event.key == " "){
            event.preventDefault();
            $("run_file_execute").click();
        }
    };

    command_new_socket(); // Create global WS connection.
};


async function file_execute(path){
    var sock = await command_new_socket(false);
    var data = await read_file_command(path, sock);
    command_close_socket(sock);

    try{
        window.eval(data);
    } catch (e) {
        alert(e.lineNumber);
        alert(e.message);
        alert(e.name);
    };
}