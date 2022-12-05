#!/bin/bash

platformio run --target buildfs --environment nodemcu 
platformio run --target uploadfs --environment nodemcu 