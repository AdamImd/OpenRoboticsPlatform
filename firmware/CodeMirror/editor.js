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
		ecmaVersion: 2019,
		sourceType: "module",
	},
	env: {
		browser: true,
		node: true,
	},
	rules: {
		semi: ["error", "never"],
	},
};

//window.onload = function () {
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
  document.getElementById(editor.tab_id).className = "editor_tab"
  //TODO: Actually save
};

run.onclick = function () {
  console.log("RUNING");
  //TODO: Actually run
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


new_tab.onclick = function () {
  var tab = document.createElement("div")
  tab.setAttribute("id", "tab_"+file_id++);
  tab.setAttribute("class", "editor_tab");
  tab.addEventListener("click", editor_tab_click);
  tab.textContent = tab.id;
  document.getElementById("editor_code_butons_tab").appendChild(tab)
  files[tab.id] = EditorState.create({
    doc: tab.id,
    extensions: [
      basicSetup, 
      keymap.of([indentWithTab]), 
      javascript(),
      lintGutter(),
      linter(esLint(new eslint.Linter(), config)),
      changes,
    ]});
  if(editor.tab_id)
    files[editor.tab_id] = editor.state;
  editor.setState(files[tab.id]);
  editor.tab_id = tab.id;
};
//};

function editor_tab_click(event) {
  files[editor.tab_id] = editor.state;
  editor.setState(files[event.target.id]);
  editor.tab_id = event.target.id;
  document.title = editor.tab_id;
  console.log(editor.state.doc)
}