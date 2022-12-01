#!/bin/env python3

from pathlib import Path

import shutil
import sys
import glob

def form(data, rep):
    for tag in rep.keys():
        data = data.replace(tag, rep[tag])
    return data

if(len(sys.argv)>1):
    shutil.rmtree("../data", ignore_errors=True)
shutil.copytree("./data_src/", "../data/", dirs_exist_ok=True)

repl = dict()
for f in glob.iglob("./macro/**/*", recursive=True):
    with open(f, "r") as r:
        repl[f.split('/')[-1]]=r.read()

for f in glob.iglob("../data/**/*.html", recursive=True):
    dat = ""
    with open(f, "r") as r:
        dat = form(r.read(), repl)
    with open(f, "w") as w:
        w.write(dat)
