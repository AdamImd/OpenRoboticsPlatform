#!/bin/env python3

from pathlib import Path

import shutil
import sys
import glob
import re

def form(data, rep):
    for replacement in rep:
        re_str = replacement[0][0] + "(.*?)" + replacement[0][1]
        data = re.sub(re_str, replacement[1], data, flags=re.DOTALL)
    return data

repl = []
for f in glob.iglob("./macro/**/*", recursive=True):
    with open(f, "r") as r:
        repl.append([r.readline().split("&"), r.read()])

for f in glob.iglob("../data/**/*.html", recursive=True):
    dat = ""
    with open(f, "r") as r:
        dat = form(r.read(), repl)
    with open(f, "w") as w:
        w.write(dat)
