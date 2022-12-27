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
};
