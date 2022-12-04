#!/bin/bash

rm ./out/*
./node_modules/.bin/rollup -c --validate
./node_modules/.bin/terser ./out/editor.bundle.js -o ./out/editor.bundle.min.js
gzip --best -kcvf ./out/editor.bundle.min.js > ./out/editor.bundle.min.js.gz

cp ./out/editor.bundle.js ../data/w/
ls -lh ./out
