function $(doc) {
    return document.getElementById(doc);
}

var enable = false;

window.addEventListener("load", async function () {
    editor_nav_init(function(path){ $("run_file_path").value = path; });

    $("run_file_path").value = localStorage.getItem("exe_file_name");

    addEventListener("storage", function(ev){
        if (ev.key == 'exe_file_name')
            $("run_file_path").value = ev.newValue;
        if (ev.key == 'tree_data')
            editor_nav_init(function(path){ $("run_file_path").value = path; }, ev.newValue);
    });

    $("connect_sensor").onclick = function() {
        sensors.postMessage(["rtc_0", "Hello World"], "*");
    }

    $("run_file_execute").onclick = execute_file; 
    async function execute_file (event) {
        $("run_file_execute").onclick = null;
        $("run_file_path").style.backgroundColor = "green";
        enable = true;
        await command_new_socket(); // Create global WS connection.
        require($("run_file_path").value);
    };

    $("run_file_stop").onclick = stop_execute_file; 
    function stop_execute_file (event) {
        $("run_file_execute").onclick = execute_file;
        $("run_file_path").style.backgroundColor = "red";
        command_close_socket();
        enable = false;
    };
    
    document.onkeydown = function (event) {
        if (event.ctrlKey || event.altKey){
            if(event.key == "Enter"){
                window.open("", "editor").focus()
            }
        }
        if(event.key == " "){
            $("run_file_execute").click();
        }
        if(event.key == "Escape"){
            $("run_file_stop").click();
        }
    };
});

