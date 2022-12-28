function $(doc) {
    return document.getElementById(doc);
}

window.onload = function () {
    editor_nav_init(function(path){ $("run_file_path").value = path; });

    $("run_file_path").value = localStorage.getItem("exe_file_name");

    addEventListener("storage", function(ev){
        if (ev.key!='exe_file_name') return;
        $("run_file_path").value = ev.newValue;
    });

    $("run_file_execute").onclick = function (event) { 
        file_execute($("run_file_path").value)};
    
    document.onkeydown = function (event) {
        if (event.ctrlKey || event.altKey){
            if(event.key == "Enter"){
                console.log("here");
                window.open("", "editor").focus()
            }
        }
        if(event.key == " "){
            event.preventDefault();
            $("run_file_execute").click();
        }
        console.log(event.key);
    };
};


function file_execute(path){
    open_file(path, function(file_path, data) { 
        try{
            eval(data);
        } catch (e) {
            alert(e.lineNumber);
            alert(e.message);
            alert(e.name);
        }});
}