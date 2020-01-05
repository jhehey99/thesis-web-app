#!/bin/bash
tmpPath=$1
echo "Deleting Files and Directories in $tmpPath"
ls -R "$tmpPath/"
rm -r "$tmpPath"
mkdir "$tmpPath"
