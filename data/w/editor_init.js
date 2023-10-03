window.addEventListener("load",  function () {
    $("editor_code_doc_start").onclick = async function () {
        window.name="editor";
        var button = this;
        button.onclick = null;
        button.innerText = "Loading";
        var data = await read_file_HTTP("/w/editor.js", function(){ button.innerText += "."; });
        $("editor_code_doc").removeChild(button);
        window.eval(data);
    };
});
