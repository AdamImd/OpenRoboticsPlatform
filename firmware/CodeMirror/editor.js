import {EditorState, StateField} from "@codemirror/state"
import {basicSetup} from "codemirror"
import {indentWithTab} from "@codemirror/commands"
import {EditorView, keymap} from "@codemirror/view"
import {javascript, esLint} from "@codemirror/lang-javascript"
import {linter, lintGutter} from "@codemirror/lint";
import "eslint-linter-browserify"

var editor;
var changes;
var file_id;
var files = {};

var save, run, new_tab;

const config = {
	// eslint configuration
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	env: {
		browser: true,
		node: true,
	},
	rules: {
		semi: ["warn", "always"],
	},
};


file_id = 0;
save = document.getElementById("save_tab");
run = document.getElementById("run_tab");
new_tab = document.getElementById("new_tab");

document.onkeydown = function (event) {
  if (event.ctrlKey || event.altKey) {
    if(event.key == "s"){
      event.preventDefault();      ;
      save.click();
    }
  }
  if (event.altKey){
    if(event.key == "Enter"){
      event.preventDefault();
      run.click();
    }
    if(event.key == "t"){
      event.preventDefault();
      new_tab.click();
    }
    //console.log(event.key);
  }
};

save.onclick = function () {
  editor_save_tab();
  document.getElementById(editor.tab_id).className = "editor_tab";
};

var run_window = null;
run.onclick = function () {
  console.log("RUNING");
  localStorage.setItem("exe_file_name", files[editor.tab_id][1]);
  if(run_window == null || run_window.closed)
    run_window = window.open("./run.html", "run_window");
  else
    run_window.focus();
};

editor = new EditorView({
  extensions: [
    basicSetup, 
    keymap.of([indentWithTab]), 
    javascript(),
    lintGutter(),
    linter(esLint(new eslint.Linter(), config)),
  ],
  parent: document.getElementById("editor_code_doc"),
});

changes = StateField.define({
  create() { return 0 },
  update(value, tr) { 
    if(tr.docChanged)
      document.getElementById(editor.tab_id).className = "unsaved_tab"
    return tr.docChanged ? value + 1 : value 
  }
});


//--------------------------------------

  
new_tab.onclick = function () {
  open_tab("", "");
};

function open_tab(name, text) {
  var tab = document.createElement("div")
  tab.setAttribute("id", "tab_"+file_id++);
  tab.setAttribute("class", "editor_tab");
  tab.addEventListener("click", editor_tab_click);
  if(name != "")
    tab.textContent = name;
  else
    tab.textContent = "New Tab: " + tab.id;
  document.getElementById("editor_code_butons_tab").appendChild(tab)
  files[tab.id] = [
    EditorState.create({
    doc: text,
    extensions: [
      basicSetup, 
      keymap.of([indentWithTab]), 
      javascript(),
      lintGutter(),
      linter(esLint(new eslint.Linter(), config)),
      changes,
    ]}),
    name,
  ];
  if(editor.tab_id)
    files[editor.tab_id][0] = editor.state;
  editor.setState(files[tab.id][0]);
  editor.tab_id = tab.id;
};


function editor_tab_click(event) {
  files[editor.tab_id][0] = editor.state;
  editor.setState(files[event.target.id][0]);
  editor.tab_id = event.target.id;
  document.title = editor.tab_id;
  console.log(editor.state.doc)
}

//----------------------------

function editor_save_new_filename(){
  return prompt("Enter file save path: ");
}

function editor_save_tab(){
  var file_path = files[editor.tab_id][1];
  while(file_path == "")
    file_path = editor_save_new_filename();
    files[editor.tab_id][1] = file_path;
    $(editor.tab_id).textContent = file_path;
  console.log(file_path);
  console.log(editor.state);
  
  var data;
  var size = 512;
  var encoder = new TextEncoder();
  var encoded_text = "";
  if(editor.state.doc.text)
    encoded_text= encoder.encode(editor.state.doc.text.join("\n"));
  else if(editor.state.doc.children){
    editor.state.doc.children.forEach(doc => {
      encoded_text += doc.text.join("\n") + "\n";
    });
    encoded_text= encoder.encode(encoded_text);
  } else {
    // TODO: ERROR!
    return;
  }
  console.log(encoded_text);

  var socket = new WebSocket("ws://" + location.hostname + ":81/");
  socket.binaryType = "arraybuffer";

  socket.addEventListener("message", function(event){
      console.log(event.data);
      if(event.data == ""){
        console.log("Send 3");
        socket.close();
          return;
      } else if (event.data == "\x01") {
        console.log("Send 2");
        console.log(data);
        console.log(encoded_text.length);
        if(data >= encoded_text.length){
          console.log("SENDING FIN");
          socket.send("\x01");
        }else {
          console.log("SENDING data");
          socket.send(encoded_text.slice(data, data+size));
          data += size;
        }
      } else {
        socket.close();
      }
  });

  socket.addEventListener("error", function(event){
      console.log(event);
      socket.close();
  });

  var buffer = new ArrayBuffer(128)
  var buffer_num = new Uint16Array(buffer);
  var buffer_chr = new Uint8Array(buffer);
  buffer_num[0] = 2;
  for (let i = 0; i  < file_path.length; i++)
      buffer_chr[2+i] = Math.min(file_path.charCodeAt(i), 255);
      // TODO: UTF-8

  socket.addEventListener("open", function(event){
      data = 0
      socket.send(buffer);
      console.log("Send 1");
  });
}


//----------------------------

editor_nav_init(open_file, open_tab);