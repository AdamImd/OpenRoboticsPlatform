#!/bin/env python3

from pathlib import Path

import shutil
import sys
import glob
import re

def form(data, rep):
    for tag in rep.keys():
        re_str = rep[tag][0][0] + "(.*?)" + rep[tag][0][1]
        data = re.sub(re_str, rep[tag][1], data, flags=re.DOTALL)
    return data

repl = dict()
for f in glob.iglob("./macro/**/*", recursive=True):
    with open(f, "r") as r:
        repl[f.split('/')[-1]]=(f.split('/')[-1].split("&") ,r.read())

for f in glob.iglob("../data/**/*.html", recursive=True):
    dat = ""
    with open(f, "r") as r:
        dat = form(r.read(), repl)
    with open(f, "w") as w:
        w.write(dat)
