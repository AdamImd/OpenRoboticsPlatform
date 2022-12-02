import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

export default function code_mirror_init(parent_element){
  let edit = new EditorView({
    extensions: [basicSetup, javascript()],
    parent: parent_element
  });
}