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
};

var run_window = null;
run.onclick = function () {
  save.click();
  localStorage.setItem("exe_file_name", files[editor.tab_id][1]);
  if(run_window == null || run_window.closed)
    run_window = window.open("/w/run.html", "run_window");
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
      $(editor.tab_id).classList.add("unsaved_tab");
    return tr.docChanged ? value + 1 : value 
  }
});


//--------------------------------------

new_tab.onclick = function () {
  open_tab(null, "");
};

async function open_tab(name, text = null) {
  if(name){
    var keys = Object.keys(files);
    for (let i = 0; i < keys.length; i++) {
      if(name == files[keys[i]][1]){
        return $(keys[i]).click();
      }
    }
  }

  if (text == null){
    var sock = await command_new_socket(false);
    text = await read_file_command(name, sock);
    command_close_socket(sock);
  }

  var tab = document.createElement("div")
  tab.setAttribute("id", "tab_"+file_id++);
  tab.setAttribute("class", "editor_tab");
  tab.addEventListener("click", editor_tab_click);
  if(name != null)
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

  tab.click();
};

function editor_tab_click(event) {
  if($(editor.tab_id)){
    files[editor.tab_id] = [editor.state, editor.name];
    $(editor.tab_id).classList.remove("editor_tab_selected");
  }
  editor.setState(files[event.target.id][0]);
  editor.name = files[event.target.id][1]
  editor.tab_id = event.target.id;
  $(editor.tab_id).classList.add("editor_tab_selected");
}

//----------------------------

async function editor_save_tab(){
  var new_file;
  var file_path = files[editor.tab_id][1];
  console.log(file_path);
  console.log(editor.tab_id);
  if(file_path == "" || file_path == null){
    new_file = true;
    file_path = prompt("Enter file save path: ");
    if(file_path == "" || file_path == null) 
      return
    else {
      if(file_path[0] != '/') file_path = "/" + file_path;
      files[editor.tab_id][1] = file_path;
      $(editor.tab_id).textContent = file_path;
      editor.name = file_path;
    }
  } else{
    new_file = false;
  }

  console.log("Here");
  
  var file_text = "";
  if(editor.state.doc.text)
    file_text = editor.state.doc.text.join("\n");
  else if(editor.state.doc.children){
    editor.state.doc.children.forEach(doc => {
      file_text += doc.text.join("\n") + "\n";
    }); } 
  else
    return; // TODO: Error
  
  var sock = await command_new_socket(false);
  await save_file_command(file_path, file_text, sock);
  command_close_socket(sock);

  if(new_file) editor_nav_init(open_tab);
  $(editor.tab_id).classList.remove("unsaved_tab");
}

//----------------------------

editor_nav_init(open_tab);
new_tab.click();