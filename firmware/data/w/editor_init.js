var pressed = false;
var button;

window.onload = function () {
    document.getElementById("editor_code_doc_start").onclick = function () {
        if(pressed) return;
        pressed = true;
        button = document.getElementById("editor_code_doc_start")
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            button.innerText += "."
            if(this.readyState == 4 && this.status == 200)
                console.log("DONE");
        };
        req.onloadend = function () {
            if(this.status != 200)
                return document.getElementById("editor_code_doc_start").click();
            doc = document.getElementById("editor_code_doc");
            script = document.createElement('script');
            script.id = "editor.js";
            script.innerHTML = this.response;
            doc.removeChild(button);
            document.head.appendChild(script);
        };
        req.onerror = req.onabort = req.ontimeout = function () {
            document.getElementById("editor_code_doc_start").click();
        }
        req.timeout = 10000;
        req.open("GET", "./editor.js", true);
        req.send();
        button.innerText = "Loading";
    }
};
