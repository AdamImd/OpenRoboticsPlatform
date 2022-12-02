import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
  input: "./editor.js",
  output: {
    file: "./out/editor.bundle.js",
    format: "iife",
    name: "code_mirror_init"
  },
  plugins: [nodeResolve()]
}

