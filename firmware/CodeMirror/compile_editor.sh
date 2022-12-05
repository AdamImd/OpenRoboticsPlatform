#!/bin/bash

rm ./out/*
./node_modules/.bin/rollup -c --validate
./node_modules/.bin/terser ./out/editor.bundle.js -o ./out/editor.bundle.min.js
gzip --best -kcvf ./out/editor.bundle.min.js > ./out/editor.bundle.min.js.gz

cp ./out/editor.bundle.min.js.gz ../data/w/editor.js
#cp ./out/editor.bundle.min.js ../data/w/editor.js
ls -lh ./out
