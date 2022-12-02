#!/bin/bash

rm ./out/*
./node_modules/.bin/rollup -c --validate
./node_modules/.bin/terser -c ./out/editor.bundle.js -o ./out/editor.bundle.min.js
#./node_modules/.bin/terser ./out/editor.bundle.js -o ./out/editor.bundle.min.js
gzip --best -kcvf ./out/editor.bundle.min.js > ./out/editor.bundle.min.js.gz